/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Entries } from 'type-fest';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import {
    type CombinatorExpertRule,
    type ExpertFilter,
    ExpertFilterFieldType,
    type ExpertRule,
    FilterEquipmentType,
    FilterType,
} from '../../../../../../types/filter-lib';
import { CombinatorType, DataType, OperatorType } from '@gridsuite/commons-ui';
import { getTopologyKindIfNecessary } from '../../../../../../utils/expert-filter';
import {
    buildExpertFilterRulesCountries,
    buildExpertFilterRulesNominalVoltages,
    buildExpertFilterRulesSubstationIds,
    buildExpertFilterRulesSubstationProperties,
    buildExpertFilterRulesVoltageLevelIds,
} from '../../../../../../utils/expert-filter-rules';

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

export function buildExpertRules(
    equipmentType: FilterEquipmentType,
    voltageLevelIds: string[] | undefined,
    countries: string[] | undefined,
    nominalVoltages: number[] | undefined,
    substationProperties: Record<string, string[]> | undefined,
    ids: Partial<Record<FilterEquipmentType, string[]>> | undefined
) {
    const rules: ExpertRule[] = [];

    // create rule IN for voltageLevelIds
    if (voltageLevelIds?.length) {
        rules.push({
            field: ExpertFilterFieldType.VOLTAGE_LEVEL_ID,
            operator: OperatorType.IN,
            values: voltageLevelIds,
            dataType: DataType.STRING,
        });
    }

    // create rule IN for countries
    if (countries?.length) {
        rules.push(...buildExpertFilterRulesCountries(equipmentType, countries));
    }

    // create rule IN for nominalVoltages
    if (nominalVoltages?.length) {
        rules.push(...buildExpertFilterRulesNominalVoltages(equipmentType, nominalVoltages));
    }

    if (substationProperties) {
        rules.push(...buildExpertFilterRulesSubstationProperties(equipmentType, substationProperties));
    }

    // create rule IN or VOLTAGE_LEVEL_ID IN or SUBSTATION_ID IN for ids
    if (ids) {
        for (const [eqType, values] of Object.entries(ids) as Entries<Required<typeof ids>>) {
            if (eqType === FilterEquipmentType.SUBSTATION) {
                rules.push(...buildExpertFilterRulesSubstationIds(equipmentType, values));
            } else if (eqType === FilterEquipmentType.VOLTAGE_LEVEL) {
                rules.push(...buildExpertFilterRulesVoltageLevelIds(equipmentType, values));
            } else {
                rules.push({
                    field: ExpertFilterFieldType.ID,
                    operator: OperatorType.IN,
                    values,
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
    ids?: Partial<Record<FilterEquipmentType, string[]>>
) {
    return {
        ...getTopologyKindIfNecessary(equipmentType), // for optimizing 'search bus' in filter-server
        type: FilterType.EXPERT,
        equipmentType: equipmentType,
        rules: buildExpertRules(equipmentType, voltageLevelIds, countries, nominalVoltages, substationProperties, ids),
    } as const satisfies ExpertFilter;
}

export const NOMINAL_VOLTAGE_UNIT = 'kV';
