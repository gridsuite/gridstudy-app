/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { UUID } from 'crypto';
import { IOptionalService } from '../components/utils/optional-services';
import { Filter } from '../components/results/common/results-global-filter';
import { MapEquipments } from '@powsybl/diagram-viewer';

export enum UpdateTypes {
    STUDY = 'study',
}

export enum StudyIndexationStatus {
    NOT_INDEXED = 'NOT_INDEXED',
    INDEXING_ONGOING = 'INDEXING_ONGOING',
    INDEXED = 'INDEXED',
}

export enum StudyDisplayMode {
    MAP = 'Map',
    TREE = 'Tree',
    HYBRID = 'Hybrid',
    DRAW = 'Draw',
}

export interface ReduxState {
    studyUpdated: StudyUpdated;
    studyUuid: UUID;
    currentTreeNode: CurrentTreeNode;
    computingStatus: ComputingStatus;
    lastCompletedComputation: ComputingType;
    computationStarting: boolean;
    optionalServices: IOptionalService[];
    limitReduction: string;
    user: User;
    oneBusShortCircuitAnalysisDiagram: oneBusShortCircuitAnalysisDiagram;
    notificationIdList: UUID[];
    theme: string;
    nonEvacuatedEnergyNotif: boolean;
    recentGlobalFilters: Filter[];
    mapEquipments: MapEquipments | null;
    networkAreaDiagramNbVoltageLevels: number;
    networkAreaDiagramDepth: number;
    studyDisplayMode: StudyDisplayMode;
    studyIndexationStatus: StudyIndexationStatus;
}

export interface oneBusShortCircuitAnalysisDiagram {
    diagramId: string;
    nodeId: UUID;
}

// Headers
export interface StudyUpdatedEventDataHeader {
    studyUuid: UUID;
    parentNode: UUID;
    timestamp: number;
    updateType?: string;
    node?: UUID;
    nodes?: UUID[];
    error?: string;
    userId?: string;
}

// Payloads
export interface DeletedEquipment {
    equipmentId: string;
    equipmentType: string;
}

export interface NetworkImpactsInfos {
    impactedSubstationsIds: UUID[];
    deletedEquipments: DeletedEquipment[];
    impactedElementTypes: string[];
}

// EventData
interface StudyUpdatedEventData {
    headers: StudyUpdatedEventDataHeader;
    payload: NetworkImpactsInfos;
}

interface StudyUpdatedEventDataUnknown {
    headers: StudyUpdatedEventDataHeader;
    payload: string;
}

// Notification types
type StudyUpdatedStudy = {
    type: UpdateTypes.STUDY;
    eventData: StudyUpdatedEventData;
};

type StudyUpdatedUndefined = {
    type: undefined;
    eventData: StudyUpdatedEventDataUnknown;
};

// Redux state
export type StudyUpdated = {
    force: 0 | 1;
} & (StudyUpdatedUndefined | StudyUpdatedStudy);

export interface CurrentTreeNodeData {
    parentNodeUuid: UUID;
    label: string;
    description: string;
    buildStatus: string;
    readonly: boolean;
}

export interface CurrentTreeNode {
    id: UUID;
    type: string;
    data: CurrentTreeNodeData;
    targetPosition: string;
    sourcePosition: string;
}

export interface ComputingStatus {
    [ComputingType.LOAD_FLOW]: RunningStatus;
    [ComputingType.SECURITY_ANALYSIS]: RunningStatus;
    [ComputingType.SENSITIVITY_ANALYSIS]: RunningStatus;
    [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]: RunningStatus;
    [ComputingType.SHORT_CIRCUIT]: RunningStatus;
    [ComputingType.SHORT_CIRCUIT_ONE_BUS]: RunningStatus;
    [ComputingType.DYNAMIC_SIMULATION]: RunningStatus;
    [ComputingType.VOLTAGE_INITIALIZATION]: RunningStatus;
    [ComputingType.STATE_ESTIMATION]: RunningStatus;
}

export interface User {
    id_token: string;
    access_token: string;
    token_type: string;
    scope: string;
    profile: Profile;
    expires_at: number;
}

interface Profile {
    sub: string;
    name: string;
    email: string;
    s_hash: string;
}
