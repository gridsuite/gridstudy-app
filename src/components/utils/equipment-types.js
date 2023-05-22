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
        name: 'substations',
        fetchers: [fetchSubstations],
    },
    VOLTAGE_LEVEL: {
        type: 'VOLTAGE_LEVEL',
        name: 'voltageLevels',
        fetchers: [fetchVoltageLevels],
    },
    LINE: {
        type: 'LINE',
        name: 'lines',
        fetchers: [fetchLines],
    },
    TWO_WINDINGS_TRANSFORMER: {
        type: 'TWO_WINDINGS_TRANSFORMER',
        name: 'twoWindingsTransformers',
        fetchers: [fetchTwoWindingsTransformers],
    },
    THREE_WINDINGS_TRANSFORMER: {
        type: 'THREE_WINDINGS_TRANSFORMER',
        name: 'threeWindingsTransformers',
        fetchers: [fetchThreeWindingsTransformers],
    },
    HVDC_LINE: {
        type: 'HVDC_LINE',
        name: 'hvdcLines',
        fetchers: [fetchHvdcLines],
    },
    GENERATOR: {
        type: 'GENERATOR',
        name: 'generators',
        fetchers: [fetchGenerators],
    },
    BATTERY: {
        type: 'BATTERY',
        name: 'batteries',
        fetchers: [fetchBatteries],
    },
    LOAD: {
        type: 'LOAD',
        name: 'loads',
        fetchers: [fetchLoads],
    },
    SHUNT_COMPENSATOR: {
        type: 'SHUNT_COMPENSATOR',
        name: 'shuntCompensators',
        fetchers: [fetchShuntCompensators],
    },
    DANGLING_LINE: {
        type: 'DANGLING_LINE',
        name: 'danglingLines',
        fetchers: [fetchDanglingLines],
    },
    STATIC_VAR_COMPENSATOR: {
        type: 'STATIC_VAR_COMPENSATOR',
        name: 'staticVarCompensators',
        fetchers: [fetchStaticVarCompensators],
    },
    HVDC_CONVERTER_STATION: {
        type: 'HVDC_CONVERTER_STATION',
        fetchers: [fetchLccConverterStations, fetchVscConverterStations],
    },
    VSC_CONVERTER_STATION: {
        type: 'VSC_CONVERTER_STATION',
        name: 'vscConverterStations',
        fetchers: [fetchVscConverterStations],
    },
    LCC_CONVERTER_STATION: {
        type: 'LCC_CONVERTER_STATION',
        name: 'lccConverterStations',
        fetchers: [fetchLccConverterStations],
    },
    SWITCH: {
        type: 'SWITCH',
        fetchers: [],
    },
};
