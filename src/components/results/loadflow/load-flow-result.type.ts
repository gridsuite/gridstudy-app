/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
import { UUID } from 'crypto';
import { BranchSide } from '../../utils/constants';

export interface ComponentResult {
    componentResultUuid: UUID;
    connectedComponentNum: number;
    synchronousComponentNum: number;
    status: string;
    iterationCount: number;
    slackBusResults: SlackBusResult[];
    distributedActivePower: number;
}

export interface SlackBusResult {
    id: string;
    activePowerMismatch: number;
}

export interface LoadFlowResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    componentResults: ComponentResult[];
}

export enum LimitTypes {
    HIGH_VOLTAGE = 'HIGH_VOLTAGE',
    LOW_VOLTAGE = 'LOW_VOLTAGE',
    CURRENT = 'CURRENT',
}

export interface LoadFlowTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

export interface LoadflowResultTap {
    isLoadingResult: boolean;
    columnDefs: ColDef<any>[];
    tableName: string;
}

export interface LoadflowResultProps extends LoadflowResultTap {
    result: LoadFlowResult;
}

export interface LimitViolationResultProps extends LoadflowResultTap {
    result: OverloadedEquipment[];
}

export interface OverloadedEquipment {
    overload: number;
    subjectId: string;
    locationId: string;
    value: number;
    actualOverloadDuration: number | null;
    upComingOverloadDuration: number | null;
    limit: number;
    limitName: string | null | undefined;
    side: string | undefined;
    limitType: string;
}

export interface OverloadedEquipmentFromBack {
    subjectId: string;
    locationId: string;
    limit: number;
    limitName: string | null;
    actualOverloadDuration: 300;
    upComingOverloadDuration: 300;
    overload: number;
    value: number;
    side: BranchSide | '';
    limitType: LimitTypes;
}
