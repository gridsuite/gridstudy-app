/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer';
import { DiagramType, NetworkAreaDiagram } from '../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg, getNetworkAreaDiagramUrl } from '../../../../services/study';
import { saveNadConfig, deleteNadConfig } from '../../../../services/study/workspace';
import { mergePositions } from '../../../grid-layout/cards/diagrams/diagram-utils';
import type { DiagramMetadata } from '@powsybl/network-viewer';
import { useDiagramNotifications } from '../common/use-diagram-notifications';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { useBaseVoltages } from '../../../../hooks/use-base-voltages';
import { selectNadDiagramFields, selectActiveWorkspaceId } from '../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../redux/store';
import { useWorkspaceActions } from '../../hooks/use-workspace-actions';

interface UseNadDiagramProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

// Persistent fields that should sync to Redux
const PERSISTENT_FIELDS = [
    'voltageLevelToOmitIds',
    'currentFilterUuid',
    'savedWorkspaceConfigUuid',
    'nadConfigUuid',
    'filterUuid',
] as const;

export const useNadDiagram = ({ panelId, studyUuid, currentNodeId, currentRootNetworkUuid }: UseNadDiagramProps) => {
    const { updateNADFields } = useWorkspaceActions();
    const initialFields = useSelector((state: RootState) => selectNadDiagramFields(state, panelId));
    const workspaceId = useSelector((state: RootState) => selectActiveWorkspaceId(state));
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const { snackError } = useSnackMessage();
    const { baseVoltagesConfig } = useBaseVoltages();

    const [diagram, setDiagram] = useState<NetworkAreaDiagram>(() => ({
        type: DiagramType.NETWORK_AREA_DIAGRAM,
        svg: null,
        nadConfigUuid: initialFields?.nadConfigUuid,
        filterUuid: initialFields?.filterUuid,
        currentFilterUuid: initialFields?.currentFilterUuid,
        savedWorkspaceConfigUuid: initialFields?.savedWorkspaceConfigUuid,
        voltageLevelIds: initialFields?.initialVoltageLevelIds || [],
        voltageLevelToExpandIds: [],
        voltageLevelToOmitIds: initialFields?.voltageLevelToOmitIds || [],
        positions: [],
    }));
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    // Refs for stable callbacks (React best practice)
    // See: https://react.dev/reference/react/useCallback#updating-state-based-on-previous-state-from-a-callback
    const diagramRef = useRef(diagram);
    const initialVlIdsRef = useRef(initialFields?.initialVoltageLevelIds);

    useEffect(() => {
        diagramRef.current = diagram;
    }, [diagram]);

    // State management with automatic sync
    const setDiagramAndSync = useCallback(
        (updater: React.SetStateAction<NetworkAreaDiagram>) => {
            setDiagram((prev) => {
                const next = typeof updater === 'function' ? updater(prev) : updater;

                const changes: Partial<NetworkAreaDiagram> = {};
                PERSISTENT_FIELDS.forEach((field) => {
                    if (prev[field] !== next[field]) {
                        Object.assign(changes, { [field]: next[field] });
                    }
                });

                if (Object.keys(changes).length > 0) {
                    updateNADFields({ panelId, fields: changes });
                }

                return next;
            });
        },
        [updateNADFields, panelId]
    );

    const fetchDiagram = useCallback(() => {
        if (!currentNode || !isNodeBuilt(currentNode)) {
            setGlobalError('Node not built');
            return Promise.resolve();
        }

        setLoading(true);
        setGlobalError(undefined);

        const currentDiagram = diagramRef.current;

        const body: any = {
            baseVoltagesConfigInfos: baseVoltagesConfig,
            nadPositionsGenerationMode: networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
            voltageLevelIds: currentDiagram.voltageLevelIds,
            voltageLevelToExpandIds: currentDiagram.voltageLevelToExpandIds,
            positions: currentDiagram.positions,
            voltageLevelToOmitIds: currentDiagram.voltageLevelToOmitIds,
            nadConfigUuid: currentDiagram.savedWorkspaceConfigUuid || currentDiagram.nadConfigUuid,
            filterUuid: currentDiagram.currentFilterUuid || currentDiagram.filterUuid,
        };

        const url = getNetworkAreaDiagramUrl(studyUuid, currentNodeId, currentRootNetworkUuid);

        return fetchSvg(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then((svgData) => {
                if (!svgData) return;

                const vlIdsFromSvg =
                    (svgData.additionalMetadata as { voltageLevels?: { id: string }[] })?.voltageLevels?.map(
                        (vl) => vl.id
                    ) ?? [];

                const filteredOmitIds = currentDiagram.voltageLevelToOmitIds.filter((id) => !vlIdsFromSvg.includes(id));

                setDiagramAndSync((prev) => ({
                    ...prev,
                    svg: svgData,
                    voltageLevelIds: [...new Set([...prev.voltageLevelIds, ...vlIdsFromSvg])],
                    voltageLevelToExpandIds: [],
                    voltageLevelToOmitIds: filteredOmitIds,
                    positions: mergePositions(prev.positions, svgData.metadata as DiagramMetadata),
                }));
            })
            .catch((error) => {
                console.error('Error fetching NAD diagram:', error);
                let errorMessage: string;
                if (error?.status === 400) {
                    errorMessage = 'nadConfiguredPositionsModeFailed';
                    snackError({ headerId: errorMessage });
                } else if (error?.status === 404) {
                    errorMessage = 'VoltageLevelNotFound';
                } else if (error?.status === 403) {
                    errorMessage = error.message || 'svgLoadingFail';
                    snackError({ headerId: errorMessage });
                } else {
                    errorMessage = 'svgLoadingFail';
                    snackError({ headerId: errorMessage });
                }
                setGlobalError(errorMessage);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [
        currentNode,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
        baseVoltagesConfig,
        networkVisuParams,
        snackError,
        setDiagramAndSync,
    ]);

    const updateDiagram = useCallback(
        (updates: Partial<NetworkAreaDiagram>, shouldFetch: boolean) => {
            setDiagramAndSync((prev) => ({ ...prev, ...updates }));

            if (shouldFetch) {
                setTimeout(() => fetchDiagram(), 0);
            }
        },
        [setDiagramAndSync, fetchDiagram]
    );

    // Backend operations
    const cleanupSavedNadConfig = useCallback(() => {
        if (diagram.savedWorkspaceConfigUuid && workspaceId) {
            deleteNadConfig(studyUuid, workspaceId, panelId).catch((error) =>
                console.error('Failed to delete NAD config:', error)
            );
        }
    }, [studyUuid, workspaceId, panelId, diagram.savedWorkspaceConfigUuid]);

    const handleSaveNad = useCallback(async () => {
        const current = diagramRef.current;
        if (current.voltageLevelIds.length === 0 || !workspaceId) {
            return;
        }

        const scalingFactor = (current.svg?.additionalMetadata as { scalingFactor?: number })?.scalingFactor;

        try {
            const savedUuid = await saveNadConfig(studyUuid, workspaceId, panelId, {
                id: current.savedWorkspaceConfigUuid || null,
                scalingFactor,
                voltageLevelIds: current.voltageLevelIds,
                positions: current.positions,
            });

            setDiagramAndSync((prev) => ({ ...prev, savedWorkspaceConfigUuid: savedUuid }));
        } catch (error) {
            console.error('Failed to save NAD config:', error);
        }
    }, [studyUuid, workspaceId, panelId, setDiagramAndSync]);

    const loadConfig = useCallback(
        (nadConfigUuid?: UUID, filterUuid?: UUID) => {
            setDiagramAndSync((prev) => ({
                ...prev,
                nadConfigUuid,
                filterUuid,
                currentFilterUuid: undefined,
                voltageLevelIds: [],
                voltageLevelToExpandIds: [],
                positions: [],
                savedWorkspaceConfigUuid: undefined,
                svg: null,
            }));

            cleanupSavedNadConfig();
            setTimeout(() => fetchDiagram(), 0);
        },
        [cleanupSavedNadConfig, fetchDiagram, setDiagramAndSync]
    );

    useEffect(() => {
        if (currentNode && isNodeBuilt(currentNode)) {
            fetchDiagram();
        }
    }, [currentNode, fetchDiagram]);

    useEffect(() => {
        if (initialVlIdsRef.current?.length) {
            updateNADFields({ panelId, fields: { initialVoltageLevelIds: undefined } });
        }
    }, [updateNADFields, panelId]);

    useDiagramNotifications({
        currentRootNetworkUuid,
        onNotification: () => {
            fetchDiagram();
        },
        savedNadConfigUuid: diagram.savedWorkspaceConfigUuid,
    });

    return {
        diagram,
        loading,
        globalError,
        fetchDiagram,
        updateDiagram,
        handleSaveNad,
        cleanupSavedNadConfig,
        loadConfig,
    };
};
