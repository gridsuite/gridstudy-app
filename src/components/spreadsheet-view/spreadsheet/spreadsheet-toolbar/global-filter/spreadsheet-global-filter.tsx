/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { SpreadsheetEquipmentType, type SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { FilterType } from '../../../../results/common/utils';
import GlobalFilterSelector, {
    type GlobalFilterSelectorProps,
} from '../../../../results/common/global-filter/global-filter-selector';
import { TableType } from '../../../../../types/custom-aggrid-types';
import { EquipmentType } from '@gridsuite/commons-ui';

export type SpreadsheetGlobalFilterProps = {
    tableDefinition: SpreadsheetTabDefinition;
};

export default function SpreadsheetGlobalFilter({ tableDefinition }: Readonly<SpreadsheetGlobalFilterProps>) {
    const filterTypes: FilterType[] = useMemo(() => {
        const allFilterTypes = Object.values(FilterType);
        if (
            tableDefinition.type === SpreadsheetEquipmentType.SUBSTATION ||
            tableDefinition.type === SpreadsheetEquipmentType.HVDC_LINE
        ) {
            // in this case we disable VL filters
            return allFilterTypes.filter((filterType) => filterType !== FilterType.VOLTAGE_LEVEL);
        }
        return allFilterTypes;
    }, [tableDefinition.type]);

    const equipmentTypes = useMemo<GlobalFilterSelectorProps['filterableEquipmentTypes']>(() => {
        return [
            ...(tableDefinition.type === SpreadsheetEquipmentType.BRANCH
                ? [EquipmentType.LINE, EquipmentType.TWO_WINDINGS_TRANSFORMER]
                : [tableDefinition.type as unknown as EquipmentType]),
        ];
    }, [tableDefinition.type]);

    return (
        <GlobalFilterSelector
            filterCategories={filterTypes}
            filterableEquipmentTypes={equipmentTypes}
            genericFiltersStrictMode={true}
            tableType={TableType.Spreadsheet}
            tableUuid={tableDefinition.uuid}
        />
    );
}
