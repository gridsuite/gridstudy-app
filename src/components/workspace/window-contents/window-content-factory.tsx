/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { ReactFlowProvider } from '@xyflow/react';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import NetworkModificationTreePane from '../../network-modification-tree-pane';
import { SpreadsheetView } from '../../spreadsheet-view/spreadsheet-view';
import { ReportViewerTab } from '../../report-viewer-tab.jsx';
import { ResultViewTab } from '../../result-view-tab';
import ParametersTabs from '../../parameters-tabs';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { WindowType, type DiagramWindowData } from '../types/workspace.types';
import type { UUID } from 'node:crypto';
import { DiagramWindowContent } from './diagrams/diagram-window-content';
import { MapWindowContent } from './map-window-content';
import NodeEditor from 'components/graph/menus/network-modifications/node-editor';
import EventModificationScenarioEditor from 'components/graph/menus/dynamic-simulation/event-modification-scenario-editor';
import type { AppState } from '../../../redux/reducer';

export const WindowContentFactory = memo(
    ({
        windowType,
        windowData,
        windowId,
    }: {
        windowType: WindowType;
        windowData: unknown;
        windowId: UUID;
    }): React.ReactNode => {
        const studyUuid = useSelector((state: AppState) => state.studyUuid);
        const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
        const currentNode = useSelector((state: AppState) => state.currentTreeNode);

        if (!studyUuid || !currentRootNetworkUuid || !currentNode) {
            return null;
        }

        switch (windowType) {
            case WindowType.TREE:
                return (
                    <ReactFlowProvider>
                        <NetworkModificationTreePane
                            studyUuid={studyUuid}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                        />
                    </ReactFlowProvider>
                );

            case WindowType.SPREADSHEET:
                return <SpreadsheetView currentNode={currentNode} disabled={!isNodeBuilt(currentNode)} />;

            case WindowType.LOGS:
                return (
                    // @ts-expect-error - ReportViewerTab is .jsx file without ts types
                    <ReportViewerTab visible={true} currentNode={currentNode} disabled={!isNodeBuilt(currentNode)} />
                );

            case WindowType.RESULTS:
                return (
                    <ResultViewTab
                        studyUuid={studyUuid as UUID}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid as UUID}
                        disabled={!isNodeBuilt(currentNode)}
                    />
                );

            case WindowType.PARAMETERS:
                return <ParametersTabs />;

            case WindowType.DIAGRAM: {
                const diagramData = windowData as DiagramWindowData | undefined;
                if (!diagramData) {
                    return null;
                }
                return (
                    <DiagramWindowContent
                        diagramData={diagramData}
                        windowId={windowId}
                        studyUuid={studyUuid as UUID}
                        currentNodeId={currentNode.id}
                        currentRootNetworkUuid={currentRootNetworkUuid as UUID}
                    />
                );
            }

            case WindowType.MAP:
                return (
                    <MapWindowContent
                        studyUuid={studyUuid! as UUID}
                        currentRootNetworkUuid={currentRootNetworkUuid! as UUID}
                        currentNode={currentNode!}
                    />
                );

            case WindowType.NODE_EDITOR:
                return <NodeEditor />;

            case WindowType.EVENT_SCENARIO:
                return <EventModificationScenarioEditor />;

            default:
                return null;
        }
    }
);
