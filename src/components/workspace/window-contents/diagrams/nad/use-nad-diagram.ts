/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { DiagramType, DiagramParams, NetworkAreaDiagram } from '../../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg, getNetworkAreaDiagramUrl, PREFIX_STUDY_QUERIES } from '../../../../../services/study';
import { isNodeBuilt, isStatusBuilt } from '../../../../graph/util/model-functions';
import { mergePositions } from '../../../../grid-layout/cards/diagrams/diagram-utils';
import type { DiagramMetadata } from '@powsybl/network-viewer';
import type { DiagramWindowData } from '../../../types/workspace.types';
import { NotificationsUrlKeys, useNotificationsListener, backendFetchJson } from '@gridsuite/commons-ui';
import { isLoadflowResultNotification, isStudyNotification } from '../../../../../types/notification-types';
import { NodeType } from '../../../../graph/tree-node.type';
import { useDispatch } from 'react-redux';
import { updateWindowData as updateWindowDataAction } from '../../../../../redux/slices/workspace-slice';
import type { DiagramConfigPosition } from '../../../../../services/explore';

interface UseNadDiagramProps {
    diagramData: DiagramWindowData;
    diagramUuid: UUID;
    windowId: string;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const useNadDiagram = ({
    diagramData,
    diagramUuid,
    windowId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: UseNadDiagramProps) => {
    const dispatch = useDispatch();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const savedConfigRef = useRef<UUID | undefined>((diagramData as any).savedWorkspaceConfigUuid);

    const [diagram, setDiagram] = useState<NetworkAreaDiagram>(
        () =>
            ({
                diagramUuid,
                type: DiagramType.NETWORK_AREA_DIAGRAM,
                name: diagramData.name || '',
                svg: null,
                nadConfigUuid: (diagramData.nadConfigUuid as UUID) || undefined,
                filterUuid: (diagramData.filterUuid as UUID) || undefined,
                voltageLevelIds: diagramData.voltageLevelIds || [],
                positions: diagramData.positions || [],
            }) as NetworkAreaDiagram
    );

    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    // Save NAD config to backend - only store UUID in Redux
    const saveNadConfig = useCallback(
        async (
            voltageLevelIds: string[],
            positions: DiagramConfigPosition[],
            scalingFactor?: number
        ): Promise<UUID | null> => {
            try {
                const url = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/network-area-diagrams/configs`;
                const response: UUID = await backendFetchJson(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: savedConfigRef.current || null,
                        scalingFactor,
                        voltageLevelIds,
                        positions,
                    }),
                });

                savedConfigRef.current = response;
                // Only store UUIDs in Redux, not voluminous data
                dispatch(
                    updateWindowDataAction({
                        windowId,
                        data: {
                            diagramType: 'network-area-diagram',
                            savedWorkspaceConfigUuid: response,
                        },
                    })
                );

                return response;
            } catch (error) {
                console.error('Failed to save NAD config:', error);
                return null;
            }
        },
        [studyUuid, windowId, dispatch]
    );

    // Fetch NAD diagram SVG
    const fetchDiagram = useCallback(
        async (diag: NetworkAreaDiagram) => {
            if (!currentNode || !isNodeBuilt(currentNode)) return;

            const url = getNetworkAreaDiagramUrl(studyUuid, currentNodeId, currentRootNetworkUuid);
            const savedUuid = (diag as any).savedWorkspaceConfigUuid;
            const hasVoltageLevels = diag.voltageLevelIds?.length > 0;

            const fetchOptions: RequestInit = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nadConfigUuid: savedUuid && !hasVoltageLevels ? savedUuid : diag.nadConfigUuid,
                    filterUuid: diag.filterUuid,
                    ...(savedUuid && !hasVoltageLevels
                        ? {}
                        : {
                              voltageLevelIds: diag.voltageLevelIds,
                              voltageLevelToExpandIds: diag.voltageLevelToExpandIds,
                              voltageLevelToOmitIds: diag.voltageLevelToOmitIds,
                              positions: diag.positions,
                          }),
                    nadPositionsGenerationMode:
                        networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
                }),
            };

            setLoading(true);
            setGlobalError(undefined);

            try {
                const svgData = await fetchSvg(url, fetchOptions);
                if (!svgData) return;

                setDiagram((prev) => {
                    const vlIdsFromSvg =
                        (svgData.additionalMetadata as any)?.voltageLevels?.map((vl: any) => vl.id) ?? [];

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
                    if (!savedConfigRef.current && updatedDiagram.voltageLevelIds.length > 0) {
                        const scalingFactor = (svgData.additionalMetadata as any)?.scalingFactor;
                        saveNadConfig(updatedDiagram.voltageLevelIds, updatedDiagram.positions, scalingFactor);
                    }

                    return updatedDiagram;
                });
            } catch (error) {
                console.error('Error fetching NAD diagram:', error);
            } finally {
                setLoading(false);
            }
        },
        [currentNode, studyUuid, currentNodeId, currentRootNetworkUuid, networkVisuParams, saveNadConfig]
    );

    const updateDiagram = useCallback(
        (diagramParams: DiagramParams, fetch: boolean = true) => {
            setDiagram((prev) => {
                const updated: NetworkAreaDiagram = { ...prev, ...diagramParams } as NetworkAreaDiagram;
                if (fetch) fetchDiagram(updated);
                return updated;
            });
        },
        [fetchDiagram]
    );

    const handleSaveNad = useCallback(() => {
        const voltageLevelIds = diagram.voltageLevelIds || [];
        const positions = diagram.positions || [];
        if (voltageLevelIds.length === 0) return;

        const scalingFactor = (diagram.svg?.additionalMetadata as any)?.scalingFactor;
        saveNadConfig(voltageLevelIds, positions, scalingFactor);
    }, [diagram, saveNadConfig]);

    // Initial fetch
    useEffect(() => {
        if (!currentNode?.id) return;

        if (currentNode.type !== NodeType.ROOT && !isStatusBuilt(currentNode?.data?.globalBuildStatus)) {
            setGlobalError('InvalidNode');
            return;
        }

        setGlobalError(undefined);
        fetchDiagram(diagram);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentNodeId, currentNode?.type, currentNode?.data?.globalBuildStatus, currentRootNetworkUuid]);

    // Refetch on notifications
    const diagramRef = useRef(diagram);
    diagramRef.current = diagram;

    const handleNotification = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);
            if (
                (isLoadflowResultNotification(eventData) || isStudyNotification(eventData)) &&
                eventData.headers.rootNetworkUuid === currentRootNetworkUuid
            ) {
                fetchDiagram(diagramRef.current);
            }
        },
        [currentRootNetworkUuid, fetchDiagram]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleNotification });

    return {
        diagram,
        loading,
        globalError,
        updateDiagram,
        handleSaveNad,
    };
};
