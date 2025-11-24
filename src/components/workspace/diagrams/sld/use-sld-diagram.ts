/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { Diagram, DiagramType } from '../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg } from '../../../../services/study';
import { getSubstationSingleLineDiagram, getVoltageLevelSingleLineDiagram } from '../../../../services/study/network';
import { PARAM_LANGUAGE, PARAM_USE_NAME } from '../../../../utils/config-params';
import { SLD_DISPLAY_MODE } from '../../../network/constants';
import type { SLDPanelMetadata } from '../../types/workspace.types';
import { useDiagramNotifications } from '../common/use-diagram-notifications';
import { isNodeBuilt, isStatusBuilt } from '../../../graph/util/model-functions';
import { NodeType } from '../../../graph/tree-node.type';

interface UseSldDiagramProps {
    diagramMetadata: SLDPanelMetadata;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const useSldDiagram = ({
    diagramMetadata,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: UseSldDiagramProps) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const paramUseName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);

    const [diagram, setDiagram] = useState<Diagram>(() => {
        const type = diagramMetadata.voltageLevelId ? DiagramType.VOLTAGE_LEVEL : DiagramType.SUBSTATION;
        return {
            ...diagramMetadata,
            type,
            svg: null,
        } as Diagram;
    });
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    // Helper to process SVG data - extracted to reduce nesting
    const processSvgData = useCallback((svgData: any) => {
        if (svgData) {
            setDiagram((prev) => ({ ...prev, svg: svgData }));
        }
    }, []);

    const handleFetchError = useCallback((error: unknown) => {
        console.error('Error fetching SLD diagram:', error);
    }, []);

    const handleFetchComplete = useCallback(() => {
        setLoading(false);
    }, []);

    const fetchDiagram = useCallback(() => {
        if (!currentNode || !isNodeBuilt(currentNode)) return;

        setLoading(true);
        setGlobalError(undefined);

        try {
            let url: string | null = null;

            setDiagram((currentDiagram) => {
                if (currentDiagram.type === DiagramType.VOLTAGE_LEVEL && 'voltageLevelId' in currentDiagram) {
                    url = getVoltageLevelSingleLineDiagram({
                        studyUuid,
                        currentNodeUuid: currentNodeId,
                        currentRootNetworkUuid,
                        voltageLevelId: currentDiagram.voltageLevelId,
                        useName: paramUseName,
                        centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                        diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                        componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                        sldDisplayMode: SLD_DISPLAY_MODE.STATE_VARIABLE,
                        language,
                    });
                } else if (currentDiagram.type === DiagramType.SUBSTATION && 'substationId' in currentDiagram) {
                    url = getSubstationSingleLineDiagram({
                        studyUuid,
                        currentNodeUuid: currentNodeId,
                        currentRootNetworkUuid,
                        substationId: currentDiagram.substationId,
                        useName: paramUseName,
                        centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                        diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                        substationLayout: networkVisuParams.singleLineDiagramParameters.substationLayout,
                        componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                        language,
                    });
                }

                return currentDiagram;
            });

            if (url) {
                fetchSvg(url, { method: 'GET' })
                    .then(processSvgData)
                    .catch(handleFetchError)
                    .finally(handleFetchComplete);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching SLD diagram:', error);
            setLoading(false);
        }
    }, [
        currentNode,
        studyUuid,
        currentNodeId,
        currentRootNetworkUuid,
        paramUseName,
        networkVisuParams,
        language,
        processSvgData,
        handleFetchError,
        handleFetchComplete,
    ]);

    // Fetch when diagram metadata or node changes
    useEffect(() => {
        if (!currentNode?.id) return;

        if (currentNode.type !== NodeType.ROOT && !isStatusBuilt(currentNode?.data?.globalBuildStatus)) {
            setGlobalError('InvalidNode');
            return;
        }

        setGlobalError(undefined);

        // Update diagram from diagramData
        const type = diagramMetadata.voltageLevelId ? DiagramType.VOLTAGE_LEVEL : DiagramType.SUBSTATION;
        setDiagram({
            ...diagramMetadata,
            type,
            svg: null,
        } as Diagram);

        fetchDiagram();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentNodeId,
        currentNode?.id,
        currentNode?.type,
        currentNode?.data?.globalBuildStatus,
        currentRootNetworkUuid,
        diagramMetadata.voltageLevelId,
        diagramMetadata.substationId,
    ]);

    // Listen for notifications and refetch
    useDiagramNotifications({
        currentRootNetworkUuid,
        onNotification: fetchDiagram,
    });

    return {
        diagram,
        loading,
        globalError,
    };
};
