import { UUID } from 'crypto';
import { BUILD_STATUS } from '../network/constants';

export enum NodeType {
    ROOT = 'ROOT',
    NETWORK_MODIFICATION = 'NETWORK_MODIFICATION',
}

export interface AbstractNode {
    id: UUID;
    name: string;
    children: AbstractNode[];
    childrenIds: UUID[];
    description?: string;
    readOnly?: boolean;
    reportUuid?: UUID;
    type: NodeType;
}

export interface NodeBuildStatus {
    globalBuildStatus: BUILD_STATUS;
    localBuildStatus: BUILD_STATUS;
}

export interface RootNode extends AbstractNode {
    studyId: UUID;
}

export interface NetworkModificationNode extends AbstractNode {
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
}
