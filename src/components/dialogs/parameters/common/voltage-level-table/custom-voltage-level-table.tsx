/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { FunctionComponent, useMemo } from 'react';
import { IColumnsDef, LIMIT_REDUCTIONS_FORM } from '../limitreductions/columns-definitions';
import { useFieldArray } from 'react-hook-form';
import LimitReductionTableRow from '../limitreductions/limit-reduction-table-row';
import { CustomVoltageLevelTableRow } from './custom-voltage-level-table-row';

interface LimitReductionsTableProps {
    columnsDefinition: IColumnsDef[];
    tableHeight: number;
    formName: string;
}

const CustomVoltageLevelTable: FunctionComponent<LimitReductionsTableProps> = ({
    formName,
    columnsDefinition,
    tableHeight,
}) => {
    const { fields: rows } = useFieldArray({
        name: formName,
    });

    const TableRowComponent = useMemo(
        () => (formName === LIMIT_REDUCTIONS_FORM ? LimitReductionTableRow : CustomVoltageLevelTableRow),
        [formName]
    );

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
                                {column.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRowComponent
                            key={`${row.id}`}
                            columnsDefinition={columnsDefinition}
                            index={index}
                            formName={formName}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CustomVoltageLevelTable;
