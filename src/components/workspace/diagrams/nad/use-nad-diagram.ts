/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    ErrorMessageDescriptor,
    extractErrorMessageDescriptor,
    PARAM_LANGUAGE,
    ProblemDetailError,
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
import {
    selectActiveWorkspaceId,
    selectNadDiagramFields,
    selectPanelEditMode,
} from '../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../redux/store';
import { useWorkspacePanelActions } from '../../hooks/use-workspace-panel-actions';
import { isNADPanel } from '../../hooks/workspace-panel-utils';
import { useDirectoryElementListener } from '../../../../hooks/use-directory-element-listener';
import { type NadEdit, NadEditType, type NadSnapshot, useNadEditHistory } from './nad-edit-history';

interface UseNadDiagramProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
    onNadReplaced: () => void;
}

const NAD_CONFIG_SAVE_DEBOUNCE_MS = 700;

const isEmptyDiagramError = (error: unknown) =>
    error instanceof ProblemDetailError && error.businessErrorCode === 'diagram.noVoltageLevelFound';

const hasStoredVoltageLevels = (
    source?: Pick<NetworkAreaDiagram, 'currentNadConfigUuid' | 'nadConfigUuid' | 'filterUuid'>
) => Boolean(source?.currentNadConfigUuid || source?.nadConfigUuid || source?.filterUuid);

const isFilterDeleted = ({
    filterUuid,
    deletedFilterUuid,
}: Pick<NetworkAreaDiagram, 'filterUuid' | 'deletedFilterUuid'>) => !!filterUuid && filterUuid === deletedFilterUuid;

const getDrawnFilterUuid = (diagram: Pick<NetworkAreaDiagram, 'filterUuid' | 'deletedFilterUuid'>) =>
    isFilterDeleted(diagram) ? undefined : diagram.filterUuid;

const getDrawnVoltageLevelIds = (svg: DiagramSvg | null) =>
    svg?.additionalMetadata?.voltageLevels.map((vl) => vl.id) ?? [];

// Its own voltage levels, or in filter mode those its filter matches on the current node
const getShownVoltageLevelIds = (
    diagram: Pick<NetworkAreaDiagram, 'svg' | 'voltageLevelIds' | 'filterUuid' | 'deletedFilterUuid'>
) => (getDrawnFilterUuid(diagram) ? getDrawnVoltageLevelIds(diagram.svg) : diagram.voltageLevelIds);

const applyEdit = (diagram: NetworkAreaDiagram, edit: NadEdit): Partial<NetworkAreaDiagram> | undefined => {
    const { svg, voltageLevelIds, voltageLevelToExpandIds, voltageLevelToOmitIds, filterUuid, positions } = diagram;
    switch (edit.type) {
        case NadEditType.MOVE_NODE:
        case NadEditType.MOVE_LABEL:
            return {
                positions: positions.map((position) =>
                    position.voltageLevelId === edit.voltageLevelId ? { ...position, ...edit.position } : position
                ),
            };
        case NadEditType.ADD_VOLTAGE_LEVEL:
            if (voltageLevelIds.includes(edit.voltageLevelId)) {
                return undefined;
            }
            return {
                voltageLevelIds: [...voltageLevelIds, edit.voltageLevelId],
                voltageLevelToOmitIds: voltageLevelToOmitIds.filter((id) => id !== edit.voltageLevelId),
            };
        case NadEditType.ADD_FROM_FILTER:
            return { filterToAddUuid: edit.filterUuid };
        case NadEditType.EXPAND:
            return {
                voltageLevelIds: voltageLevelIds.filter((id) => id !== edit.voltageLevelId),
                voltageLevelToExpandIds: [...voltageLevelToExpandIds, edit.voltageLevelId],
            };
        case NadEditType.EXPAND_ALL:
            return { voltageLevelToExpandIds: getDrawnVoltageLevelIds(svg) };
        case NadEditType.HIDE:
            return {
                voltageLevelIds: voltageLevelIds.filter((id) => id !== edit.voltageLevelId),
                voltageLevelToOmitIds: [...voltageLevelToOmitIds, edit.voltageLevelId],
            };
        case NadEditType.APPLY_FILTER:
            if (edit.filterUuid === filterUuid) {
                return undefined;
            }
            // Like a NAD loaded from the filter
            return {
                filterUuid: edit.filterUuid,
                filterName: edit.filterName,
                voltageLevelIds: [],
                voltageLevelToOmitIds: [],
            };
        case NadEditType.REMOVE_FILTER:
            return { filterUuid: undefined, filterName: undefined, voltageLevelIds: getShownVoltageLevelIds(diagram) };
    }
};

const sameIds = (a: string[], b: string[]) => a === b || (a.length === b.length && a.every((id, i) => id === b[i]));

const isLayoutOnlyChange = (from: NadSnapshot, to: NadSnapshot) =>
    sameIds(from.voltageLevelIds, to.voltageLevelIds) &&
    sameIds(from.voltageLevelToOmitIds, to.voltageLevelToOmitIds) &&
    from.filterUuid === to.filterUuid;

// Positions keep their order and are only appended to, so they can be compared by index
const changedPositions = (from: DiagramConfigPosition[], to: DiagramConfigPosition[]) =>
    to.filter((position, index) => position !== from[index]);

const BASE_RESET_STATE = {
    voltageLevelIds: [],
    voltageLevelToExpandIds: [],
    filterToAddUuid: undefined,
    positions: [],
    currentNadConfigUuid: undefined,
    voltageLevelToOmitIds: [],
    svg: null,
};

export const useNadDiagram = ({
    panelId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
    onNadReplaced,
}: UseNadDiagramProps) => {
    const { updateNADFields } = useWorkspacePanelActions();
    const initialFields = useSelector((state: RootState) => selectNadDiagramFields(state, panelId));
    const workspaceId = useSelector((state: RootState) => selectActiveWorkspaceId(state));
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);
    const isEditMode = useSelector((state: RootState) => selectPanelEditMode(state, panelId));

    const isStored = hasStoredVoltageLevels(initialFields);
    const canFetchDiagram = isStored || Boolean(initialFields?.initialVoltageLevelIds?.length);

    const [diagram, setDiagram] = useState<NetworkAreaDiagram>(() => ({
        type: DiagramType.NETWORK_AREA_DIAGRAM,
        svg: null,
        title: initialFields?.title,
        nadConfigUuid: initialFields?.nadConfigUuid,
        filterUuid: initialFields?.filterUuid,
        filterName: initialFields?.filterName,
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

    const { history, recordEdit, restoreState, clearHistory } = useNadEditHistory(isEditMode);

    const saveNad = useCallback(() => {
        if (!workspaceId) {
            return Promise.resolve();
        }
        const { svg, title, voltageLevelIds, positions, voltageLevelToOmitIds, nadConfigUuid, filterUuid, filterName } =
            diagramRef.current;

        return saveNadConfig(studyUuid, workspaceId, panelId, {
            title,
            nadConfig: { scalingFactor: svg?.additionalMetadata?.scalingFactor, voltageLevelIds, positions },
            nadConfigUuid,
            filterUuid,
            filterName,
            voltageLevelToOmitIds,
        }).then((savedUuid) => updateDiagram({ currentNadConfigUuid: savedUuid ?? undefined }));
    }, [studyUuid, workspaceId, panelId, updateDiagram]);

    // Nothing waits for the debounced saves: their failures are only logged
    const saveNadAndLogError = useCallback(() => {
        saveNad().catch((error) => console.error('Failed to save NAD config:', error));
    }, [saveNad]);

    const debounceSaveNad = useDebounce(saveNadAndLogError, NAD_CONFIG_SAVE_DEBOUNCE_MS);

    const processSvgData = useCallback(
        (svgData: DiagramSvg | null) => {
            if (!svgData) return;

            const vlIdsFromSvg = getDrawnVoltageLevelIds(svgData);

            console.info(`Number of voltage levels for NAD panel '${panelId}' : '${vlIdsFromSvg.length}'`);

            const current = diagramRef.current;
            const { voltageLevelIds, voltageLevelToOmitIds, positions } = current;
            updateDiagram({
                svg: svgData,
                // In filter mode, the diagram has no voltage levels of its own
                voltageLevelIds: getDrawnFilterUuid(current)
                    ? voltageLevelIds
                    : [...new Set([...voltageLevelIds, ...vlIdsFromSvg])],
                voltageLevelToExpandIds: [],
                filterToAddUuid: undefined,
                voltageLevelToOmitIds: voltageLevelToOmitIds.filter((id) => !vlIdsFromSvg.includes(id)),
                positions: mergePositions(positions, svgData.metadata ?? undefined),
            });
        },
        [panelId, updateDiagram]
    );

    const handleFetchError = useCallback((error: any) => {
        setGlobalError(extractErrorMessageDescriptor(error, ''));
    }, []);

    // Resolves to whether the diagram was drawn
    const fetchDiagram = useCallback(async () => {
        if (!canFetchDiagram || !networkVisuParams) {
            setLoading(true);
            return false;
        }

        if (!currentNode || !isNodeBuilt(currentNode)) {
            // Abort any still pending fetch so its late response can't overwrite this error
            abortControllerRef.current?.abort();
            setGlobalError({ descriptor: { id: 'InvalidNode' } });
            setLoading(false);
            return false;
        }

        // Abort any still pending fetch so its response can be ignored
        abortControllerRef.current?.abort();
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setLoading(true);
        setGlobalError(undefined);

        try {
            const current = diagramRef.current;
            const body = {
                nadPositionsGenerationMode: networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
                voltageLevelIds: current.voltageLevelIds,
                voltageLevelToExpandIds: current.voltageLevelToExpandIds,
                voltageLevelToOmitIds: current.voltageLevelToOmitIds,
                nadConfigUuid: current.currentNadConfigUuid || current.nadConfigUuid,
                filterUuid: getDrawnFilterUuid(current) ?? current.filterToAddUuid,
                language,
            };
            const svgData = await fetchSvg(getNetworkAreaDiagramUrl(studyUuid, currentNodeId, currentRootNetworkUuid), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: abortController.signal,
            });
            processSvgData(svgData as DiagramSvg | null);

            // From a config or a filter the server rebuilds the diagram, only a panel whose
            // voltage levels live nowhere else needs a config of its own
            if (!hasStoredVoltageLevels(current)) {
                debounceSaveNad();
            }
            return true;
        } catch (error) {
            // a newer fetchDiagram call already aborted this request, so its response is no longer relevant
            if (abortController.signal.aborted) {
                return false;
            }
            if (isEmptyDiagramError(error)) {
                // Not an error: an empty diagram, which can still be edited
                updateDiagram({ svg: null, voltageLevelToExpandIds: [], filterToAddUuid: undefined });
                return true;
            }
            handleFetchError(error);
            return false;
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        }
    }, [
        currentNode,
        language,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
        processSvgData,
        updateDiagram,
        handleFetchError,
        debounceSaveNad,
        canFetchDiagram,
        networkVisuParams,
    ]);

    // The server draws from the saved config, so it is saved first. Loading from the start, so nothing can be edited
    // meanwhile.
    const saveAndFetchDiagram = useCallback(() => {
        debounceSaveNad.clear();
        setLoading(true);
        saveNad()
            .then(() => fetchDiagram())
            .catch((error) => {
                handleFetchError(error);
                setLoading(false);
            });
    }, [debounceSaveNad, saveNad, fetchDiagram, handleFetchError]);

    const editDiagram = useCallback(
        async (edit: NadEdit) => {
            const current = diagramRef.current;
            const updates = applyEdit(current, edit);
            if (!updates) {
                return;
            }
            recordEdit(current, edit);
            updateDiagram(updates);

            switch (edit.type) {
                case NadEditType.MOVE_NODE:
                case NadEditType.MOVE_LABEL:
                case NadEditType.REMOVE_FILTER:
                    // Already shown by the viewer
                    debounceSaveNad();
                    break;
                case NadEditType.APPLY_FILTER:
                    // Otherwise the saved voltage levels would be drawn along with the filter
                    saveAndFetchDiagram();
                    break;
                default:
                    // Drawn first, to save what the server adds, like the neighbours of an expanded voltage level
                    if (await fetchDiagram()) {
                        debounceSaveNad();
                    }
            }
        },
        [recordEdit, updateDiagram, debounceSaveNad, saveAndFetchDiagram, fetchDiagram]
    );

    // Returns the positions the viewer has to move nodes and labels to, none when the diagram is drawn again
    const restoreHistoryState = useCallback(
        (target: number): DiagramConfigPosition[] => {
            const current = diagramRef.current;
            const restored = restoreState(target, current);
            if (!restored) {
                return [];
            }
            updateDiagram(restored);

            if (isLayoutOnlyChange(current, restored)) {
                debounceSaveNad();
                return changedPositions(current.positions, restored.positions);
            }
            saveAndFetchDiagram();
            return [];
        },
        [restoreState, updateDiagram, debounceSaveNad, saveAndFetchDiagram]
    );

    const replaceDiagram = useCallback(
        (definition: Partial<NetworkAreaDiagram>) => {
            // A new history: going back would undo another client's change
            clearHistory();
            updateDiagram({ ...BASE_RESET_STATE, ...definition });
            const { title, nadConfigUuid, filterUuid, filterName, currentNadConfigUuid, voltageLevelToOmitIds } =
                diagramRef.current;
            updateNADFields({
                panelId,
                fields: {
                    title,
                    nadConfigUuid,
                    filterUuid,
                    filterName,
                    currentNadConfigUuid,
                    voltageLevelToOmitIds,
                },
            });
            fetchDiagram();
        },
        [panelId, clearHistory, updateDiagram, updateNADFields, fetchDiagram]
    );

    const replaceNadConfig = useCallback(
        (title: string, nadConfigUuid?: UUID, filterUuid?: UUID) => {
            if (!workspaceId) {
                return;
            }
            // A layout save queued before the replace would write back the NAD being left
            debounceSaveNad.clear();
            const filterName = filterUuid ? title : undefined;

            saveNadConfig(studyUuid, workspaceId, panelId, {
                title,
                nadConfig: null,
                nadConfigUuid,
                filterUuid,
                filterName,
                voltageLevelToOmitIds: [],
            }).catch((error) => console.error('Failed to replace NAD config:', error));

            replaceDiagram({ title, nadConfigUuid, filterUuid, filterName });
            // The user's own choice to load: reset even if it's the same NAD again
            onNadReplaced();
        },
        [workspaceId, studyUuid, panelId, debounceSaveNad, replaceDiagram, onNadReplaced]
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
                // Unlike the Load button, this also fires for edits to this same NAD by another client
                // (moves, expands...): only reset if its config or filter actually changed
                const isAnotherNad =
                    panel.nadConfigUuid !== diagramRef.current.nadConfigUuid ||
                    panel.filterUuid !== diagramRef.current.filterUuid;
                replaceDiagram({
                    title: panel.title,
                    nadConfigUuid: panel.nadConfigUuid,
                    filterUuid: panel.filterUuid,
                    filterName: panel.filterName,
                    currentNadConfigUuid: panel.currentNadConfigUuid,
                    voltageLevelToOmitIds: panel.voltageLevelToOmitIds || [],
                });
                if (isAnotherNad) {
                    onNadReplaced();
                }
            })
            .catch((error) => console.error('Failed to fetch updated NAD panel:', error));
    }, [studyUuid, workspaceId, panelId, replaceDiagram, onNadReplaced]);

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

    // The filter stays, shown as deleted, until the user removes or changes it. The diagram becomes a list of the
    // voltage levels it showed, so the history restarts: its states have no list to go back to.
    const handleFilterDeleted = useCallback(() => {
        const current = diagramRef.current;
        if (isFilterDeleted(current)) {
            return;
        }
        clearHistory();
        updateDiagram({
            deletedFilterUuid: current.filterUuid,
            voltageLevelIds: getDrawnVoltageLevelIds(current.svg),
        });
        if (current.svg) {
            // Already shown
            debounceSaveNad();
        } else {
            // Nothing shown, its drawing failed or was empty: drawn again without the filter
            fetchDiagram();
        }
    }, [clearHistory, updateDiagram, debounceSaveNad, fetchDiagram]);

    // In filter mode, the diagram follows its filter in GridExplore
    useDirectoryElementListener(diagram.filterUuid, {
        onName: (filterName) => {
            if (filterName !== diagramRef.current.filterName) {
                updateDiagram({ filterName });
            }
        },
        onUpdate: fetchDiagram,
        onDelete: handleFilterDeleted,
    });

    const { svg, voltageLevelIds, filterUuid, deletedFilterUuid } = diagram;
    const shownVoltageLevelIds = useMemo(
        () => getShownVoltageLevelIds({ svg, voltageLevelIds, filterUuid, deletedFilterUuid }),
        [svg, voltageLevelIds, filterUuid, deletedFilterUuid]
    );

    return {
        diagram,
        shownVoltageLevelIds,
        isFilterDeleted: isFilterDeleted(diagram),
        loading,
        globalError,
        editDiagram,
        replaceNadConfig,
        history,
        restoreHistoryState,
    };
};
