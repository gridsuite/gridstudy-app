/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer';
import { DiagramType, NetworkAreaDiagram } from '../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg, getNetworkAreaDiagramUrl } from '../../../../services/study';
import { mergePositions } from '../../../grid-layout/cards/diagrams/diagram-utils';
import type { DiagramMetadata } from '@powsybl/network-viewer';
import type { NADPanel } from '../../types/workspace.types';
import { useDiagramNotifications } from '../common/use-diagram-notifications';
import { isNodeBuilt, isStatusBuilt } from '../../../graph/util/model-functions';
import { NodeType } from '../../../graph/tree-node.type';
import { useSavedNadConfig } from './use-saved-nad-config';
import { useBaseVoltages } from '../../../../hooks/use-base-voltages';
import { selectPanel } from '../../../../redux/slices/workspace-selectors';
import { selectTempData } from '../../../../redux/slices/workspace-session-selectors';
import type { RootState } from '../../../../redux/store';
import { updatePanels } from '../../../../redux/slices/workspace-slice';
import { clearTempData } from '../../../../redux/slices/workspace-session-slice';

interface UseNadDiagramProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const useNadDiagram = ({ panelId, studyUuid, currentNodeId, currentRootNetworkUuid }: UseNadDiagramProps) => {
    const dispatch = useDispatch();

    const nadPanel = useSelector((state: RootState) => selectPanel(state, panelId)) as NADPanel | undefined;
    const tempData = useSelector((state: RootState) => selectTempData(state, panelId));

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const { snackError } = useSnackMessage();
    const { baseVoltagesConfig } = useBaseVoltages();

    const [diagram, setDiagram] = useState<NetworkAreaDiagram>(() => ({
        type: DiagramType.NETWORK_AREA_DIAGRAM,
        svg: null,
        nadConfigUuid: nadPanel?.nadConfigUuid,
        filterUuid: nadPanel?.filterUuid,
        currentFilterUuid: nadPanel?.currentFilterUuid,
        voltageLevelIds: tempData?.initialVoltageLevelIds || [],
        positions: [],
        voltageLevelToExpandIds: [],
        voltageLevelToOmitIds: nadPanel?.voltageLevelToOmitIds || [],
    }));
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    const { saveNadConfig, cleanupSavedNadConfig } = useSavedNadConfig(
        studyUuid,
        panelId,
        nadPanel?.savedWorkspaceConfigUuid
    );

    const updateMetadata = useCallback(
        (updatedDiagram: NetworkAreaDiagram) => {
            if (!nadPanel) return;

            // Clear temp data after first fetch to prevent re-initialization
            if (tempData?.initialVoltageLevelIds) {
                dispatch(clearTempData(panelId));
            }

            // Update panel metadata
            dispatch(
                updatePanels([
                    {
                        ...nadPanel,
                        voltageLevelToOmitIds: updatedDiagram.voltageLevelToOmitIds,
                    },
                ])
            );
        },
        [nadPanel, tempData, dispatch, panelId]
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
                if (!nadPanel?.savedWorkspaceConfigUuid && updatedDiagram.voltageLevelIds.length > 0) {
                    const scalingFactor = (svgData.additionalMetadata as { scalingFactor?: number })?.scalingFactor;
                    saveNadConfig(updatedDiagram.voltageLevelIds, updatedDiagram.positions, scalingFactor);
                }

                updateMetadata(updatedDiagram);

                return updatedDiagram;
            });
        },
        [nadPanel?.savedWorkspaceConfigUuid, saveNadConfig, updateMetadata]
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
                const hasExpandIds = (currentDiagram.voltageLevelToExpandIds?.length ?? 0) > 0;

                // Use saved config only if we have no voltage levels AND no expand/omit operations
                // Replace by the state isEditNadMode
                const isEditMode = nadPanel?.savedWorkspaceConfigUuid && !hasVoltageLevels && !hasExpandIds;

                const fetchOptions: RequestInit = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nadConfigUuid: isEditMode ? nadPanel?.savedWorkspaceConfigUuid : currentDiagram.nadConfigUuid,
                        filterUuid: currentDiagram.currentFilterUuid ?? currentDiagram.filterUuid,
                        voltageLevelToOmitIds: currentDiagram.voltageLevelToOmitIds,
                        ...(isEditMode
                            ? {}
                            : {
                                  voltageLevelIds: currentDiagram.voltageLevelIds,
                                  voltageLevelToExpandIds: currentDiagram.voltageLevelToExpandIds,
                                  positions: currentDiagram.positions,
                              }),
                        nadPositionsGenerationMode:
                            networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
                        baseVoltagesConfigInfos: baseVoltagesConfig,
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
        baseVoltagesConfig,
        networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
        nadPanel?.savedWorkspaceConfigUuid,
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

        // Update diagram from panel data
        setDiagram((prev) => ({
            ...prev,
            type: DiagramType.NETWORK_AREA_DIAGRAM,
            nadConfigUuid: nadPanel?.nadConfigUuid,
            filterUuid: nadPanel?.filterUuid,
            currentFilterUuid: nadPanel?.currentFilterUuid,
            voltageLevelIds: tempData?.initialVoltageLevelIds || [],
            voltageLevelToOmitIds: nadPanel?.voltageLevelToOmitIds || [],
            positions: [],
            voltageLevelToExpandIds: [],
        }));

        fetchDiagram();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentNodeId,
        currentNode?.id,
        currentNode?.type,
        currentNode?.data?.globalBuildStatus,
        currentRootNetworkUuid,
        nadPanel?.nadConfigUuid,
        nadPanel?.filterUuid,
        nadPanel?.currentFilterUuid,
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
        cleanupSavedNadConfig,
    };
};
