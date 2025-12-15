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
import { PanelType } from '../types/workspace.types';
import type { UUID } from 'node:crypto';
import { NadPanelContent } from './diagrams/nad/nad-panel-content';
import { VoltageLevelPanelContent } from './diagrams/sld/voltage-level-panel-content';
import { SubstationPanelContent } from './diagrams/sld/substation-panel-content';
import { MapPanelContent } from './map-panel-content';
import { TreePanelContent } from './tree-panel-content';
import NodeEditor from 'components/graph/menus/network-modifications/node-editor';
import EventModificationScenarioEditor from 'components/graph/menus/dynamic-simulation/event-modification-scenario-editor';
import type { CurrentTreeNode } from '../../../components/graph/tree-node.type';

export interface PanelContentProps {
    panelId: UUID;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    currentNode: CurrentTreeNode;
}

type PanelRenderer = (props: PanelContentProps) => React.ReactNode;

export const PANEL_CONTENT_REGISTRY: Record<PanelType, PanelRenderer> = {
    [PanelType.TREE]: ({ panelId, studyUuid, currentRootNetworkUuid }) => (
        <ReactFlowProvider>
            <TreePanelContent panelId={panelId} studyUuid={studyUuid} currentRootNetworkUuid={currentRootNetworkUuid} />
        </ReactFlowProvider>
    ),

    [PanelType.SPREADSHEET]: ({ panelId, currentNode }) => (
        <SpreadsheetView panelId={panelId} currentNode={currentNode} disabled={!isNodeBuilt(currentNode)} />
    ),

    [PanelType.LOGS]: ({ currentNode }) => (
        // @ts-expect-error - ReportViewerTab is .jsx file without ts types
        <ReportViewerTab visible={true} currentNode={currentNode} disabled={!isNodeBuilt(currentNode)} />
    ),

    [PanelType.RESULTS]: ({ studyUuid, currentNode, currentRootNetworkUuid }) => (
        <ResultViewTab
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            disabled={!isNodeBuilt(currentNode)}
        />
    ),

    [PanelType.PARAMETERS]: () => <ParametersTabs />,

    [PanelType.SLD_VOLTAGE_LEVEL]: ({ panelId, studyUuid, currentNode, currentRootNetworkUuid }) => (
        <VoltageLevelPanelContent
            panelId={panelId}
            studyUuid={studyUuid}
            currentNodeId={currentNode.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    ),

    [PanelType.SLD_SUBSTATION]: ({ panelId, studyUuid, currentNode, currentRootNetworkUuid }) => (
        <SubstationPanelContent
            panelId={panelId}
            studyUuid={studyUuid}
            currentNodeId={currentNode.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    ),

    [PanelType.NAD]: ({ panelId, studyUuid, currentNode, currentRootNetworkUuid }) => (
        <NadPanelContent
            panelId={panelId}
            studyUuid={studyUuid}
            currentNodeId={currentNode.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    ),

    [PanelType.MAP]: ({ panelId, studyUuid, currentRootNetworkUuid, currentNode }) => (
        <MapPanelContent
            panelId={panelId}
            studyUuid={studyUuid}
            currentRootNetworkUuid={currentRootNetworkUuid}
            currentNode={currentNode}
        />
    ),

    [PanelType.NODE_EDITOR]: () => <NodeEditor />,

    [PanelType.EVENT_SCENARIO]: () => <EventModificationScenarioEditor />,
};
