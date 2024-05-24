/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComputingType } from 'components/computing-status/computing-type';
import { ValueOf } from 'components/study-container/type/utils.type';
import { RunningStatus } from 'components/utils/running-status';
import { UUID } from 'crypto';
import { directoriesNotificationType } from 'utils/directories-notification-type';
import { Filter } from '../components/results/common/results-global-filter';
import { IOptionalService } from '../components/utils/optional-services';
import { STUDY_INDEXATION_STATUS } from './actions';

export enum UpdateTypes {
    STUDY = 'study',
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
    mapEquipments: any;
    limitReductionModified: boolean;
    paramsLoaded: boolean;
    studyIndexationStatus: ValueOf<typeof STUDY_INDEXATION_STATUS>;
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
    notificationType?: ValueOf<typeof directoriesNotificationType>;
    directoryUuid?: UUID;
    indexation_status?: ValueOf<typeof STUDY_INDEXATION_STATUS>;
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
export interface StudyUpdatedEventData {
    headers: StudyUpdatedEventDataHeader;
    payload: NetworkImpactsInfos;
}

export interface StudyUpdatedEventDataUnknown {
    headers: StudyUpdatedEventDataHeader;
    payload: string;
}

// Notification types
export type StudyUpdatedStudy = {
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
