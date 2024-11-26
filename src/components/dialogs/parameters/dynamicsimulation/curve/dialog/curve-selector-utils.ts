/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ExpertFilter } from 'services/study/filter';
import {
    CombinatorType,
    DataType,
    EquipmentType,
    FieldType,
    FilterType,
    OperatorType,
    RuleGroupTypeExport,
    RuleTypeExport,
} from '@gridsuite/commons-ui';

export const CURVE_EQUIPMENT_TYPES = [
    EquipmentType.GENERATOR,
    EquipmentType.LOAD,
    EquipmentType.BUS,
    EquipmentType.BUSBAR_SECTION,
];

// this function is used to redirect an equipment type to the referenced equipment type which is used in the default model.
export const getReferencedEquipmentTypeForModel = (equipmentType: EquipmentType) => {
    // particular case, BUSBAR_SECTION and BUS use the same default model for Bus
    return equipmentType === EquipmentType.BUSBAR_SECTION ? EquipmentType.BUS : equipmentType;
};

// this function is used to provide topologyKind, particularly 'BUS_BREAKER' for EQUIPMENT_TYPES.BUS
export const getTopologyKindIfNecessary = (equipmentType: string) => {
    return equipmentType === EquipmentType.BUS
        ? {
              topologyKind: 'BUS_BREAKER',
          }
        : {};
};

export const buildExpertRules = (
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    nominalVoltages: number[] | undefined
): RuleGroupTypeExport => {
    const rules: RuleTypeExport[] = [];

    // create rule IN for voltageLevelIds
    if (voltageLevelIds?.length) {
        const voltageLevelIdsRule = {
            field: FieldType.VOLTAGE_LEVEL_ID,
            operator: OperatorType.IN,
            value: undefined, // TODO refactor in commons-ui with '?' instead of undefined
            values: voltageLevelIds,
            dataType: DataType.STRING,
        };
        rules.push(voltageLevelIdsRule);
    }

    // create rule IN for countries
    if (countries?.length) {
        const countriesRule = {
            field: FieldType.COUNTRY,
            operator: OperatorType.IN,
            value: undefined, // TODO refactor in commons-ui with '?' instead of undefined
            values: countries,
            dataType: DataType.ENUM,
        };
        rules.push(countriesRule);
    }

    // create rule IN for nominalVoltages
    if (nominalVoltages?.length) {
        const nominalVoltagesRule = {
            field: FieldType.NOMINAL_VOLTAGE,
            operator: OperatorType.IN,
            value: undefined, // TODO refactor in commons-ui with '?' instead of undefined
            values: nominalVoltages,
            dataType: DataType.NUMBER,
        };
        rules.push(nominalVoltagesRule);
    }

    return {
        combinator: CombinatorType.AND,
        dataType: DataType.COMBINATOR,
        rules,
    };
};

export const buildExpertFilter = (
    equipmentType: EquipmentType,
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    nominalVoltages: number[] | undefined
): ExpertFilter => {
    return {
        ...getTopologyKindIfNecessary(equipmentType), // for optimizing 'search bus' in filter-server
        type: FilterType.EXPERT.id,
        equipmentType: equipmentType,
        rules: buildExpertRules(voltageLevelIds, countries, nominalVoltages),
    };
};

export const NOMINAL_VOLTAGE_UNIT = 'kV';
