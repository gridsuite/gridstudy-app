/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES } from 'components/utils/modification-type';
import {
    EQUIPMENT_ID,
    SUBSTATION_COUNTRY,
} from '../../../utils/field-constants';

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
    LOAD: ['equipmentId', 'activePower'],
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
    SUBSTATION: [EQUIPMENT_ID, SUBSTATION_COUNTRY],
};

export const TABULAR_MODIFICATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
    BATTERY: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
    VOLTAGE_LEVEL: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
    SUBSTATION: MODIFICATION_TYPES.SUBSTATION_MODIFICATION.type,
};

export interface Modification {
    [key: string]: any;
}

export const formatModification = (modification: Modification) => {
    //exclude type, date and uuid from modification object
    const { type, date, uuid, ...rest } = modification;
    return rest;
};

export const getEquipmentTypeFromModificationType = (type: string) => {
    return Object.keys(TABULAR_MODIFICATION_TYPES).find(
        (key) => TABULAR_MODIFICATION_TYPES[key] === type
    );
};
export const styles = {
    grid: { height: 500, width: '100%' },
};
