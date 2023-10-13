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

export interface ReduxState {
    studyUpdated: StudyUpdated;
    allBusesShortCircuitNotif: boolean;
    oneBusShortCircuitNotif: boolean;
    studyUuid: UUID;
    currentTreeNode: CurrentTreeNode;
    computingStatus: ComputingStatus;
    optionalServices: IOptionalService[];
    limitReduction: string;
    loadflowNotif: boolean;
    saNotif: boolean;
    sensiNotif: boolean;
    voltageInitNotif: boolean;
    dynamicSimulationNotif: boolean;
    user: User;
    oneBusShortCircuitAnalysisDiagram: oneBusShortCircuitAnalysisDiagram;
}

export interface oneBusShortCircuitAnalysisDiagram {
    diagramId: string;
    nodeId: UUID;
}

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

export interface StudyUpdatedEventData {
    headers: StudyUpdatedEventDataHeader;
    payload: string;
}

export interface StudyUpdated {
    force: 0 | 1;
    eventData: StudyUpdatedEventData;
}

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
    [ComputingType.LOADFLOW]: RunningStatus;
    [ComputingType.SECURITY_ANALYSIS]: RunningStatus;
    [ComputingType.SENSITIVITY_ANALYSIS]: RunningStatus;
    [ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]: RunningStatus;
    [ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]: RunningStatus;
    [ComputingType.DYNAMIC_SIMULATION]: RunningStatus;
    [ComputingType.VOLTAGE_INIT]: RunningStatus;
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
