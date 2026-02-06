/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackMessage, PARAM_LANGUAGE, snackWithFallback } from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer';
import { Diagram, DiagramType } from '../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg } from '../../../../services/study';
import {
    getSubstationSingleLineDiagramUrl,
    getVoltageLevelSingleLineDiagramUrl,
} from '../../../../services/study/network';
import { PARAM_USE_NAME } from '../../../../utils/config-params';
import { SLD_DISPLAY_MODE } from '../../../network/constants';
import { useDiagramNotifications } from '../common/use-diagram-notifications';
import { isNodeBuilt, isStatusBuilt } from '../../../graph/util/model-functions';
import { NodeType } from '../../../graph/tree-node.type';

interface UseSldDiagramProps {
    diagramType: DiagramType.VOLTAGE_LEVEL | DiagramType.SUBSTATION;
    equipmentId: string;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const useSldDiagram = ({
    diagramType,
    equipmentId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: UseSldDiagramProps) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const paramUseName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);
    const { snackError } = useSnackMessage();

    const [diagram, setDiagram] = useState<Diagram>(
        () =>
            ({
                type: diagramType,
                svg: null,
                equipmentId,
            }) as Diagram
    );
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    // Helper to process SVG data - extracted to reduce nesting
    const processSvgData = useCallback((svgData: any) => {
        if (svgData) {
            setDiagram((prev) => ({ ...prev, svg: svgData }));
        }
    }, []);

    const handleFetchError = useCallback(
        (error: any) => {
            console.error('Error fetching SLD diagram:', error);
            let errorMessage: string;
            if (error?.status === 404) {
                setDiagram((current) => {
                    errorMessage =
                        current.type === DiagramType.SUBSTATION ? 'SubstationNotFound' : 'VoltageLevelNotFound';
                    setGlobalError(errorMessage);
                    return current;
                });
            } else if (error?.status === 403) {
                errorMessage = error.message || 'svgLoadingFail';
                snackWithFallback(snackError, error, { headerId: errorMessage });
                setGlobalError(errorMessage);
            } else {
                errorMessage = 'svgLoadingFail';
                snackWithFallback(snackError, error, { headerId: errorMessage });
                setGlobalError(errorMessage);
            }
        },
        [snackError]
    );

    const handleFetchComplete = useCallback(() => {
        setLoading(false);
    }, []);

    const fetchDiagram = useCallback(() => {
        if (!currentNode || !isNodeBuilt(currentNode)) return;

        setLoading(true);
        setGlobalError(undefined);

        try {
            setDiagram((currentDiagram) => {
                let url: string | null = null;
                let fetchOptions: RequestInit | null = null;

                if (currentDiagram.type === DiagramType.VOLTAGE_LEVEL) {
                    url = getVoltageLevelSingleLineDiagramUrl({
                        studyUuid,
                        currentNodeUuid: currentNodeId,
                        currentRootNetworkUuid,
                        voltageLevelId: currentDiagram.equipmentId,
                    });
                    fetchOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            useName: paramUseName,
                            centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                            diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                            componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                            sldDisplayMode: SLD_DISPLAY_MODE.STATE_VARIABLE,
                            topologicalColoring: true,
                            language,
                        }),
                    };
                } else if (currentDiagram.type === DiagramType.SUBSTATION) {
                    url = getSubstationSingleLineDiagramUrl({
                        studyUuid,
                        currentNodeUuid: currentNodeId,
                        currentRootNetworkUuid,
                        substationId: currentDiagram.equipmentId,
                    });
                    fetchOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            useName: paramUseName,
                            centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                            diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                            substationLayout: networkVisuParams.singleLineDiagramParameters.substationLayout,
                            componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                            topologicalColoring: true,
                            language,
                        }),
                    };
                }

                if (url && fetchOptions) {
                    fetchSvg(url, fetchOptions)
                        .then(processSvgData)
                        .catch(handleFetchError)
                        .finally(handleFetchComplete);
                } else {
                    setLoading(false);
                }

                return currentDiagram;
            });
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

        // Update diagram from equipmentId
        setDiagram(
            (prev) =>
                ({
                    ...prev,
                    type: diagramType,
                    equipmentId,
                }) as Diagram
        );

        fetchDiagram();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        diagramType,
        currentNodeId,
        currentNode?.id,
        currentNode?.type,
        currentNode?.data?.globalBuildStatus,
        currentRootNetworkUuid,
        equipmentId,
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
