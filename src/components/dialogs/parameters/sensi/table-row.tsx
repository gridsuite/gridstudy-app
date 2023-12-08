/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell, TableRow } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import React, { FunctionComponent, useState } from 'react';
import { useIntl } from 'react-intl';
import EditableTableCell from './table-cell';
import DeleteIcon from '@mui/icons-material/Delete';
import { IColumnsDef } from './columns-definitions';

interface TableRowComponentProps {
    arrayFormName: string;
    columnsDefinition: IColumnsDef[];
    row: Record<'id', string>;
    index: number;
    handleDeleteButton: (index: number) => void;
    isFormChanged: (a: boolean) => void;
}

const TableRowComponent: FunctionComponent<TableRowComponentProps> = ({
    arrayFormName,
    columnsDefinition,
    row,
    index,
    handleDeleteButton,
    isFormChanged,
}) => {
    const [isHover, setIsHover] = useState(false);
    const intl = useIntl();
    function handleHover(enter: boolean) {
        return setIsHover(enter);
    }
    return (
        <TableRow
            key={row.id}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
        >
            {columnsDefinition.map((column: IColumnsDef) =>
                EditableTableCell(arrayFormName, index, column, isFormChanged)
            )}
            <TableCell sx={{ width: '5rem', textAlign: 'center' }}>
                {isHover && (
                    <Tooltip
                        title={intl.formatMessage({
                            id: 'DeleteRows',
                        })}
                    >
                        <IconButton onClick={() => handleDeleteButton(index)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </TableCell>
        </TableRow>
    );
};

export default TableRowComponent;
