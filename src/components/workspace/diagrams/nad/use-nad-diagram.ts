/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    ErrorMessageDescriptor,
    extractErrorMessageDescriptor,
    PARAM_LANGUAGE,
    useDebounce,
} from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer.type';
import { DiagramType, type DiagramSvg, NetworkAreaDiagram } from '../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg, getNetworkAreaDiagramUrl } from '../../../../services/study';
import { getPanels, saveNadConfig } from '../../../../services/study/workspace';
import { mergePositions } from '../../../grid-layout/cards/diagrams/diagram-utils';
import type { DiagramConfigPosition } from '../../../../services/explore';
import { useDiagramNotifications } from '../common/use-diagram-notifications';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { selectActiveWorkspaceId, selectNadDiagramFields } from '../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../redux/store';
import { useWorkspacePanelActions } from '../../hooks/use-workspace-panel-actions';
import { isNADPanel } from '../../hooks/workspace-panel-utils';

interface UseNadDiagramProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

const NAD_CONFIG_SAVE_DEBOUNCE_MS = 700;

const hasStoredVoltageLevels = (
    source?: Pick<NetworkAreaDiagram, 'currentNadConfigUuid' | 'nadConfigUuid' | 'filterUuid'>
) => Boolean(source?.currentNadConfigUuid || source?.nadConfigUuid || source?.filterUuid);

const BASE_RESET_STATE = {
    currentFilterUuid: undefined,
    voltageLevelIds: [],
    voltageLevelToExpandIds: [],
    positions: [],
    currentNadConfigUuid: undefined,
    voltageLevelToOmitIds: [],
    svg: null,
};

export const useNadDiagram = ({ panelId, studyUuid, currentNodeId, currentRootNetworkUuid }: UseNadDiagramProps) => {
    const { updateNADFields } = useWorkspacePanelActions();
    const initialFields = useSelector((state: RootState) => selectNadDiagramFields(state, panelId));
    const workspaceId = useSelector((state: RootState) => selectActiveWorkspaceId(state));
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);

    const isStored = hasStoredVoltageLevels(initialFields);
    const canFetchDiagram = isStored || Boolean(initialFields?.initialVoltageLevelIds?.length);

    const [diagram, setDiagram] = useState<NetworkAreaDiagram>(() => ({
        type: DiagramType.NETWORK_AREA_DIAGRAM,
        svg: null,
        title: initialFields?.title,
        nadConfigUuid: initialFields?.nadConfigUuid,
        filterUuid: initialFields?.filterUuid,
        currentFilterUuid: initialFields?.currentFilterUuid,
        currentNadConfigUuid: initialFields?.currentNadConfigUuid,
        voltageLevelIds: isStored ? [] : initialFields?.initialVoltageLevelIds || [],
        voltageLevelToExpandIds: [],
        voltageLevelToOmitIds: initialFields?.voltageLevelToOmitIds || [],
        positions: [],
    }));
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<ErrorMessageDescriptor | undefined>();

    const abortControllerRef = useRef<AbortController | undefined>(undefined);

    const diagramRef = useRef(diagram);

    const updateDiagram = useCallback((updates: Partial<NetworkAreaDiagram>) => {
        diagramRef.current = { ...diagramRef.current, ...updates };
        setDiagram(diagramRef.current);
    }, []);

    const saveNad = useCallback(() => {
        if (!workspaceId) {
            return;
        }
        const {
            svg,
            title,
            voltageLevelIds,
            positions,
            voltageLevelToOmitIds,
            nadConfigUuid,
            filterUuid,
            currentFilterUuid,
        } = diagramRef.current;

        saveNadConfig(studyUuid, workspaceId, panelId, {
            title,
            nadConfig: { scalingFactor: svg?.additionalMetadata?.scalingFactor, voltageLevelIds, positions },
            nadConfigUuid,
            filterUuid,
            currentFilterUuid,
            voltageLevelToOmitIds,
        })
            .then((savedUuid) => updateDiagram({ currentNadConfigUuid: savedUuid ?? undefined }))
            .catch((error) => console.error('Failed to save NAD config:', error));
    }, [studyUuid, workspaceId, panelId, updateDiagram]);

    const debounceSaveNad = useDebounce(saveNad, NAD_CONFIG_SAVE_DEBOUNCE_MS);

    const processSvgData = useCallback(
        (svgData: DiagramSvg | null) => {
            if (!svgData) return;

            const vlIdsFromSvg = svgData.additionalMetadata?.voltageLevels.map((vl) => vl.id) ?? [];

            console.info(`Number of voltage levels for NAD panel '${panelId}' : '${vlIdsFromSvg.length}'`);

            const { voltageLevelIds, voltageLevelToOmitIds, positions } = diagramRef.current;
            updateDiagram({
                svg: svgData,
                voltageLevelIds: [...new Set([...voltageLevelIds, ...vlIdsFromSvg])],
                voltageLevelToExpandIds: [],
                voltageLevelToOmitIds: voltageLevelToOmitIds.filter((id) => !vlIdsFromSvg.includes(id)),
                positions: mergePositions(positions, svgData.metadata ?? undefined),
            });
        },
        [panelId, updateDiagram]
    );

    const handleFetchError = useCallback((error: any) => {
        setGlobalError(extractErrorMessageDescriptor(error, ''));
    }, []);

    const fetchDiagram = useCallback(
        (persistAfterFetch = false) => {
            if (!canFetchDiagram || !networkVisuParams) {
                setLoading(true);
                return;
            }

            if (!currentNode || !isNodeBuilt(currentNode)) {
                // Abort any still pending fetch so its late response can't overwrite this error
                abortControllerRef.current?.abort();
                setGlobalError({ descriptor: { id: 'InvalidNode' } });
                setLoading(false);
                return;
            }

            // Abort any still pending fetch so its response can be ignored
            abortControllerRef.current?.abort();
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            setLoading(true);
            setGlobalError(undefined);

            const current = diagramRef.current;
            const body = {
                nadPositionsGenerationMode: networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
                voltageLevelIds: current.voltageLevelIds,
                voltageLevelToExpandIds: current.voltageLevelToExpandIds,
                voltageLevelToOmitIds: current.voltageLevelToOmitIds,
                nadConfigUuid: current.currentNadConfigUuid || current.nadConfigUuid,
                filterUuid: current.currentFilterUuid || current.filterUuid,
                language,
            };

            fetchSvg(getNetworkAreaDiagramUrl(studyUuid, currentNodeId, currentRootNetworkUuid), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: abortController.signal,
            })
                .then((svgData) => {
                    processSvgData(svgData as DiagramSvg | null);
                    // From a config or a filter the server rebuilds the diagram, only a panel whose
                    // voltage levels live nowhere else needs a config of its own
                    if (persistAfterFetch || !hasStoredVoltageLevels(current)) {
                        debounceSaveNad();
                    }
                })
                .catch((error) => {
                    // a newer fetchDiagram call already aborted this request, so its response is no longer relevant
                    if (!abortController.signal.aborted) {
                        handleFetchError(error);
                    }
                })
                .finally(() => {
                    if (!abortController.signal.aborted) {
                        setLoading(false);
                    }
                });
        },
        [
            currentNode,
            language,
            studyUuid,
            currentNodeId,
            currentRootNetworkUuid,
            processSvgData,
            handleFetchError,
            debounceSaveNad,
            canFetchDiagram,
            networkVisuParams,
        ]
    );

    const editDiagram = useCallback(
        (updates: Partial<NetworkAreaDiagram>) => {
            updateDiagram(updates);
            fetchDiagram(true);
        },
        [updateDiagram, fetchDiagram]
    );

    const replaceDiagram = useCallback(
        (definition: Partial<NetworkAreaDiagram>) => {
            updateDiagram({ ...BASE_RESET_STATE, ...definition });
            const { title, nadConfigUuid, filterUuid, currentNadConfigUuid, currentFilterUuid, voltageLevelToOmitIds } =
                diagramRef.current;
            updateNADFields({
                panelId,
                fields: {
                    title,
                    nadConfigUuid,
                    filterUuid,
                    currentNadConfigUuid,
                    currentFilterUuid,
                    voltageLevelToOmitIds,
                },
            });
            fetchDiagram();
        },
        [panelId, updateDiagram, updateNADFields, fetchDiagram]
    );

    const movePosition = useCallback(
        (voltageLevelId: string, position: Partial<DiagramConfigPosition>) => {
            updateDiagram({
                positions: diagramRef.current.positions.map((p) =>
                    p.voltageLevelId === voltageLevelId ? { ...p, ...position } : p
                ),
            });
            debounceSaveNad();
        },
        [updateDiagram, debounceSaveNad]
    );

    const moveNode = useCallback(
        (voltageLevelId: string, x: number, y: number) => movePosition(voltageLevelId, { xPosition: x, yPosition: y }),
        [movePosition]
    );

    const moveTextNode = useCallback(
        (voltageLevelId: string, shiftX: number, shiftY: number) =>
            movePosition(voltageLevelId, { xLabelPosition: shiftX, yLabelPosition: shiftY }),
        [movePosition]
    );

    const replaceNadConfig = useCallback(
        (title: string, nadConfigUuid?: UUID, filterUuid?: UUID) => {
            if (!workspaceId) {
                return;
            }
            // A layout save queued before the replace would write back the NAD being left
            debounceSaveNad.clear();

            saveNadConfig(studyUuid, workspaceId, panelId, {
                title,
                nadConfig: null,
                nadConfigUuid,
                filterUuid,
                currentFilterUuid: undefined,
                voltageLevelToOmitIds: [],
            }).catch((error) => console.error('Failed to replace NAD config:', error));

            replaceDiagram({ title, nadConfigUuid, filterUuid });
        },
        [workspaceId, studyUuid, panelId, debounceSaveNad, replaceDiagram]
    );

    const loadNadConfig = useCallback(() => {
        if (!workspaceId) {
            return;
        }
        getPanels(studyUuid, workspaceId, [panelId])
            .then(([panel]) => {
                if (!panel || !isNADPanel(panel)) {
                    return;
                }
                replaceDiagram({
                    title: panel.title,
                    nadConfigUuid: panel.nadConfigUuid,
                    filterUuid: panel.filterUuid,
                    currentNadConfigUuid: panel.currentNadConfigUuid,
                    currentFilterUuid: panel.currentFilterUuid,
                    voltageLevelToOmitIds: panel.voltageLevelToOmitIds || [],
                });
            })
            .catch((error) => console.error('Failed to fetch updated NAD panel:', error));
    }, [studyUuid, workspaceId, panelId, replaceDiagram]);

    // Fetch on mount, and whenever what the request is built from changes
    useEffect(() => {
        fetchDiagram();
    }, [fetchDiagram]);

    useDiagramNotifications({
        currentRootNetworkUuid,
        onNotification: fetchDiagram,
        panelId,
        onNadConfigUpdate: loadNadConfig,
    });

    return {
        diagram,
        loading,
        globalError,
        editDiagram,
        replaceNadConfig,
        moveNode,
        moveTextNode,
    };
};
