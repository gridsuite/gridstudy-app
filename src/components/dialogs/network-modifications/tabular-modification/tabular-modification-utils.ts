/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES } from 'components/utils/modification-type';
import {
    EQUIPMENT_ID,
    G,
    B,
    RATED_S,
    RATED_U1,
    RATED_U2,
    X,
    R,
    G1,
    G2,
    B1,
    B2,
    SUBSTATION_COUNTRY,
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
    SHUNT_COMPENSATOR: [
        'equipmentId',
        'maximumSectionCount',
        'sectionCount',
        'shuntCompensatorType',
        'maxQAtNominalV',
        'maxSusceptance',
    ],
    LINE: [
        EQUIPMENT_ID,
        R,
        X,
        G1,
        G2,
        B1,
        B2
    ],
    LOAD: [
        'equipmentId',
        'loadType',
        'constantActivePower',
        'constantReactivePower',
    ],
    TWO_WINDINGS_TRANSFORMER: [
        EQUIPMENT_ID,
        R,
        X,
        G,
        B,
        RATED_U1,
        RATED_U2,
        RATED_S,
    ],
    SUBSTATION: [EQUIPMENT_ID, SUBSTATION_COUNTRY],
};

export const TABULAR_MODIFICATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
    BATTERY: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
    VOLTAGE_LEVEL: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
    SHUNT_COMPENSATOR: MODIFICATION_TYPES.SHUNT_COMPENSATOR_MODIFICATION.type,
    LINE: MODIFICATION_TYPES.LINE_MODIFICATION.type,
    TWO_WINDINGS_TRANSFORMER:
        MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
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

export const convertValueFromBackToFront = (
    key: string,
    value: { value: string | number },
    translate: (code: string | number) => string
) => {
    switch (key) {
        case EQUIPMENT_ID:
            return value;
        case SUBSTATION_COUNTRY:
            return translate(value?.value);
        case G:
        case B:
        case G1:
        case G2:
        case B1:
        case B2:
            return unitToMicroUnit(value?.value);
        default:
            return value?.value;
    }
};

export const convertValueFromFrontToBack = (
    key: string,
    value: string | number,
    getCountryCode: (code: string | number) => string
) => {
    switch (key) {
        case EQUIPMENT_ID:
            return value;
        case SUBSTATION_COUNTRY:
            return toModificationOperation(getCountryCode(value));
        case G:
        case B:
        case G1:
        case G2:
        case B1:
        case B2:
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
