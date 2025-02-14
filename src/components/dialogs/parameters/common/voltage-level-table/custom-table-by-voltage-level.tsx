/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { IColumnsDef } from '../limitreductions/columns-definitions';
import { useFieldArray } from 'react-hook-form';
import { CustomTableByVoltageLevelTableRow } from './custom-table-by-voltage-level-table-row';

interface CustomTableByVoltageLevelProps {
    formName: string;
    columnsDefinition: IColumnsDef[];
}

export const CustomTableByVoltageLevel = ({ columnsDefinition, formName }: CustomTableByVoltageLevelProps) => {
    const { fields: rows } = useFieldArray({
        name: formName,
    });

    return (
        <TableContainer
            sx={{
                height: 450,
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
                                {column.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <CustomTableByVoltageLevelTableRow
                            key={`${row.id}`}
                            formName={formName}
                            columnsDefinition={columnsDefinition}
                            index={index}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
