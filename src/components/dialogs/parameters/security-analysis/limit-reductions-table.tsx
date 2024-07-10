/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
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
} from '@mui/material';
import React, { FunctionComponent } from 'react';
import { IColumnsDef } from './columns-definitions';
import { UseFieldArrayReturn } from 'react-hook-form';

interface LimitReductionsTableProps {
    arrayFormName: string;
    useFieldArrayOutput: UseFieldArrayReturn;
    columnsDefinition: IColumnsDef[];
    tableHeight: number;
}

const LimitReductionsTable: FunctionComponent<LimitReductionsTableProps> = ({
    arrayFormName,
    useFieldArrayOutput,
    columnsDefinition,
    tableHeight,
}) => {
    //const { fields: currentRows, append, remove } = useFieldArrayOutput;

    return (
        <TableContainer
            sx={{
                height: tableHeight,
                border: 'solid 0px rgba(0,0,0,0.1)',
            }}
        >
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                    {columnsDefinition.map((column: IColumnsDef) => (
                        <TableCell
                            key={column.dataKey}
                            sx={{ width: column.width, textAlign: 'center' }}
                        >
                            <Box>{column.label}</Box>
                        </TableCell>
                    ))}
                </TableHead>
                <TableBody>
                    {/*{currentRows.map(*/}
                    {/*    (row: Record<'id', string>, index: number) => (*/}
                    {/*        <LimitReductionTableRow*/}
                    {/*            arrayFormName={arrayFormName}*/}
                    {/*            columnsDefinition={columnsDefinition}*/}
                    {/*            row={row}*/}
                    {/*            index={index}*/}
                    {/*        />*/}
                    {/*    )*/}
                    {/*)}*/}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LimitReductionsTable;
