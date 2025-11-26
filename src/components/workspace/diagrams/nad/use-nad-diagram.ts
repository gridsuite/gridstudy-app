/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackMessage, backendFetchJson } from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer';
import { DiagramType, NetworkAreaDiagram } from '../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg, getNetworkAreaDiagramUrl, PREFIX_STUDY_QUERIES } from '../../../../services/study';
import { mergePositions } from '../../../grid-layout/cards/diagrams/diagram-utils';
import type { DiagramMetadata } from '@powsybl/network-viewer';
import type { NADPanelMetadata } from '../../types/workspace.types';
import { updatePanelMetadata as updatePanelMetadataAction } from '../../../../redux/slices/workspace-slice';
import type { DiagramConfigPosition } from '../../../../services/explore';
import { useDiagramNotifications } from '../common/use-diagram-notifications';
import { isNodeBuilt, isStatusBuilt } from '../../../graph/util/model-functions';
import { NodeType } from '../../../graph/tree-node.type';

interface UseNadDiagramProps {
    diagramMetadata: NADPanelMetadata;
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const useNadDiagram = ({
    diagramMetadata,
    panelId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: UseNadDiagramProps) => {
    const dispatch = useDispatch();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const { snackError } = useSnackMessage();

    const [diagram, setDiagram] = useState<NetworkAreaDiagram>(() => ({
        type: DiagramType.NETWORK_AREA_DIAGRAM,
        svg: null,
        nadConfigUuid: diagramMetadata.nadConfigUuid,
        filterUuid: diagramMetadata.filterUuid,
        voltageLevelIds: diagramMetadata.initialVoltageLevelIds || [],
        positions: [],
        voltageLevelToExpandIds: [],
        voltageLevelToOmitIds: [],
    }));
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    // Save NAD config to backend - only store UUID in Redux
    const saveNadConfig = useCallback(
        (
            voltageLevelIds: string[],
            positions: DiagramConfigPosition[],
            scalingFactor?: number
        ): Promise<UUID | null> => {
            const url = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/nad-configs`;

            return backendFetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: diagramMetadata.savedWorkspaceConfigUuid || null,
                    scalingFactor,
                    voltageLevelIds,
                    positions,
                }),
            })
                .then((response: UUID) => {
                    // Only store UUIDs in Redux not voluminous data
                    dispatch(
                        updatePanelMetadataAction({
                            panelId,
                            metadata: {
                                savedWorkspaceConfigUuid: response,
                            },
                        })
                    );
                    return response;
                })
                .catch((error) => {
                    console.error('Failed to save NAD config:', error);
                    return null;
                });
        },
        [studyUuid, panelId, dispatch, diagramMetadata.savedWorkspaceConfigUuid]
    );

    // Helper to process SVG data - extracted to reduce nesting
    const processSvgData = useCallback(
        (svgData: any) => {
            if (!svgData) return;

            setDiagram((prev) => {
                const vlIdsFromSvg =
                    (svgData.additionalMetadata as { voltageLevels?: { id: string }[] })?.voltageLevels?.map(
                        (vl) => vl.id
                    ) ?? [];

                const updatedDiagram: NetworkAreaDiagram = {
                    ...prev,
                    svg: svgData,
                    voltageLevelToExpandIds: [],
                    voltageLevelIds: [...new Set([...(prev.voltageLevelIds || []), ...vlIdsFromSvg])],
                    voltageLevelToOmitIds: (prev.voltageLevelToOmitIds || []).filter(
                        (vlId: string) => !vlIdsFromSvg.includes(vlId)
                    ),
                    positions: mergePositions(prev.positions || [], svgData.metadata as DiagramMetadata),
                };

                // Auto-save NAD if no saved config exists
                if (!diagramMetadata.savedWorkspaceConfigUuid && updatedDiagram.voltageLevelIds.length > 0) {
                    const scalingFactor = (svgData.additionalMetadata as { scalingFactor?: number })?.scalingFactor;
                    saveNadConfig(updatedDiagram.voltageLevelIds, updatedDiagram.positions, scalingFactor);
                }

                // Clear initialVoltageLevelIds after first fetch to prevent re-initialization
                if (diagramMetadata.initialVoltageLevelIds && diagramMetadata.initialVoltageLevelIds.length > 0) {
                    dispatch(
                        updatePanelMetadataAction({
                            panelId,
                            metadata: {
                                initialVoltageLevelIds: undefined,
                            },
                        })
                    );
                }

                return updatedDiagram;
            });
        },
        [
            diagramMetadata.initialVoltageLevelIds,
            diagramMetadata.savedWorkspaceConfigUuid,
            saveNadConfig,
            dispatch,
            panelId,
        ]
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

    const handleFetchComplete = useCallback(() => {
        setLoading(false);
    }, []);

    // Fetch NAD diagram SVG
    const fetchDiagram = useCallback(() => {
        if (!currentNode || !isNodeBuilt(currentNode)) return;

        setLoading(true);
        setGlobalError(undefined);

        try {
            const url = getNetworkAreaDiagramUrl(studyUuid, currentNodeId, currentRootNetworkUuid);

            setDiagram((currentDiagram) => {
                const hasVoltageLevels = currentDiagram.voltageLevelIds?.length > 0;
                const hasExpandOrOmitIds =
                    (currentDiagram.voltageLevelToExpandIds?.length ?? 0) > 0 ||
                    (currentDiagram.voltageLevelToOmitIds?.length ?? 0) > 0;

                // Use saved config only if we have no voltage levels AND no expand/omit operations
                const useSavedConfig =
                    diagramMetadata.savedWorkspaceConfigUuid && !hasVoltageLevels && !hasExpandOrOmitIds;

                const fetchOptions: RequestInit = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nadConfigUuid: useSavedConfig
                            ? diagramMetadata.savedWorkspaceConfigUuid
                            : currentDiagram.nadConfigUuid,
                        filterUuid: currentDiagram.filterUuid,
                        ...(useSavedConfig
                            ? {}
                            : {
                                  voltageLevelIds: currentDiagram.voltageLevelIds,
                                  voltageLevelToExpandIds: currentDiagram.voltageLevelToExpandIds,
                                  voltageLevelToOmitIds: currentDiagram.voltageLevelToOmitIds,
                                  positions: currentDiagram.positions,
                              }),
                        nadPositionsGenerationMode:
                            networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
                    }),
                };

                fetchSvg(url, fetchOptions).then(processSvgData).catch(handleFetchError).finally(handleFetchComplete);

                return currentDiagram;
            });
        } catch (error) {
            console.error('Error fetching NAD diagram:', error);
            setLoading(false);
        }
    }, [
        currentNode,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
        networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
        diagramMetadata.savedWorkspaceConfigUuid,
        processSvgData,
        handleFetchError,
        handleFetchComplete,
    ]);

    const updateDiagram = useCallback(
        (updater: Partial<NetworkAreaDiagram> | ((prev: NetworkAreaDiagram) => NetworkAreaDiagram), fetch = true) => {
            setDiagram((prev) => {
                const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
                return updated;
            });

            if (fetch) {
                fetchDiagram();
            }
        },
        [fetchDiagram]
    );

    // Fetch when diagram data or node changes
    useEffect(() => {
        if (!currentNode?.id) return;

        if (currentNode.type !== NodeType.ROOT && !isStatusBuilt(currentNode?.data?.globalBuildStatus)) {
            setGlobalError('InvalidNode');
            return;
        }

        setGlobalError(undefined);

        // Update diagram from metadata
        setDiagram((prev) => ({
            ...prev,
            type: DiagramType.NETWORK_AREA_DIAGRAM,
            nadConfigUuid: diagramMetadata.nadConfigUuid,
            filterUuid: diagramMetadata.filterUuid,
            voltageLevelIds: diagramMetadata.initialVoltageLevelIds || [],
            positions: [],
            voltageLevelToExpandIds: [],
            voltageLevelToOmitIds: [],
        }));

        fetchDiagram();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentNodeId,
        currentNode?.id,
        currentNode?.type,
        currentNode?.data?.globalBuildStatus,
        currentRootNetworkUuid,
        diagramMetadata.nadConfigUuid,
        diagramMetadata.filterUuid,
    ]);

    // Listen for notifications and refetch
    useDiagramNotifications({
        currentRootNetworkUuid,
        onNotification: fetchDiagram,
    });

    const handleSaveNad = useCallback(() => {
        const voltageLevelIds = diagram.voltageLevelIds || [];
        const positions = diagram.positions || [];
        if (voltageLevelIds.length === 0) return;

        const scalingFactor = (diagram.svg?.additionalMetadata as { scalingFactor?: number })?.scalingFactor;
        saveNadConfig(voltageLevelIds, positions, scalingFactor);
    }, [diagram, saveNadConfig]);

    return {
        diagram,
        loading,
        globalError,
        updateDiagram,
        handleSaveNad,
    };
};
