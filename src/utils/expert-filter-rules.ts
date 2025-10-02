/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    EQUIPMENT_TYPES,
    EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE,
    EQUIPMENTS_WITH_ONE_SUBSTATION,
    EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES,
    EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES,
    EQUIPMENTS_WITH_TWO_SUBSTATIONS,
} from '../components/utils/equipment-types';
import { ExpertFilterFieldType, type ExpertRule, FilterEquipmentType } from '../types/filter-lib';
import { CombinatorType, DataType, OperatorType } from '@gridsuite/commons-ui';

export function buildExpertFilterRulesCountries(equipmentType: FilterEquipmentType, countries: string[]) {
    let rules: ExpertRule[] = [];
    if (EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            field: ExpertFilterFieldType.COUNTRY,
            operator: OperatorType.IN,
            values: countries,
            dataType: DataType.ENUM,
        });
    } else if (EQUIPMENTS_WITH_TWO_SUBSTATIONS.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: ExpertFilterFieldType.COUNTRY_1,
                    operator: OperatorType.IN,
                    values: countries,
                    dataType: DataType.ENUM,
                },
                {
                    field: ExpertFilterFieldType.COUNTRY_2,
                    operator: OperatorType.IN,
                    values: countries,
                    dataType: DataType.ENUM,
                },
            ],
        });
    }
    return rules;
}

export function buildExpertFilterRulesNominalVoltages(equipmentType: FilterEquipmentType, nominalVoltages: number[]) {
    let rules: ExpertRule[] = [];
    if (EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            field: ExpertFilterFieldType.NOMINAL_VOLTAGE,
            operator: OperatorType.IN,
            values: nominalVoltages,
            dataType: DataType.NUMBER,
        });
    } else if (EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: ExpertFilterFieldType.NOMINAL_VOLTAGE_1,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
                {
                    field: ExpertFilterFieldType.NOMINAL_VOLTAGE_2,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
            ],
        });
    } else if (EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: ExpertFilterFieldType.NOMINAL_VOLTAGE_1,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
                {
                    field: ExpertFilterFieldType.NOMINAL_VOLTAGE_2,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
                {
                    field: ExpertFilterFieldType.NOMINAL_VOLTAGE_3,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
            ],
        });
    }
    return rules;
}

export function buildExpertFilterRulesSubstationProperties(
    equipmentType: FilterEquipmentType,
    substationProperties: Record<string, string[]>
) {
    let rules: ExpertRule[] = [];
    if (EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        let propertyField = ExpertFilterFieldType.SUBSTATION_PROPERTIES;
        if (equipmentType === FilterEquipmentType.SUBSTATION) {
            propertyField = ExpertFilterFieldType.FREE_PROPERTIES;
        }

        Object.entries(substationProperties).forEach(([propertyName, propertyValues]) => {
            if (propertyValues?.length) {
                rules.push({
                    field: propertyField,
                    operator: OperatorType.IN,
                    propertyName: propertyName,
                    propertyValues: propertyValues,
                    dataType: DataType.PROPERTY,
                });
            }
        });
    } else if (EQUIPMENTS_WITH_TWO_SUBSTATIONS.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        Object.entries(substationProperties).forEach(([propertyName, propertyValues]) => {
            if (propertyValues?.length) {
                rules.push({
                    combinator: CombinatorType.OR,
                    dataType: DataType.COMBINATOR,
                    rules: [
                        {
                            field: ExpertFilterFieldType.SUBSTATION_PROPERTIES_1,
                            operator: OperatorType.IN,
                            propertyName: propertyName,
                            propertyValues: propertyValues,
                            dataType: DataType.PROPERTY,
                        },
                        {
                            field: ExpertFilterFieldType.SUBSTATION_PROPERTIES_2,
                            operator: OperatorType.IN,
                            propertyName: propertyName,
                            propertyValues: propertyValues,
                            dataType: DataType.PROPERTY,
                        },
                    ],
                });
            }
        });
    }
    return rules;
}

export function buildExpertFilterRulesSubstationIds(equipmentType: FilterEquipmentType, ids: string[]) {
    let rules: ExpertRule[] = [];
    if (EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            field:
                equipmentType !== FilterEquipmentType.SUBSTATION
                    ? ExpertFilterFieldType.SUBSTATION_ID
                    : ExpertFilterFieldType.ID,
            operator: OperatorType.IN,
            values: ids,
            dataType: DataType.STRING,
        });
    } else if (EQUIPMENTS_WITH_TWO_SUBSTATIONS.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: ExpertFilterFieldType.SUBSTATION_ID_1,
                    operator: OperatorType.IN,
                    values: ids,
                    dataType: DataType.STRING,
                },
                {
                    field: ExpertFilterFieldType.SUBSTATION_ID_2,
                    operator: OperatorType.IN,
                    values: ids,
                    dataType: DataType.STRING,
                },
            ],
        });
    }
    return rules;
}

export function buildExpertFilterRulesVoltageLevelIds(equipmentType: FilterEquipmentType, ids: string[]) {
    let rules: ExpertRule[] = [];
    if (EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            field:
                equipmentType !== FilterEquipmentType.VOLTAGE_LEVEL
                    ? ExpertFilterFieldType.VOLTAGE_LEVEL_ID
                    : ExpertFilterFieldType.ID,
            operator: OperatorType.IN,
            values: ids,
            dataType: DataType.STRING,
        });
    } else if (EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: ExpertFilterFieldType.VOLTAGE_LEVEL_ID_1,
                    operator: OperatorType.IN,
                    values: ids,
                    dataType: DataType.STRING,
                },
                {
                    field: ExpertFilterFieldType.VOLTAGE_LEVEL_ID_2,
                    operator: OperatorType.IN,
                    values: ids,
                    dataType: DataType.STRING,
                },
            ],
        });
    } else if (EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: ExpertFilterFieldType.VOLTAGE_LEVEL_ID_1,
                    operator: OperatorType.IN,
                    values: ids,
                    dataType: DataType.STRING,
                },
                {
                    field: ExpertFilterFieldType.VOLTAGE_LEVEL_ID_2,
                    operator: OperatorType.IN,
                    values: ids,
                    dataType: DataType.STRING,
                },
                {
                    field: ExpertFilterFieldType.VOLTAGE_LEVEL_ID_3,
                    operator: OperatorType.IN,
                    values: ids,
                    dataType: DataType.STRING,
                },
            ],
        });
    }
    return rules;
}
