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
        plurial: 'substations',
        fetchers: [fetchSubstations],
    },
    VOLTAGE_LEVEL: {
        type: 'VOLTAGE_LEVEL',
        plurial: 'voltageLevels',
        fetchers: [fetchVoltageLevels],
    },
    LINE: {
        type: 'LINE',
        plurial: 'lines',
        fetchers: [fetchLines],
    },
    TWO_WINDINGS_TRANSFORMER: {
        type: 'TWO_WINDINGS_TRANSFORMER',
        plurial: 'twoWindingsTransformers',
        fetchers: [fetchTwoWindingsTransformers],
    },
    THREE_WINDINGS_TRANSFORMER: {
        type: 'THREE_WINDINGS_TRANSFORMER',
        plurial: 'threeWindingsTransformers',
        fetchers: [fetchThreeWindingsTransformers],
    },
    HVDC_LINE: {
        type: 'HVDC_LINE',
        plurial: 'hvdcLines',
        fetchers: [fetchHvdcLines],
    },
    GENERATOR: {
        type: 'GENERATOR',
        plurial: 'generators',
        fetchers: [fetchGenerators],
    },
    BATTERY: {
        type: 'BATTERY',
        plurial: 'batteries',
        fetchers: [fetchBatteries],
    },
    LOAD: {
        type: 'LOAD',
        plurial: 'loads',
        fetchers: [fetchLoads],
    },
    SHUNT_COMPENSATOR: {
        type: 'SHUNT_COMPENSATOR',
        plurial: 'shuntCompensators',
        fetchers: [fetchShuntCompensators],
    },
    DANGLING_LINE: {
        type: 'DANGLING_LINE',
        plurial: 'danglingLines',
        fetchers: [fetchDanglingLines],
    },
    STATIC_VAR_COMPENSATOR: {
        type: 'STATIC_VAR_COMPENSATOR',
        plurial: 'staticVarCompensators',
        fetchers: [fetchStaticVarCompensators],
    },
    HVDC_CONVERTER_STATION: {
        type: 'HVDC_CONVERTER_STATION',
        fetchers: [fetchLccConverterStations, fetchVscConverterStations],
    },
    VSC_CONVERTER_STATION: {
        type: 'VSC_CONVERTER_STATION',
        plurial: 'vscConverterStations',
        fetchers: [fetchVscConverterStations],
    },
    LCC_CONVERTER_STATION: {
        type: 'LCC_CONVERTER_STATION',
        plurial: 'lccConverterStations',
        fetchers: [fetchLccConverterStations],
    },
    SWITCH: {
        type: 'SWITCH',
        fetchers: [],
    },
};
