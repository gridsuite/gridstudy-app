/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES } from 'components/utils/modification-type';
import {
    EQUIPMENT_ID,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    SHUNT_CONDUCTANCE_1,
    SHUNT_CONDUCTANCE_2,
    SHUNT_SUSCEPTANCE_1,
    SHUNT_SUSCEPTANCE_2,
} from 'components/utils/field-constants';
import { microUnitToUnit, unitToMicroUnit } from 'utils/rounding';
import { toModificationOperation } from 'components/utils/utils';

export interface TabularModificationFields {
    [key: string]: string[];
}

export const TABULAR_MODIFICATION_FIELDS: TabularModificationFields = {
    GENERATOR: [
        'equipmentId',
        'energySource',
        'minActivePower',
        'maxActivePower',
        'activePowerSetpoint',
        'ratedNominalPower',
        'reactivePowerSetpoint',
        'voltageRegulationOn',
        'voltageSetpoint',
    ],
    BATTERY: [
        'equipmentId',
        'minActivePower',
        'activePowerSetpoint',
        'maxActivePower',
        'reactivePowerSetpoint',
    ],
    VOLTAGE_LEVEL: [
        'equipmentId',
        'nominalVoltage',
        'lowVoltageLimit',
        'highVoltageLimit',
    ],
    LINE: [
        EQUIPMENT_ID,
        SERIES_RESISTANCE,
        SERIES_REACTANCE,
        SHUNT_CONDUCTANCE_1,
        SHUNT_CONDUCTANCE_2,
        SHUNT_SUSCEPTANCE_1,
        SHUNT_SUSCEPTANCE_2,
    ],
    LOAD: [
        'equipmentId',
        'loadType',
        'constantActivePower',
        'constantReactivePower',
    ],
    TWO_WINDINGS_TRANSFORMER: [
        EQUIPMENT_ID,
        SERIES_RESISTANCE,
        SERIES_REACTANCE,
        MAGNETIZING_CONDUCTANCE,
        MAGNETIZING_SUSCEPTANCE,
        RATED_VOLTAGE_1,
        RATED_VOLTAGE_2,
        RATED_S,
    ],
};

export const TABULAR_MODIFICATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
    BATTERY: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
    VOLTAGE_LEVEL: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
    LINE: MODIFICATION_TYPES.LINE_MODIFICATION.type,
    TWO_WINDINGS_TRANSFORMER:
        MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
};

export interface Modification {
    [key: string]: any;
}

export const formatModification = (modification: Modification) => {
    //exclude type, date and uuid from modification object
    const { type, date, uuid, ...rest } = modification;
    return rest;
};

export const convertValueFromBackToFront = (
    key: string,
    value: { value: string | number }
) => {
    switch (key) {
        case EQUIPMENT_ID:
            return value;
        case MAGNETIZING_CONDUCTANCE:
        case MAGNETIZING_SUSCEPTANCE:
        case SHUNT_CONDUCTANCE_1:
        case SHUNT_CONDUCTANCE_2:
        case SHUNT_SUSCEPTANCE_1:
        case SHUNT_SUSCEPTANCE_2:
            return unitToMicroUnit(value?.value);
        default:
            return value?.value;
    }
};

export const convertValueFromFrontToBack = (
    key: string,
    value: string | number
) => {
    switch (key) {
        case EQUIPMENT_ID:
            return value;
        case MAGNETIZING_CONDUCTANCE:
        case MAGNETIZING_SUSCEPTANCE:
        case SHUNT_CONDUCTANCE_1:
        case SHUNT_CONDUCTANCE_2:
        case SHUNT_SUSCEPTANCE_1:
        case SHUNT_SUSCEPTANCE_2:
            return toModificationOperation(microUnitToUnit(value));
        default:
            return toModificationOperation(value);
    }
};

export const getEquipmentTypeFromModificationType = (type: string) => {
    return Object.keys(TABULAR_MODIFICATION_TYPES).find(
        (key) => TABULAR_MODIFICATION_TYPES[key] === type
    );
};

export const styles = {
    grid: { height: 500, width: '100%' },
};
