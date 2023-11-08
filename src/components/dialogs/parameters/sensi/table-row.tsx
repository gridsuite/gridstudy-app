/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell, TableRow } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { DeleteForeverOutlined } from '@mui/icons-material';
import React, { FunctionComponent, useState } from 'react';
import { useIntl } from 'react-intl';
import EditableTableCell from './table-cell';

interface TableRowComponentProps {
    arrayFormName: string;
    columnsDefinition: any;
    row: any;
    index: number;
    handleDeleteButton: (index: number) => void;
    theme: boolean;
}

const TableRowComponent: FunctionComponent<TableRowComponentProps> = ({
    arrayFormName,
    columnsDefinition,
    row,
    index,
    handleDeleteButton,
    theme,
}) => {
    const [hover, setHover] = useState(false);
    const intl = useIntl();

    return (
        <TableRow
            key={row.id}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {columnsDefinition.map((column: any) =>
                EditableTableCell(arrayFormName, index, column)
            )}
            <TableCell>
                <Tooltip
                    title={intl.formatMessage({
                        id: 'DeleteRows',
                    })}
                    placement="top"
                >
                    <span hidden={!hover}>
                        <IconButton
                            color="primary"
                            onClick={() => handleDeleteButton(index)}
                        >
                            <DeleteForeverOutlined
                                sx={{
                                    color: theme ? 'white' : 'black',
                                }}
                            />
                        </IconButton>
                    </span>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
};

export default TableRowComponent;
