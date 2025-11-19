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
import { Diagram, DiagramType, DiagramParams } from '../../../../grid-layout/cards/diagrams/diagram.type';
import { fetchSvg } from '../../../../../services/study';
import {
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
} from '../../../../../services/study/network';
import { isNodeBuilt, isStatusBuilt } from '../../../../graph/util/model-functions';
import { PARAM_LANGUAGE, PARAM_USE_NAME } from '../../../../../utils/config-params';
import { SLD_DISPLAY_MODE } from '../../../../network/constants';
import type { DiagramWindowData } from '../../../types/workspace.types';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { isLoadflowResultNotification, isStudyNotification } from '../../../../../types/notification-types';
import { NodeType } from '../../../../graph/tree-node.type';

interface UseSldDiagramProps {
    diagramData: DiagramWindowData;
    diagramUuid: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const useSldDiagram = ({
    diagramData,
    diagramUuid,
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
                ...diagramData,
                diagramUuid,
                type: diagramData.diagramType as DiagramType,
                name: diagramData.name || '',
                svg: null,
            }) as Diagram
    );

    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | undefined>();

    // Fetch SLD diagram SVG
    const fetchDiagram = useCallback(
        async (diag: Diagram) => {
            if (!currentNode || !isNodeBuilt(currentNode)) return;

            let url: string | null = null;
            if (diag.type === DiagramType.VOLTAGE_LEVEL && 'voltageLevelId' in diag) {
                url = getVoltageLevelSingleLineDiagram({
                    studyUuid,
                    currentNodeUuid: currentNodeId,
                    currentRootNetworkUuid,
                    voltageLevelId: diag.voltageLevelId,
                    useName: paramUseName,
                    centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                    diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                    componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                    sldDisplayMode: SLD_DISPLAY_MODE.STATE_VARIABLE,
                    language,
                });
            } else if (diag.type === DiagramType.SUBSTATION && 'substationId' in diag) {
                url = getSubstationSingleLineDiagram({
                    studyUuid,
                    currentNodeUuid: currentNodeId,
                    currentRootNetworkUuid,
                    substationId: diag.substationId,
                    useName: paramUseName,
                    centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                    diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                    substationLayout: networkVisuParams.singleLineDiagramParameters.substationLayout,
                    componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                    language,
                });
            }

            if (!url) return;

            setLoading(true);
            setGlobalError(undefined);

            try {
                const svgData = await fetchSvg(url, { method: 'GET' });
                if (!svgData) return;

                setDiagram((prev) => ({ ...prev, svg: svgData }));
            } catch (error) {
                console.error('Error fetching SLD diagram:', error);
            } finally {
                setLoading(false);
            }
        },
        [currentNode, studyUuid, currentNodeId, currentRootNetworkUuid, paramUseName, networkVisuParams, language]
    );

    const updateDiagram = useCallback(
        (diagramParams: DiagramParams, fetch: boolean = true) => {
            setDiagram((prev) => {
                const updated: Diagram = { ...prev, ...diagramParams };
                if (fetch) fetchDiagram(updated);
                return updated;
            });
        },
        [fetchDiagram]
    );

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
    };
};
