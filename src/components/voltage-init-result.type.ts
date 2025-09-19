/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RunningStatus from './utils/running-status';
import { UUID } from 'crypto';
import { GlobalFilter } from './results/common/global-filter/global-filter-types';

export interface VoltageInitResultProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    result: any;
    status: RunningStatus;
    handleGlobalFilterChange: (value: GlobalFilter[]) => void;
    globalFilterOptions: GlobalFilter[];
}

export interface ReactiveSlack {
    busId: string;
    slack: number;
}

export interface ReactiveSlacks extends Array<ReactiveSlack> {}

export interface BusVoltage {
    busId: string;
    v: number;
    angle: number;
}

export interface BusVoltages extends Array<BusVoltage> {}

export interface Indicator {
    key: string;
    value: string;
}

export interface Indicators extends Array<Indicator> {}

export interface VoltageInitResultType {
    indicators: Indicators;
    reactiveSlacks: ReactiveSlacks;
    busVoltages: BusVoltages;
    reactiveSlacksOverThreshold: boolean;
    reactiveSlacksThreshold: number;
    modificationsGroupUuid: UUID;
}
