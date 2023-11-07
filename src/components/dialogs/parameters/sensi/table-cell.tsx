/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell } from '@mui/material';
import DirectoryItemsInput from '../../../utils/rhf-inputs/directory-items-input';
import React, { useCallback } from 'react';
import { SelectInput, SwitchInput } from '@gridsuite/commons-ui';
import { SENSITIVITY_TYPES } from './columns-definitions';

function EditableTableCell(
    arrayFormName: string,
    rowIndex: number,
    column: any,
    isValidateButtonDisabled: (b: boolean) => void
) {
    const getDynamicWidth = useCallback((options: any[]) => {
        return options === SENSITIVITY_TYPES ? '100px' : '220px';
    }, []);
    return (
        <TableCell key={column.dataKey} sx={{ width: column.width }}>
            {column.directoryItems && (
                <DirectoryItemsInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    equipmentTypes={column.equipmentTypes}
                    elementType={column.elementType}
                    titleId={column.titleId}
                    hideErrorMessage={true}
                    label={undefined}
                    itemFilter={undefined}
                    isValidateButtonDisabled={isValidateButtonDisabled}
                />
            )}
            {column.menuItems && (
                <SelectInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    options={column.equipmentTypes}
                    disableClearable={true}
                    size="small"
                    sx={{ width: getDynamicWidth(column.equipmentTypes) }}
                    onChangeCallback={() => isValidateButtonDisabled(false)}
                />
            )}

            {column.checkboxItems && (
                <SwitchInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                />
            )}
        </TableCell>
    );
}

export default EditableTableCell;
