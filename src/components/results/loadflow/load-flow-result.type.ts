/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
import type { UUID } from 'node:crypto';
import { BranchSide } from '../../utils/constants';

export interface ComponentResult {
    componentResultUuid: UUID;
    connectedComponentNum: number;
    synchronousComponentNum: number;
    status: string;
    iterationCount: number;
    slackBusResults: SlackBusResult[];
    distributedActivePower: number;
    consumptions: number;
    generations: number;
    exchanges: number;
    losses: number;
}

export interface CountryAdequacy {
    countryAdequacyUuid: UUID;
    country: string;
    load: number;
    generation: number;
    losses: number;
    netPosition: number;
}

export interface ExchangeValue {
    exchangeUuid: UUID;
    country: string;
    exchange: number;
}

export interface ExchangePair {
    exchangeUuid?: UUID;
    countryA: string;
    countryB: string;
    exchange: number;
}

export interface SlackBusResult {
    id: string;
    activePowerMismatch: number;
}

export interface LoadFlowResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    componentResults: ComponentResult[];
    countryAdequacies: CountryAdequacy[];
    exchanges: Record<string, ExchangeValue[]>;
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
    tableName: string;
}

export interface LoadflowResultProps extends LoadflowResultTap {
    result: LoadFlowResult;
    componentColumnDefs: ColDef<any>[];
    countryAdequaciesColumnDefs: ColDef<any>[];
    exchangesColumnDefs: ColDef<any>[];
    computationSubType: string;
}

export interface LimitViolationResultProps extends LoadflowResultTap {
    result: OverloadedEquipment[];
    columnDefs: ColDef<any>[];
    computationSubType: string;
}

export interface OverloadedEquipment {
    overload: number;
    patlOverload: number;
    subjectId: string;
    locationId: string;
    value: number;
    actualOverloadDuration: number | null;
    upComingOverloadDuration: number | null;
    limit: number;
    patlLimit: number;
    limitName: string | null | undefined;
    nextLimitName: string | null | undefined;
    side: string | undefined;
    limitType: string;
}

export interface OverloadedEquipmentFromBack {
    subjectId: string;
    locationId: string;
    limit: number;
    patlLimit: number;
    limitName: string | null;
    nextLimitName: string | null | undefined;
    actualOverloadDuration: 300;
    upComingOverloadDuration: 300;
    overload: number;
    patlOverload: number;
    value: number;
    side: BranchSide | '';
    limitType: LimitTypes;
}
