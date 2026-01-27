/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useState } from 'react';
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
import { useWorkspacePanelActions } from '../../hooks/use-workspace-panel-actions';
import { PERSISTENT_NAD_FIELDS } from '../../types/workspace.types';

interface UseNadDiagramProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

function getPersistentFieldsChanges(prev: NetworkAreaDiagram, next: NetworkAreaDiagram): Partial<NetworkAreaDiagram> {
    const changes: Partial<NetworkAreaDiagram> = {};
    for (const field of PERSISTENT_NAD_FIELDS) {
        const prevValue = prev[field];
        const nextValue = next[field];

        // Deep equality check for arrays
        const hasChanged =
            Array.isArray(prevValue) && Array.isArray(nextValue)
                ? JSON.stringify(prevValue) !== JSON.stringify(nextValue)
                : prevValue !== nextValue;

        if (hasChanged) {
            Object.assign(changes, { [field]: nextValue });
        }
    }
    return changes;
}

// Base reset state for loading new configs
const BASE_RESET_STATE = {
    currentFilterUuid: undefined,
    voltageLevelIds: [],
    voltageLevelToExpandIds: [],
    positions: [],
    currentNadConfigUuid: undefined,
    initialVoltageLevelIds: [],
    voltageLevelToOmitIds: [],
    svg: null,
};

export const useNadDiagram = ({ panelId, studyUuid, currentNodeId, currentRootNetworkUuid }: UseNadDiagramProps) => {
    const { updateNADFields } = useWorkspacePanelActions();
    const initialFields = useSelector((state: RootState) => selectNadDiagramFields(state, panelId));
    const workspaceId = useSelector((state: RootState) => selectActiveWorkspaceId(state));
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const { snackError } = useSnackMessage();
    const { baseVoltagesConfig } = useBaseVoltages();

    const [diagram, setDiagram] = useState<NetworkAreaDiagram>(() => ({
        type: DiagramType.NETWORK_AREA_DIAGRAM,
        svg: null,
        title: initialFields?.title,
        nadConfigUuid: initialFields?.nadConfigUuid,
        filterUuid: initialFields?.filterUuid,
        currentFilterUuid: initialFields?.currentFilterUuid,
        currentNadConfigUuid: initialFields?.currentNadConfigUuid,
        initialVoltageLevelIds: initialFields?.initialVoltageLevelIds || [],
        voltageLevelIds: initialFields?.initialVoltageLevelIds || [],
        voltageLevelToExpandIds: [],
        voltageLevelToOmitIds: initialFields?.voltageLevelToOmitIds || [],
        positions: [],
    }));
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    const setDiagramAndSync = useCallback(
        (updater: React.SetStateAction<NetworkAreaDiagram>, syncToBackend = true) => {
            setDiagram((prev) => {
                const next = typeof updater === 'function' ? updater(prev) : updater;

                const changes = getPersistentFieldsChanges(prev, next);
                if (Object.keys(changes).length > 0) {
                    updateNADFields({ panelId, fields: changes, syncToBackend });
                }

                return next;
            });
        },
        [updateNADFields, panelId]
    );

    // Helper to process SVG data - extracted to reduce nesting
    const processSvgData = useCallback(
        (svgData: any) => {
            if (!svgData) return;

            const vlIdsFromSvg =
                (svgData.additionalMetadata as { voltageLevels?: { id: string }[] })?.voltageLevels?.map(
                    (vl) => vl.id
                ) ?? [];

            setDiagramAndSync((prev) => {
                const filteredOmitIds = prev.voltageLevelToOmitIds.filter((id) => !vlIdsFromSvg.includes(id));

                return {
                    ...prev,
                    svg: svgData,
                    voltageLevelIds: [...new Set([...prev.voltageLevelIds, ...vlIdsFromSvg])],
                    voltageLevelToExpandIds: [],
                    voltageLevelToOmitIds: filteredOmitIds,
                    positions: mergePositions(prev.positions, svgData.metadata as DiagramMetadata),
                };
            });
        },
        [setDiagramAndSync]
    );

    const handleFetchError = useCallback(
        (error: any) => {
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
        },
        [snackError]
    );

    const fetchDiagram = useCallback(() => {
        if (!currentNode || !isNodeBuilt(currentNode)) {
            setGlobalError('Node not built');
            return Promise.resolve();
        }

        setLoading(true);
        setGlobalError(undefined);

        // we use setDiagram to capture current state without adding diagram to dependencies
        return setDiagram((currentDiagram) => {
            const body: any = {
                baseVoltagesConfigInfos: baseVoltagesConfig,
                nadPositionsGenerationMode: networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
                voltageLevelIds: currentDiagram.voltageLevelIds,
                voltageLevelToExpandIds: currentDiagram.voltageLevelToExpandIds,
                positions: currentDiagram.positions,
                voltageLevelToOmitIds: currentDiagram.voltageLevelToOmitIds,
                nadConfigUuid: currentDiagram.currentNadConfigUuid || currentDiagram.nadConfigUuid,
                filterUuid: currentDiagram.currentFilterUuid || currentDiagram.filterUuid,
            };

            const url = getNetworkAreaDiagramUrl(studyUuid, currentNodeId, currentRootNetworkUuid);

            fetchSvg(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
                .then(processSvgData)
                .catch(handleFetchError)
                .finally(() => setLoading(false));

            return currentDiagram;
        });
    }, [
        currentNode,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
        baseVoltagesConfig,
        networkVisuParams,
        processSvgData,
        handleFetchError,
    ]);

    const updateDiagram = useCallback(
        (updates: Partial<NetworkAreaDiagram>, shouldFetch: boolean, syncToBackend = true) => {
            setDiagramAndSync((prev) => ({ ...prev, ...updates }), syncToBackend);

            if (shouldFetch) {
                fetchDiagram();
            }
        },
        [setDiagramAndSync, fetchDiagram]
    );

    const handleSaveNad = useCallback(async () => {
        if (diagram.voltageLevelIds.length === 0 || !workspaceId) {
            return;
        }

        const scalingFactor = (diagram.svg?.additionalMetadata as { scalingFactor?: number })?.scalingFactor;

        try {
            const savedUuid = await saveNadConfig(studyUuid, workspaceId, panelId, {
                id: diagram.currentNadConfigUuid || null,
                scalingFactor,
                voltageLevelIds: diagram.voltageLevelIds,
                positions: diagram.positions,
            });

            setDiagramAndSync(
                (prev) => ({ ...prev, currentNadConfigUuid: savedUuid, initialVoltageLevelIds: [] }),
                false
            );
        } catch (error) {
            console.error('Failed to save NAD config:', error);
        }
    }, [diagram, studyUuid, workspaceId, panelId, setDiagramAndSync]);

    const replaceNadConfig = useCallback(
        (title: string, nadConfigUuid?: UUID, filterUuid?: UUID) => {
            // Cleanup saved config if exists
            if (diagram.currentNadConfigUuid && workspaceId) {
                deleteNadConfig(studyUuid, workspaceId, panelId).catch((error) =>
                    console.error('Failed to delete NAD config:', error)
                );
            }

            updateDiagram(
                {
                    title,
                    nadConfigUuid,
                    filterUuid,
                    ...BASE_RESET_STATE,
                },
                true
            );
        },
        [diagram.currentNadConfigUuid, workspaceId, studyUuid, panelId, updateDiagram]
    );

    const handleNotification = useCallback(
        (newConfigUuid?: UUID) => {
            if (newConfigUuid) {
                // NAD config updated from another tab
                updateDiagram(
                    {
                        currentNadConfigUuid: newConfigUuid,
                        initialVoltageLevelIds: [],
                        voltageLevelIds: [],
                        positions: [],
                        svg: null,
                    },
                    true,
                    false
                );
            } else {
                // Root network notification (loadflow, etc.)
                fetchDiagram();
            }
        },
        [updateDiagram, fetchDiagram]
    );

    // Initial fetch and when node or root network changes
    useEffect(() => {
        fetchDiagram();
    }, [currentNodeId, currentRootNetworkUuid, fetchDiagram]);

    // Sync cross-tab updates
    useEffect(() => {
        const nadConfigChanged = initialFields?.nadConfigUuid !== diagram.nadConfigUuid;
        const filterChanged = initialFields?.filterUuid !== diagram.filterUuid;
        const currentFilterChanged = initialFields?.currentFilterUuid !== diagram.currentFilterUuid;
        const omitIdsChanged =
            JSON.stringify(initialFields?.voltageLevelToOmitIds ?? []) !==
            JSON.stringify(diagram.voltageLevelToOmitIds);

        if (nadConfigChanged || filterChanged) {
            // Full reset when NAD is replaced
            updateDiagram(
                {
                    nadConfigUuid: initialFields?.nadConfigUuid,
                    filterUuid: initialFields?.filterUuid,
                    ...BASE_RESET_STATE,
                },
                true,
                false
            );
        } else if (currentFilterChanged || omitIdsChanged) {
            // Incremental update for filter/omit changes
            updateDiagram(
                {
                    currentFilterUuid: initialFields?.currentFilterUuid,
                    voltageLevelToOmitIds: initialFields?.voltageLevelToOmitIds || [],
                },
                false,
                false
            );
        }
    }, [
        diagram.nadConfigUuid,
        diagram.filterUuid,
        diagram.currentFilterUuid,
        diagram.voltageLevelToOmitIds,
        initialFields?.nadConfigUuid,
        initialFields?.filterUuid,
        initialFields?.currentFilterUuid,
        initialFields?.voltageLevelToOmitIds,
        updateDiagram,
    ]);

    useDiagramNotifications({
        currentRootNetworkUuid,
        onNotification: handleNotification,
        currentNadConfigUuid: diagram.currentNadConfigUuid,
        panelId,
    });

    return {
        diagram,
        loading,
        globalError,
        fetchDiagram,
        updateDiagram,
        handleSaveNad,
        replaceNadConfig,
    };
};
