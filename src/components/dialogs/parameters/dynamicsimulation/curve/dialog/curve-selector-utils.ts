/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ExpertFilter } from 'services/study/filter';
import {
    EQUIPMENT_TYPES,
    EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE,
    EQUIPMENTS_WITH_ONE_SUBSTATION,
    EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES,
    EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES,
    EQUIPMENTS_WITH_TWO_SUBSTATIONS,
} from '../../../../../utils/equipment-types';
import { CombinatorType, OperatorType } from '../../../../filter/expert/expert-filter.type';
import { DataType, FieldType } from '@gridsuite/commons-ui';

export const CURVE_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.LOAD,
    EQUIPMENT_TYPES.BUS,
    EQUIPMENT_TYPES.BUSBAR_SECTION,
];

// this function is used to redirect an equipment type to the referenced equipment type which is used in the default model.
export const getReferencedEquipmentTypeForModel = (equipmentType: EQUIPMENT_TYPES) => {
    // particular case, BUSBAR_SECTION and BUS use the same default model for Bus
    return equipmentType === EQUIPMENT_TYPES.BUSBAR_SECTION ? EQUIPMENT_TYPES.BUS : equipmentType;
};

// this function is used to provide topologyKind, particularly 'BUS_BREAKER' for EQUIPMENT_TYPES.BUS
export const getTopologyKindIfNecessary = (equipmentType: string) => {
    return equipmentType === EQUIPMENT_TYPES.BUS
        ? {
              topologyKind: 'BUS_BREAKER',
          }
        : {};
};

const buildSubstationPropertiesRules = (
    equipmentType: EQUIPMENT_TYPES,
    substationProperties: Record<string, string[]>,
    rules: any[]
) => {
    if (EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType)) {
        let propertyField = FieldType.SUBSTATION_PROPERTIES;
        if (equipmentType === EQUIPMENT_TYPES.SUBSTATION) {
            propertyField = FieldType.FREE_PROPERTIES;
        }

        Object.entries(substationProperties).forEach(([propertyName, propertyValues]) => {
            if (propertyValues?.length) {
                const substationPropertiesRule = {
                    field: propertyField,
                    operator: OperatorType.IN,
                    propertyName: propertyName,
                    propertyValues: propertyValues,
                    dataType: DataType.PROPERTY,
                };
                rules.push(substationPropertiesRule);
            }
        });
    } else if (EQUIPMENTS_WITH_TWO_SUBSTATIONS.includes(equipmentType)) {
        Object.entries(substationProperties).forEach(([propertyName, propertyValues]) => {
            if (propertyValues?.length) {
                const substationPropertiesRule = {
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
                };
                rules.push(substationPropertiesRule);
            }
        });
    }
};

export const buildExpertRules = (
    equipmentType: EQUIPMENT_TYPES,
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    nominalVoltages: number[] | undefined,
    substationProperties: Record<string, string[]> | undefined,
    ids: Record<string, string[]> | undefined
) => {
    const rules: any[] = []; // TODO: confusion between RuleGroupTypeExport, RuleTypeExport and expected values...

    // create rule IN for voltageLevelIds
    if (voltageLevelIds?.length) {
        const voltageLevelIdsRule = {
            field: FieldType.VOLTAGE_LEVEL_ID,
            operator: OperatorType.IN,
            values: voltageLevelIds,
            dataType: DataType.STRING,
        };
        rules.push(voltageLevelIdsRule);
    }

    // create rule IN for countries
    if (countries?.length && EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType)) {
        const countriesRule = {
            field: FieldType.COUNTRY,
            operator: OperatorType.IN,
            values: countries,
            dataType: DataType.ENUM,
        };
        rules.push(countriesRule);
    } else if (countries?.length && EQUIPMENTS_WITH_TWO_SUBSTATIONS.includes(equipmentType)) {
        const countriesRule = {
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
        };
        rules.push(countriesRule);
    }

    // create rule IN for nominalVoltages
    if (nominalVoltages?.length && EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE.includes(equipmentType)) {
        const nominalVoltagesRule = {
            field: FieldType.NOMINAL_VOLTAGE,
            operator: OperatorType.IN,
            values: nominalVoltages,
            dataType: DataType.NUMBER,
        };
        rules.push(nominalVoltagesRule);
    } else if (nominalVoltages?.length && EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES.includes(equipmentType)) {
        const nominalVoltagesRule = {
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
        };
        rules.push(nominalVoltagesRule);
    } else if (nominalVoltages?.length && EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES.includes(equipmentType)) {
        const nominalVoltagesRule = {
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
        };
        rules.push(nominalVoltagesRule);
    }

    if (substationProperties) {
        buildSubstationPropertiesRules(equipmentType, substationProperties, rules);
    }

    // create rule IN or VOLTAGE_LEVEL_ID IN or SUBSTATION_ID IN for ids
    if (ids && Object.keys(ids).length) {
        for (const eqType in ids) {
            if ((eqType as EQUIPMENT_TYPES) === EQUIPMENT_TYPES.SUBSTATION) {
                if (EQUIPMENTS_WITH_ONE_SUBSTATION.includes(equipmentType)) {
                    const idsRule = {
                        field: equipmentType !== EQUIPMENT_TYPES.SUBSTATION ? FieldType.SUBSTATION_ID : FieldType.ID,
                        operator: OperatorType.IN,
                        values: ids[eqType],
                        dataType: DataType.STRING,
                    };
                    rules.push(idsRule);
                } else if (EQUIPMENTS_WITH_TWO_SUBSTATIONS.includes(equipmentType)) {
                    const idsRule = {
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
                    };
                    rules.push(idsRule);
                }
            } else if ((eqType as EQUIPMENT_TYPES) === EQUIPMENT_TYPES.VOLTAGE_LEVEL) {
                if (EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE.includes(equipmentType)) {
                    const idsRule = {
                        field:
                            equipmentType !== EQUIPMENT_TYPES.VOLTAGE_LEVEL ? FieldType.VOLTAGE_LEVEL_ID : FieldType.ID,
                        operator: OperatorType.IN,
                        values: ids[eqType],
                        dataType: DataType.STRING,
                    };
                    rules.push(idsRule);
                } else if (EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES.includes(equipmentType)) {
                    const idsRule = {
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
                    };
                    rules.push(idsRule);
                } else if (EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES.includes(equipmentType)) {
                    const idsRule = {
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
                    };
                    rules.push(idsRule);
                }
            } else {
                const idsRule = {
                    field: FieldType.ID,
                    operator: OperatorType.IN,
                    values: ids[eqType],
                    dataType: DataType.STRING,
                };
                rules.push(idsRule);
            }
        }
    }

    return {
        combinator: CombinatorType.AND,
        dataType: DataType.COMBINATOR,
        rules,
    };
};

/** @deprecated The behavior of this local builder function differs from the backend one used by others (analysis results & spreadsheet).
 *      A new endpoint is now available to evaluate a global-filter on a network. To migrate to it.
 */
export const buildExpertFilter = (
    equipmentType: EQUIPMENT_TYPES,
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    nominalVoltages: number[] | undefined,
    substationProperties?: Record<string, string[]>,
    ids?: Record<string, string[]>
): ExpertFilter => {
    return {
        ...getTopologyKindIfNecessary(equipmentType), // for optimizing 'search bus' in filter-server
        type: 'EXPERT',
        equipmentType: equipmentType,
        rules: buildExpertRules(equipmentType, voltageLevelIds, countries, nominalVoltages, substationProperties, ids),
    };
};

export const NOMINAL_VOLTAGE_UNIT = 'kV';
