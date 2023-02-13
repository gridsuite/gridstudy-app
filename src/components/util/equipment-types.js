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
    BUSBAR_SECTION: {
        type: 'BUSBAR_SECTION',
    },
    BUS: {
        type: 'BUS',
    },
    SWITCH: {
        type: 'SWITCH',
    },
    VSC_CONVERTER_STATION: {
        type: 'VSC_CONVERTER_STATION',
    },
    LCC_CONVERTER_STATION: {
        type: 'LCC_CONVERTER_STATION',
    },
    CAPACITOR: {
        type: 'CAPACITOR',
    },
    INDUCTOR: {
        type: 'INDUCTOR',
    },
    TWO_WINDINGS_TRANSFORMER_LEG: {
        type: 'TWO_WINDINGS_TRANSFORMER_LEG',
    },
    PHASE_SHIFT_TRANSFORMER: {
        type: 'PHASE_SHIFT_TRANSFORMER',
    },
    THREE_WINDINGS_TRANSFORMER_LEG: {
        type: 'THREE_WINDINGS_TRANSFORMER_LEG',
    },
};
