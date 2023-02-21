import { EQUIPMENT_TYPES } from './equipment-types';

const equipmentTypesWithTypeOnly = Object.fromEntries(
    Object.entries(EQUIPMENT_TYPES).map(([key, value]) => [
        key,
        { type: value.type },
    ])
);

export const FEEDER_TYPES = {
    ...equipmentTypesWithTypeOnly,
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
