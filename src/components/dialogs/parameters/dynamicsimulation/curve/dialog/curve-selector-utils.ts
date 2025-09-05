/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
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
} from '../../../../../utils/equipment-types';
import {
    type CombinatorExpertRule,
    type ExpertFilter,
    type ExpertRule,
    FieldType,
    FilterEquipmentType,
    FilterType,
    TopologyKind,
} from '../../../../../../types/filter-lib';
import { CombinatorType, DataType, OperatorType } from '@gridsuite/commons-ui';

export const CURVE_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.LOAD,
    EQUIPMENT_TYPES.BUS,
    EQUIPMENT_TYPES.BUSBAR_SECTION,
];

// this function is used to redirect an equipment type to the referenced equipment type which is used in the default model.
type ReferencedEquipmentResult<T extends FilterEquipmentType> = T extends FilterEquipmentType.BUSBAR_SECTION
    ? EQUIPMENT_TYPES.BUS
    : Extract<EQUIPMENT_TYPES, T>;
export function getReferencedEquipmentTypeForModel<T extends FilterEquipmentType>(
    equipmentType: T
): ReferencedEquipmentResult<T> {
    // particular case, BUSBAR_SECTION and BUS use the same default model for Bus
    return (
        equipmentType === FilterEquipmentType.BUSBAR_SECTION
            ? EQUIPMENT_TYPES.BUS
            : (equipmentType as unknown as EQUIPMENT_TYPES)
    ) as ReferencedEquipmentResult<T>;
}

// this function is used to provide topologyKind, particularly 'BUS_BREAKER' for EQUIPMENT_TYPES.BUS
type TopologyKindResult<T extends FilterEquipmentType> = T extends FilterEquipmentType.BUS
    ? { topologyKind: TopologyKind.BUS_BREAKER }
    : {};
export function getTopologyKindIfNecessary<T extends FilterEquipmentType>(equipmentType: T): TopologyKindResult<T> {
    return (
        equipmentType === FilterEquipmentType.BUS ? { topologyKind: TopologyKind.BUS_BREAKER } : {}
    ) as TopologyKindResult<T>;
}

function buildSubstationPropertiesRules(
    equipmentType: FilterEquipmentType,
    substationProperties: Record<string, string[]>,
    rules: ExpertRule[]
) {
    if (EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        let propertyField = FieldType.SUBSTATION_PROPERTIES;
        if (equipmentType === FilterEquipmentType.SUBSTATION) {
            propertyField = FieldType.FREE_PROPERTIES;
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
                            field: FieldType.SUBSTATION_PROPERTIES_1,
                            operator: OperatorType.IN,
                            propertyName: propertyName,
                            propertyValues: propertyValues,
                            dataType: DataType.PROPERTY,
                        },
                        {
                            field: FieldType.SUBSTATION_PROPERTIES_2,
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
}

export function buildExpertRules(
    equipmentType: FilterEquipmentType,
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    nominalVoltages: number[] | undefined,
    substationProperties: Record<string, string[]> | undefined,
    ids: Record<string, string[]> | undefined
) {
    const rules: ExpertRule[] = [];

    // create rule IN for voltageLevelIds
    if (voltageLevelIds?.length) {
        rules.push({
            field: FieldType.VOLTAGE_LEVEL_ID,
            operator: OperatorType.IN,
            values: voltageLevelIds,
            dataType: DataType.STRING,
        });
    }

    // create rule IN for countries
    if (countries?.length && EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
        rules.push({
            field: FieldType.COUNTRY,
            operator: OperatorType.IN,
            values: countries,
            dataType: DataType.ENUM,
        });
    } else if (
        countries?.length &&
        EQUIPMENTS_WITH_TWO_SUBSTATIONS.includes(equipmentType as unknown as EQUIPMENT_TYPES)
    ) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: FieldType.COUNTRY_1,
                    operator: OperatorType.IN,
                    values: countries,
                    dataType: DataType.ENUM,
                },
                {
                    field: FieldType.COUNTRY_2,
                    operator: OperatorType.IN,
                    values: countries,
                    dataType: DataType.ENUM,
                },
            ],
        });
    }

    // create rule IN for nominalVoltages
    if (
        nominalVoltages?.length &&
        EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE.includes(equipmentType as unknown as EQUIPMENT_TYPES)
    ) {
        rules.push({
            field: FieldType.NOMINAL_VOLTAGE,
            operator: OperatorType.IN,
            values: nominalVoltages,
            dataType: DataType.NUMBER,
        });
    } else if (
        nominalVoltages?.length &&
        EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES.includes(equipmentType as unknown as EQUIPMENT_TYPES)
    ) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: FieldType.NOMINAL_VOLTAGE_1,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
                {
                    field: FieldType.NOMINAL_VOLTAGE_2,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
            ],
        });
    } else if (
        nominalVoltages?.length &&
        EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES.includes(equipmentType as unknown as EQUIPMENT_TYPES)
    ) {
        rules.push({
            combinator: CombinatorType.OR,
            dataType: DataType.COMBINATOR,
            rules: [
                {
                    field: FieldType.NOMINAL_VOLTAGE_1,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
                {
                    field: FieldType.NOMINAL_VOLTAGE_2,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
                {
                    field: FieldType.NOMINAL_VOLTAGE_3,
                    operator: OperatorType.IN,
                    values: nominalVoltages,
                    dataType: DataType.NUMBER,
                },
            ],
        });
    }

    if (substationProperties) {
        buildSubstationPropertiesRules(equipmentType, substationProperties, rules);
    }

    // create rule IN or VOLTAGE_LEVEL_ID IN or SUBSTATION_ID IN for ids
    if (ids && Object.keys(ids).length) {
        for (const eqType in ids) {
            if (eqType === EQUIPMENT_TYPES.SUBSTATION) {
                if (EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
                    rules.push({
                        field:
                            equipmentType !== FilterEquipmentType.SUBSTATION ? FieldType.SUBSTATION_ID : FieldType.ID,
                        operator: OperatorType.IN,
                        values: ids[eqType],
                        dataType: DataType.STRING,
                    });
                } else if (EQUIPMENTS_WITH_TWO_SUBSTATIONS.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
                    rules.push({
                        combinator: CombinatorType.OR,
                        dataType: DataType.COMBINATOR,
                        rules: [
                            {
                                field: FieldType.SUBSTATION_ID_1,
                                operator: OperatorType.IN,
                                values: ids[eqType],
                                dataType: DataType.STRING,
                            },
                            {
                                field: FieldType.SUBSTATION_ID_2,
                                operator: OperatorType.IN,
                                values: ids[eqType],
                                dataType: DataType.STRING,
                            },
                        ],
                    });
                }
            } else if ((eqType as EQUIPMENT_TYPES) === EQUIPMENT_TYPES.VOLTAGE_LEVEL) {
                if (EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
                    rules.push({
                        field:
                            equipmentType !== FilterEquipmentType.VOLTAGE_LEVEL
                                ? FieldType.VOLTAGE_LEVEL_ID
                                : FieldType.ID,
                        operator: OperatorType.IN,
                        values: ids[eqType],
                        dataType: DataType.STRING,
                    });
                } else if (EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES.includes(equipmentType as unknown as EQUIPMENT_TYPES)) {
                    rules.push({
                        combinator: CombinatorType.OR,
                        dataType: DataType.COMBINATOR,
                        rules: [
                            {
                                field: FieldType.VOLTAGE_LEVEL_ID_1,
                                operator: OperatorType.IN,
                                values: ids[eqType],
                                dataType: DataType.STRING,
                            },
                            {
                                field: FieldType.VOLTAGE_LEVEL_ID_2,
                                operator: OperatorType.IN,
                                values: ids[eqType],
                                dataType: DataType.STRING,
                            },
                        ],
                    });
                } else if (
                    EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES.includes(equipmentType as unknown as EQUIPMENT_TYPES)
                ) {
                    rules.push({
                        combinator: CombinatorType.OR,
                        dataType: DataType.COMBINATOR,
                        rules: [
                            {
                                field: FieldType.VOLTAGE_LEVEL_ID_1,
                                operator: OperatorType.IN,
                                values: ids[eqType],
                                dataType: DataType.STRING,
                            },
                            {
                                field: FieldType.VOLTAGE_LEVEL_ID_2,
                                operator: OperatorType.IN,
                                values: ids[eqType],
                                dataType: DataType.STRING,
                            },
                            {
                                field: FieldType.VOLTAGE_LEVEL_ID_3,
                                operator: OperatorType.IN,
                                values: ids[eqType],
                                dataType: DataType.STRING,
                            },
                        ],
                    });
                }
            } else {
                rules.push({
                    field: FieldType.ID,
                    operator: OperatorType.IN,
                    values: ids[eqType],
                    dataType: DataType.STRING,
                });
            }
        }
    }

    return {
        combinator: CombinatorType.AND,
        dataType: DataType.COMBINATOR,
        rules,
    } as const satisfies CombinatorExpertRule;
}

export function buildExpertFilter(
    equipmentType: FilterEquipmentType,
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    nominalVoltages: number[] | undefined,
    substationProperties?: Record<string, string[]>,
    ids?: Record<string, string[]>
) {
    return {
        ...getTopologyKindIfNecessary(equipmentType), // for optimizing 'search bus' in filter-server
        type: FilterType.EXPERT,
        equipmentType: equipmentType,
        rules: buildExpertRules(equipmentType, voltageLevelIds, countries, nominalVoltages, substationProperties, ids),
    } as const satisfies ExpertFilter;
}

export const NOMINAL_VOLTAGE_UNIT = 'kV';
