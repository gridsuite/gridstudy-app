/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
    fetchTwoWindingsTransformers,
    fetchVoltageLevels,
    fetchVscConverterStations,
    fetchTieLines,
} from '../../services/study/network';

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
    HVDC_CONVERTER_STATION: [
        fetchLccConverterStations,
        fetchVscConverterStations,
    ],
    VSC_CONVERTER_STATION: [fetchVscConverterStations],
    LCC_CONVERTER_STATION: [fetchLccConverterStations],
    SWITCH: [],
    BUS: [fetchBuses],
    TIE_LINE: [fetchTieLines],
};
