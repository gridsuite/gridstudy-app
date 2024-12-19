/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { BUILD_STATUS } from '../network/constants';

export enum NodeType {
    ROOT = 'ROOT',
    NETWORK_MODIFICATION = 'NETWORK_MODIFICATION',
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

export interface NodeBuildStatus {
    globalBuildStatus: BUILD_STATUS;
    localBuildStatus: BUILD_STATUS;
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
    nonEvacuatedEnergyResultUuid?: UUID;
    dynamicSimulationResultUuid?: UUID;
    stateEstimationResultUuid?: UUID;
    nodeBuildStatus?: NodeBuildStatus;
};
