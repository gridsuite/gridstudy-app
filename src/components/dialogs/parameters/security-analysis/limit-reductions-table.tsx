/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import React, { FunctionComponent } from 'react';
import { IColumnsDef, LIMIT_REDUCTIONS_FORM } from './columns-definitions';
import { useFieldArray } from 'react-hook-form';
import LimitReductionTableRow from './limit-reduction-table-row';

interface LimitReductionsTableProps {
    columnsDefinition: IColumnsDef[];
    tableHeight: number;
}

const LimitReductionsTable: FunctionComponent<LimitReductionsTableProps> = ({
    columnsDefinition,
    tableHeight,
}) => {
    const { fields: rows } = useFieldArray({
        name: LIMIT_REDUCTIONS_FORM,
    });

    return (
        <TableContainer
            sx={{
                height: tableHeight,
                border: 'solid 0px rgba(0,0,0,0.1)',
            }}
        >
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                    <TableRow>
                        {columnsDefinition.map((column: IColumnsDef) => (
                            <TableCell
                                key={column.dataKey}
                                sx={{
                                    width: column.width,
                                    textAlign: 'center',
                                }}
                            >
                                <Box>{column.label}</Box>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row: Record<'id', string>, index: number) => (
                        <LimitReductionTableRow
                            key={`${row.id}`}
                            columnsDefinition={columnsDefinition}
                            index={index}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LimitReductionsTable;
