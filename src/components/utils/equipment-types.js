/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    fetchBatteries,
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
} from 'utils/rest-api';

export const EQUIPMENT_INFOS_TYPES = {
    LIST: { type: 'LIST' },
    MAP: { type: 'MAP' },
    FORM: { type: 'FORM' },
    TAB: { type: 'TAB' },
};

export const EQUIPMENT_TYPES = {
    SUBSTATION: {
        type: 'SUBSTATION',
        fetchers: [fetchSubstations],
    },
    VOLTAGE_LEVEL: {
        type: 'VOLTAGE_LEVEL',
        fetchers: [fetchVoltageLevels],
    },
    LINE: {
        type: 'LINE',
        fetchers: [fetchLines],
    },
    TWO_WINDINGS_TRANSFORMER: {
        type: 'TWO_WINDINGS_TRANSFORMER',
        fetchers: [fetchTwoWindingsTransformers],
    },
    THREE_WINDINGS_TRANSFORMER: {
        type: 'THREE_WINDINGS_TRANSFORMER',
        fetchers: [fetchThreeWindingsTransformers],
    },
    HVDC_LINE: {
        type: 'HVDC_LINE',
        fetchers: [fetchHvdcLines],
    },
    GENERATOR: {
        type: 'GENERATOR',
        fetchers: [fetchGenerators],
    },
    BATTERY: {
        type: 'BATTERY',
        fetchers: [fetchBatteries],
    },
    LOAD: {
        type: 'LOAD',
        fetchers: [fetchLoads],
    },
    SHUNT_COMPENSATOR: {
        type: 'SHUNT_COMPENSATOR',
        fetchers: [fetchShuntCompensators],
    },
    DANGLING_LINE: {
        type: 'DANGLING_LINE',
        fetchers: [fetchDanglingLines],
    },
    STATIC_VAR_COMPENSATOR: {
        type: 'STATIC_VAR_COMPENSATOR',
        fetchers: [fetchStaticVarCompensators],
    },
    HVDC_CONVERTER_STATION: {
        type: 'HVDC_CONVERTER_STATION',
        fetchers: [fetchLccConverterStations, fetchVscConverterStations],
    },
    VSC_CONVERTER_STATION: {
        type: 'VSC_CONVERTER_STATION',
        fetchers: [fetchVscConverterStations],
    },
    LCC_CONVERTER_STATION: {
        type: 'LCC_CONVERTER_STATION',
        fetchers: [fetchLccConverterStations],
    },
    SWITCH: {
        type: 'SWITCH',
        fetchers: [],
    },
};
