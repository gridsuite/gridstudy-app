/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback } from 'react';
import { SelectInput } from '@gridsuite/commons-ui';
import { SENSITIVITY_TYPES } from './columns-definitions';

interface SelectInputItemProps {
    arrayFormName: string;
    rowIndex: number;
    column: any;
}

const SelectInputItem: FunctionComponent<SelectInputItemProps> = ({
    arrayFormName,
    column,
    rowIndex,
}) => {
    const getDynamicWidth = useCallback((options: any[]) => {
        return options === SENSITIVITY_TYPES ? '100px' : '220px';
    }, []);
    return (
        <SelectInput
            name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
            options={column.equipmentTypes}
            disableClearable={true}
            size={'small'}
            sx={{ width: getDynamicWidth(column.equipmentTypes) }}
        />
    );
};
export default SelectInputItem;
