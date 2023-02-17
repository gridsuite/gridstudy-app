export const FEEDER_TYPES = {
    SUBSTATION: {
        type: 'SUBSTATION',
    },
    VOLTAGE_LEVEL: {
        type: 'VOLTAGE_LEVEL',
    },
    LINE: {
        type: 'LINE',
    },
    TWO_WINDINGS_TRANSFORMER: {
        type: 'TWO_WINDINGS_TRANSFORMER',
    },
    THREE_WINDINGS_TRANSFORMER: {
        type: 'THREE_WINDINGS_TRANSFORMER',
    },
    HVDC_LINE: {
        type: 'HVDC_LINE',
    },
    GENERATOR: {
        type: 'GENERATOR',
    },
    BATTERY: {
        type: 'BATTERY',
    },
    LOAD: {
        type: 'LOAD',
    },
    SHUNT_COMPENSATOR: {
        type: 'SHUNT_COMPENSATOR',
    },
    DANGLING_LINE: {
        type: 'DANGLING_LINE',
    },
    STATIC_VAR_COMPENSATOR: {
        type: 'STATIC_VAR_COMPENSATOR',
    },
    HVDC_CONVERTER_STATION: {
        type: 'HVDC_CONVERTER_STATION',
    },
    /**
     * these are ComponentTypeNames from powsybl-single-line-diagram but we put them here because some ComponentTypeNames are also EquipmentsNames
     */
    VSC_CONVERTER_STATION: {
        type: 'VSC_CONVERTER_STATION',
    },
    LCC_CONVERTER_STATION: {
        type: 'LCC_CONVERTER_STATION',
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
