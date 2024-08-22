/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import {
    fetchBatteries,
    fetchBuses,
    fetchDanglingLines,
    fetchGenerators,
    fetchHvdcLines,
    fetchLccConverterStations,
    fetchLines,
    fetchLoads,
    fetchShuntCompensators,
    fetchStaticVarCompensators,
    fetchSubstations,
    fetchThreeWindingsTransformers,
    fetchTieLines,
    fetchTwoWindingsTransformers,
    fetchVoltageLevels,
    fetchVscConverterStations,
} from '../../services/study/network';
import { EQUIPMENT_TYPES } from './equipment-types';
import { IEquipment } from '../../services/study/contingency-list';

//TODO use the type from network when passed to ts
export type EquipmentFetcher = (
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: UUID[]
) => Promise<IEquipment[]>;

export const EQUIPMENT_FETCHERS = {
    SUBSTATION: [fetchSubstations],
    VOLTAGE_LEVEL: [fetchVoltageLevels],
    LINE: [fetchLines],
    TWO_WINDINGS_TRANSFORMER: [fetchTwoWindingsTransformers],
    THREE_WINDINGS_TRANSFORMER: [fetchThreeWindingsTransformers],
    HVDC_LINE: [fetchHvdcLines],
    GENERATOR: [fetchGenerators],
    BATTERY: [fetchBatteries],
    LOAD: [fetchLoads],
    SHUNT_COMPENSATOR: [fetchShuntCompensators],
    DANGLING_LINE: [fetchDanglingLines],
    STATIC_VAR_COMPENSATOR: [fetchStaticVarCompensators],
    HVDC_CONVERTER_STATION: [fetchLccConverterStations, fetchVscConverterStations],
    VSC_CONVERTER_STATION: [fetchVscConverterStations],
    LCC_CONVERTER_STATION: [fetchLccConverterStations],
    SWITCH: [],
    BUS: [fetchBuses],
    TIE_LINE: [fetchTieLines],
} as const satisfies Record<
    Readonly<Exclude<EQUIPMENT_TYPES, EQUIPMENT_TYPES.BUSBAR_SECTION>>,
    Readonly<EquipmentFetcher>
>;