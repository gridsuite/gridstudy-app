/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { FunctionComponent } from 'react';
import { IColumnsDef, LIMIT_REDUCTIONS_FORM } from './columns-definitions';
import { useFieldArray } from 'react-hook-form';
import LimitReductionTableRow from './limit-reduction-table-row';

interface LimitReductionsTableProps {
    columnsDefinition: IColumnsDef[];
    tableHeight: number;
}

const LimitReductionsTable: FunctionComponent<LimitReductionsTableProps> = ({ columnsDefinition, tableHeight }) => {
    const { fields: rows } = useFieldArray({
        name: LIMIT_REDUCTIONS_FORM,
    });

    return (
        <TableContainer
            sx={{
                height: tableHeight,
                width: 'inherit',
                border: 'solid 0px rgba(0,0,0,0.1)',
            }}
        >
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                    <TableRow>
                        {columnsDefinition.map((column) => (
                            <TableCell
                                key={column.dataKey}
                                sx={{
                                    textAlign: 'center',
                                }}
                                title={column.tooltip}
                            >
                                <span style={{ letterSpacing: '0.1em', fontSize: '0.8em' }}>{column.label}</span>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <LimitReductionTableRow key={`${row.id}`} columnsDefinition={columnsDefinition} index={index} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LimitReductionsTable;
