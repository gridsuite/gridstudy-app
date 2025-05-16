/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ExpertFilter } from 'services/study/filter';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import { CombinatorType, DataType, FieldType, OperatorType } from '../../../../filter/expert/expert-filter.type';

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

export const buildExpertRules = (
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    countries1: string[] | undefined,
    countries2: string[] | undefined,
    nominalVoltages: number[] | undefined,
    nominalVoltages1: number[] | undefined,
    nominalVoltages2: number[] | undefined,
    ids: string[] | undefined
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
    if (countries?.length) {
        const countriesRule = {
            field: FieldType.COUNTRY,
            operator: OperatorType.IN,
            values: countries,
            dataType: DataType.ENUM,
        };
        rules.push(countriesRule);
    }

    // create rule IN for countries1
    if (countries1?.length) {
        const countriesRule = {
            field: FieldType.COUNTRY_1,
            operator: OperatorType.IN,
            values: countries1,
            dataType: DataType.ENUM,
        };
        rules.push(countriesRule);
    }

    // create rule IN for countries2
    if (countries2?.length) {
        const countriesRule = {
            field: FieldType.COUNTRY_2,
            operator: OperatorType.IN,
            values: countries2,
            dataType: DataType.ENUM,
        };
        rules.push(countriesRule);
    }

    // create rule IN for nominalVoltages
    if (nominalVoltages?.length) {
        const nominalVoltagesRule = {
            field: FieldType.NOMINAL_VOLTAGE,
            operator: OperatorType.IN,
            values: nominalVoltages,
            dataType: DataType.NUMBER,
        };
        rules.push(nominalVoltagesRule);
    }

    // create rule IN for nominalVoltages1
    if (nominalVoltages1?.length) {
        const nominalVoltagesRule = {
            field: FieldType.NOMINAL_VOLTAGE_1,
            operator: OperatorType.IN,
            values: nominalVoltages1,
            dataType: DataType.NUMBER,
        };
        rules.push(nominalVoltagesRule);
    }

    // create rule IN for nominalVoltages2
    if (nominalVoltages2?.length) {
        const nominalVoltagesRule = {
            field: FieldType.NOMINAL_VOLTAGE_2,
            operator: OperatorType.IN,
            values: nominalVoltages2,
            dataType: DataType.NUMBER,
        };
        rules.push(nominalVoltagesRule);
    }

    // create rule IN for ids
    if (ids?.length) {
        const idsRule = {
            field: FieldType.ID,
            operator: OperatorType.IN,
            values: ids,
            dataType: DataType.STRING,
        };
        rules.push(idsRule);
    }

    return {
        combinator: CombinatorType.AND,
        dataType: DataType.COMBINATOR,
        rules,
    };
};

export const buildExpertFilter = (
    equipmentType: string,
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    countries1: string[] | undefined,
    countries2: string[] | undefined,
    nominalVoltages: number[] | undefined,
    nominalVoltages1: number[] | undefined,
    nominalVoltages2: number[] | undefined,
    ids: string[] | undefined
): ExpertFilter => {
    return {
        ...getTopologyKindIfNecessary(equipmentType), // for optimizing 'search bus' in filter-server
        type: 'EXPERT',
        equipmentType: equipmentType,
        rules: buildExpertRules(
            voltageLevelIds,
            countries,
            countries1,
            countries2,
            nominalVoltages,
            nominalVoltages1,
            nominalVoltages2,
            ids
        ),
    };
};

export const NOMINAL_VOLTAGE_UNIT = 'kV';
