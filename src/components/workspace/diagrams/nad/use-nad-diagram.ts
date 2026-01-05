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
import { mergePositions } from '../../../grid-layout/cards/diagrams/diagram-utils';
import type { DiagramMetadata } from '@powsybl/network-viewer';
import { useDiagramNotifications } from '../common/use-diagram-notifications';
import { isNodeBuilt, isStatusBuilt } from '../../../graph/util/model-functions';
import { NodeType } from '../../../graph/tree-node.type';
import { useSavedNadConfig } from './use-saved-nad-config';
import { useBaseVoltages } from '../../../../hooks/use-base-voltages';
import { selectNadDiagramFields } from '../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../redux/store';
import { useWorkspaceActions } from '../../hooks/use-workspace-actions';

interface UseNadDiagramProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const useNadDiagram = ({ panelId, studyUuid, currentNodeId, currentRootNetworkUuid }: UseNadDiagramProps) => {
    // Use field-specific selector to prevent re-renders on unrelated panel changes
    const nadFields = useSelector((state: RootState) => selectNadDiagramFields(state, panelId));

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const { snackError } = useSnackMessage();
    const { baseVoltagesConfig } = useBaseVoltages();
    const { updateNADFields } = useWorkspaceActions();

    const [diagram, setDiagram] = useState<NetworkAreaDiagram>(() => ({
        type: DiagramType.NETWORK_AREA_DIAGRAM,
        svg: null,
        nadConfigUuid: nadFields?.nadConfigUuid,
        filterUuid: nadFields?.filterUuid,
        currentFilterUuid: nadFields?.currentFilterUuid,
        voltageLevelIds: nadFields?.initialVoltageLevelIds || [],
        positions: [],
        voltageLevelToExpandIds: [],
        voltageLevelToOmitIds: nadFields?.voltageLevelToOmitIds || [],
    }));
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    const { saveNadConfig, cleanupSavedNadConfig } = useSavedNadConfig(
        studyUuid,
        panelId,
        nadFields?.savedWorkspaceConfigUuid
    );

    // Helper to process SVG data - extracted to reduce nesting
    const processSvgData = useCallback(
        async (svgData: any) => {
            if (!svgData) return;

            let savedConfigUuid: UUID | null = null;
            let updatedDiagram: NetworkAreaDiagram;

            // Update diagram and capture the result
            setDiagram((prev) => {
                const vlIdsFromSvg =
                    (svgData.additionalMetadata as { voltageLevels?: { id: string }[] })?.voltageLevels?.map(
                        (vl) => vl.id
                    ) ?? [];

                updatedDiagram = {
                    ...prev,
                    svg: svgData,
                    voltageLevelToExpandIds: [],
                    voltageLevelIds: [...new Set([...(prev.voltageLevelIds || []), ...vlIdsFromSvg])],
                    voltageLevelToOmitIds: (prev.voltageLevelToOmitIds || []).filter(
                        (vlId: string) => !vlIdsFromSvg.includes(vlId)
                    ),
                    positions: mergePositions(prev.positions || [], svgData.metadata as DiagramMetadata),
                };

                return updatedDiagram;
            });

            // Auto-save NAD if no saved config exists
            if (!nadFields?.savedWorkspaceConfigUuid && updatedDiagram!.voltageLevelIds.length > 0) {
                const scalingFactor = (svgData.additionalMetadata as { scalingFactor?: number })?.scalingFactor;
                savedConfigUuid = await saveNadConfig(
                    updatedDiagram!.voltageLevelIds,
                    updatedDiagram!.positions,
                    scalingFactor
                );
            }

            // Update panel fields: clear initialVoltageLevelIds after first fetch and update voltageLevelToOmitIds
            updateNADFields({
                panelId,
                fields: {
                    voltageLevelToOmitIds: updatedDiagram!.voltageLevelToOmitIds,
                    ...(nadFields?.initialVoltageLevelIds && { initialVoltageLevelIds: undefined }),
                    ...(savedConfigUuid && { savedWorkspaceConfigUuid: savedConfigUuid }),
                },
            });
        },
        [
            nadFields?.savedWorkspaceConfigUuid,
            nadFields?.initialVoltageLevelIds,
            saveNadConfig,
            updateNADFields,
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
    const fetchDiagram = useCallback(
        (forceSavedConfig = false) => {
            if (!currentNode || !isNodeBuilt(currentNode)) return;

            setLoading(true);
            setGlobalError(undefined);

            try {
                const url = getNetworkAreaDiagramUrl(studyUuid, currentNodeId, currentRootNetworkUuid);

                setDiagram((currentDiagram) => {
                    const hasVoltageLevels = currentDiagram.voltageLevelIds?.length > 0;
                    const hasExpandIds = (currentDiagram.voltageLevelToExpandIds?.length ?? 0) > 0;

                    // Use saved config if forced by notification or if in initial edit mode
                    const isEditMode =
                        (forceSavedConfig && nadFields?.savedWorkspaceConfigUuid) ||
                        (nadFields?.savedWorkspaceConfigUuid && !hasVoltageLevels && !hasExpandIds);

                    const fetchOptions: RequestInit = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nadConfigUuid: isEditMode
                                ? nadFields?.savedWorkspaceConfigUuid
                                : currentDiagram.nadConfigUuid,
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

                    fetchSvg(url, fetchOptions)
                        .then(processSvgData)
                        .catch(handleFetchError)
                        .finally(handleFetchComplete);

                    return currentDiagram;
                });
            } catch (error) {
                console.error('Error fetching NAD diagram:', error);
                setLoading(false);
            }
        },
        [
            currentNode,
            studyUuid,
            currentNodeId,
            currentRootNetworkUuid,
            baseVoltagesConfig,
            networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
            nadFields?.savedWorkspaceConfigUuid,
            processSvgData,
            handleFetchError,
            handleFetchComplete,
        ]
    );

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
            nadConfigUuid: nadFields?.nadConfigUuid,
            filterUuid: nadFields?.filterUuid,
            currentFilterUuid: nadFields?.currentFilterUuid,
            voltageLevelIds: nadFields?.initialVoltageLevelIds || [],
            voltageLevelToOmitIds: nadFields?.voltageLevelToOmitIds || [],
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
        nadFields?.nadConfigUuid,
        nadFields?.filterUuid,
        nadFields?.currentFilterUuid,
    ]);

    // Listen for notifications and refetch
    useDiagramNotifications({
        currentRootNetworkUuid,
        onNotification: (forceSavedConfig) => fetchDiagram(forceSavedConfig),
        savedNadConfigUuid: nadFields?.savedWorkspaceConfigUuid,
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
