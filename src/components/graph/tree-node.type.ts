/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { UUID } from 'node:crypto';
import { BuildStatus } from '@gridsuite/commons-ui/components/node/constant';
import { Node } from '@xyflow/react';

export enum NodeType {
    ROOT = 'ROOT',
    NETWORK_MODIFICATION = 'NETWORK_MODIFICATION',
}

export enum NetworkModificationNodeType {
    CONSTRUCTION = 'CONSTRUCTION',
    SECURITY = 'SECURITY',
}

export type AbstractNode = {
    id: UUID;
    name: string;
    children: AbstractNode[];
    childrenIds: UUID[];
    description?: string;
    readOnly?: boolean;
    reportUuid?: UUID;
    type: NodeType;
    columnPosition?: number;
};

export type NetworkModificationNodeInfos = {
    id: UUID;
    nodeType?: NetworkModificationNodeType;
};
export type StashedNodeProperties = {
    first: AbstractNode;
    second: number; // children size
};

export interface NodeBuildStatus {
    globalBuildStatus: BuildStatus;
    localBuildStatus: BuildStatus;
}

export type RootNodeData = AbstractNode & {
    studyId: UUID;
};

export type NetworkModificationNodeData = AbstractNode & {
    modificationGroupUuid?: UUID;
    variantId?: string;
    modificationsToExclude?: UUID[];
    loadFlowResultUuid?: UUID;
    shortCircuitAnalysisResultUuid?: UUID;
    oneBusShortCircuitAnalysisResultUuid?: UUID;
    voltageInitResultUuid?: UUID;
    securityAnalysisResultUuid?: UUID;
    sensitivityAnalysisResultUuid?: UUID;
    dynamicSimulationResultUuid?: UUID;
    stateEstimationResultUuid?: UUID;
    pccMinResultUuid?: UUID;
    nodeBuildStatus?: NodeBuildStatus;
    nodeType?: NetworkModificationNodeType;
};

export type NodeCommonData = {
    label: string;
    globalBuildStatus?: BuildStatus;
    description?: string;
    readOnly?: boolean;
    nodeType?: NetworkModificationNodeType;
};
export type ReactFlowModificationNodeData = NodeCommonData & { localBuildStatus?: BuildStatus };

export type ModificationNode = Node<ReactFlowModificationNodeData, NodeType.NETWORK_MODIFICATION> & {
    id: UUID;
};

export type RootNode = Node<NodeCommonData, NodeType.ROOT> & { id: UUID };

export type CurrentTreeNode = ModificationNode | RootNode;

export const isSecurityModificationNode = (node: CurrentTreeNode | undefined | null): node is ModificationNode => {
    return (
        !!node &&
        node.type === NodeType.NETWORK_MODIFICATION &&
        node.data?.nodeType === NetworkModificationNodeType.SECURITY
    );
};
