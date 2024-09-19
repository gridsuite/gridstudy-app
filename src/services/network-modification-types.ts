/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ConverterStationElementModificationInfos } from '../components/dialogs/network-modifications/vsc/converter-station/converter-station-utils';

export interface HvdcAngleDroopActivePowerControlInfo {
    isEnabled: boolean;
    droop: number;
    p0: number;
}

export interface hvdcOperatorActivePowerRange {
    oprFromCS1toCS2: number;
    oprFromCS2toCS1: number;
}
export interface VscModificationInfo {
    id: string;
    name: string;
    nominalV: number;
    r: number;
    maxP: number;
    hvdcOperatorActivePowerRange: hvdcOperatorActivePowerRange;
    convertersMode: string;
    activePowerSetpoint: number;
    hvdcAngleDroopActivePowerControl: HvdcAngleDroopActivePowerControlInfo;
    converterStation1: ConverterStationElementModificationInfos;
    converterStation2: ConverterStationElementModificationInfos;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    busbarSectionName?: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
}
