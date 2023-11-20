/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { BranchSide } from '../../utils/constants';

export interface ComponentResult {
    componentResultUuid: UUID;
    connectedComponentNum: number;
    synchronousComponentNum: number;
    status: string;
    iterationCount: number;
    slackBusId: string;
    slackBusActivePowerMismatch: number;
    distributedActivePower: number;
}
export interface LoadFlowResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    componentResults: ComponentResult[];
}
export enum LimitNames {
    NA = 'N/A',
}

export enum LimitTypes {
    HIGH_VOLTAGE = 'HIGH_VOLTAGE',
    LOW_VOLTAGE = 'LOW_VOLTAGE',
    CURRENT = 'CURRENT',
}
export interface LoadFlowTabProps {
    studyUuid: UUID;
    nodeUuid: UUID | undefined;
}
export interface LoadflowResultProps extends LoadFlowTabProps {
    result: LoadFlowResult;
    tabIndex: number;
    isWaiting: boolean;
}

export interface OverloadedEquipment {
    overload: number;
    name: string;
    value: number;
    actualOverload: number | null;
    upComingOverload: number | null;
    limit: number;
    limitName: string | null;
    side: string | undefined;
    limitType: string;
}
export interface OverloadedEquipmentFromBack {
    subjectId: string;
    limit: number;
    limitName: string | null;
    actualOverload: 300;
    upComingOverload: 300;
    value: number;
    side: BranchSide | '';
    limitType: LimitTypes;
}
