/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ErrorMessageDescriptor, extractErrorMessageDescriptor, PARAM_LANGUAGE } from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer.type';
import { Diagram, DiagramType } from '../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg } from '../../../../services/study';
import {
    getSubstationSingleLineDiagramUrl,
    getVoltageLevelSingleLineDiagramUrl,
} from '../../../../services/study/network';
import { PARAM_USE_NAME } from '../../../../utils/config-params';
import { SLD_DISPLAY_MODE } from '../../../network/constants';
import { useDiagramNotifications } from '../common/use-diagram-notifications';
import { isNodeBuilt } from '../../../graph/util/model-functions';

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

    const [diagram, setDiagram] = useState<Diagram>(
        () =>
            ({
                type: diagramType,
                svg: null,
                equipmentId,
            }) as Diagram
    );
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<ErrorMessageDescriptor | undefined>();

    const abortControllerRef = useRef<AbortController | undefined>(undefined);

    // Helper to process SVG data - extracted to reduce nesting
    const processSvgData = useCallback((svgData: any) => {
        if (svgData) {
            setDiagram((prev) => ({ ...prev, svg: svgData }));
        }
    }, []);

    const handleFetchError = useCallback((error: any) => {
        setGlobalError(extractErrorMessageDescriptor(error, ''));
    }, []);

    const handleFetchComplete = useCallback(() => {
        setLoading(false);
    }, []);

    const fetchDiagram = useCallback(() => {
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
                            centerLabel: networkVisuParams?.singleLineDiagramParameters.centerLabel,
                            diagonalLabel: networkVisuParams?.singleLineDiagramParameters.diagonalLabel,
                            componentLibrary: networkVisuParams?.singleLineDiagramParameters.componentLibrary,
                            useStateEstimationVisualisation:
                                networkVisuParams?.singleLineDiagramParameters.stateEstimation,
                            sldDisplayMode: SLD_DISPLAY_MODE.STATE_VARIABLE,
                            topologicalColoring: true,
                            language,
                        }),
                        signal: abortController.signal,
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
                            centerLabel: networkVisuParams?.singleLineDiagramParameters.centerLabel,
                            diagonalLabel: networkVisuParams?.singleLineDiagramParameters.diagonalLabel,
                            substationLayout: networkVisuParams?.singleLineDiagramParameters.substationLayout,
                            componentLibrary: networkVisuParams?.singleLineDiagramParameters.componentLibrary,
                            useStateEstimationVisualisation:
                                networkVisuParams?.singleLineDiagramParameters.stateEstimation,
                            topologicalColoring: true,
                            language,
                        }),
                        signal: abortController.signal,
                    };
                }

                if (url && fetchOptions) {
                    fetchSvg(url, fetchOptions)
                        .then(processSvgData)
                        .catch((error) => {
                            // a newer fetchDiagram call already aborted this request, so its response is no longer relevant
                            if (!abortController.signal.aborted) {
                                handleFetchError(error);
                            }
                        })
                        .finally(() => {
                            if (!abortController.signal.aborted) {
                                handleFetchComplete();
                            }
                        });
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
        language,
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
