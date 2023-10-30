/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell } from '@mui/material';
import DirectoryItemsInput from '../../../utils/rhf-inputs/directory-items-input';
import React from 'react';
import SelectInputItem from './selected-input';
import { SwitchInput } from '@gridsuite/commons-ui';

function EditableTableCell(
    arrayFormName: string,
    rowIndex: number,
    column: any
) {
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
                />
            )}
            {column.menuItems && (
                <SelectInputItem
                    arrayFormName={arrayFormName}
                    column={column}
                    rowIndex={rowIndex}
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
