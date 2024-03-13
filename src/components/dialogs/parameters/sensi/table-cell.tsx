/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell } from '@mui/material';
import { DirectoryItemsInput } from '@gridsuite/commons-ui';
import React from 'react';
import {
    SelectInput,
    SwitchInput,
    FloatInput,
    TextInput,
} from '@gridsuite/commons-ui';
import {
    fetchDirectoryContent,
    fetchPath,
    fetchRootFolders,
} from 'services/directory';
import { fetchElementsMetadata } from 'services/explore';

function EditableTableCell(
    arrayFormName: string,
    rowIndex: number,
    column: any,
    onRowChanged: (a: boolean, source: string) => void
) {
    const handleDirectoryItemsChange = () => {
        onRowChanged(true, 'directory');
    };
    const handleSwitchInputChange = () => {
        onRowChanged(true, 'switch');
    };
    return (
        <TableCell
            key={column.dataKey}
            sx={{
                width: column.width,
            }}
        >
            {column.directoryItems && (
                <DirectoryItemsInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    equipmentTypes={column.equipmentTypes}
                    elementType={column.elementType}
                    titleId={column.titleId}
                    hideErrorMessage={true}
                    label={undefined}
                    itemFilter={undefined}
                    onRowChanged={handleDirectoryItemsChange}
                    fetchDirectoryContent={fetchDirectoryContent}
                    fetchRootFolders={fetchRootFolders}
                    fetchElementsInfos={fetchElementsMetadata}
                    fetchDirectoryElementPath={fetchPath}
                />
            )}
            {column.menuItems && (
                <SelectInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    options={Object.values(column.equipmentTypes)}
                    disableClearable={true}
                    size="small"
                    fullWidth
                />
            )}
            {column.checkboxItems && (
                <span onChange={handleSwitchInputChange}>
                    <SwitchInput
                        name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    />
                </span>
            )}
            {column.floatItems && (
                <FloatInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                />
            )}
            {column.textItems && (
                <TextInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    formProps={{ disabled: !column.editable }}
                />
            )}
        </TableCell>
    );
}

export default EditableTableCell;
