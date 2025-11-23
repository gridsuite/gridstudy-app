/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactFlowProvider } from '@xyflow/react';
import { SpreadsheetView } from '../../spreadsheet-view/spreadsheet-view';
import { ReportViewerTab } from '../../report-viewer-tab.jsx';
import { ResultViewTab } from '../../result-view-tab';
import ParametersTabs from '../../parameters-tabs';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { WindowType } from '../types/workspace.types';
import type { UUID } from 'node:crypto';
import { NadWindowContent } from './diagrams/nad/nad-window-content';
import { SldWindowContent } from './diagrams/sld/sld-window-content';
import { MapWindowContent } from './map-window-content';
import { TreeWindowContent } from './tree-window-content';
import NodeEditor from 'components/graph/menus/network-modifications/node-editor';
import EventModificationScenarioEditor from 'components/graph/menus/dynamic-simulation/event-modification-scenario-editor';
import type { CurrentTreeNode } from '../../../components/graph/tree-node.type';

export interface WindowContentProps {
    windowId: UUID;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    currentNode: CurrentTreeNode;
}

type WindowRenderer = (props: WindowContentProps) => React.ReactNode;

export const WINDOW_CONTENT_REGISTRY: Record<WindowType, WindowRenderer> = {
    [WindowType.TREE]: ({ windowId, studyUuid, currentRootNetworkUuid }) => (
        <ReactFlowProvider>
            <TreeWindowContent
                windowId={windowId}
                studyUuid={studyUuid}
                currentRootNetworkUuid={currentRootNetworkUuid}
            />
        </ReactFlowProvider>
    ),

    [WindowType.SPREADSHEET]: ({ currentNode }) => (
        <SpreadsheetView currentNode={currentNode} disabled={!isNodeBuilt(currentNode)} />
    ),

    [WindowType.LOGS]: ({ currentNode }) => (
        // @ts-expect-error - ReportViewerTab is .jsx file without ts types
        <ReportViewerTab visible={true} currentNode={currentNode} disabled={!isNodeBuilt(currentNode)} />
    ),

    [WindowType.RESULTS]: ({ studyUuid, currentNode, currentRootNetworkUuid }) => (
        <ResultViewTab
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            disabled={!isNodeBuilt(currentNode)}
        />
    ),

    [WindowType.PARAMETERS]: () => <ParametersTabs />,

    [WindowType.SLD]: ({ windowId, studyUuid, currentNode, currentRootNetworkUuid }) => (
        <SldWindowContent
            windowId={windowId}
            studyUuid={studyUuid}
            currentNodeId={currentNode.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    ),

    [WindowType.NAD]: ({ windowId, studyUuid, currentNode, currentRootNetworkUuid }) => (
        <NadWindowContent
            windowId={windowId}
            studyUuid={studyUuid}
            currentNodeId={currentNode.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    ),

    [WindowType.MAP]: ({ windowId, studyUuid, currentRootNetworkUuid, currentNode }) => (
        <MapWindowContent
            windowId={windowId}
            studyUuid={studyUuid}
            currentRootNetworkUuid={currentRootNetworkUuid}
            currentNode={currentNode}
        />
    ),

    [WindowType.NODE_EDITOR]: () => <NodeEditor />,

    [WindowType.EVENT_SCENARIO]: () => <EventModificationScenarioEditor />,
};
