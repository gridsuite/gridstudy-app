/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableRow } from '@mui/material';
import React, { FunctionComponent } from 'react';
import LimitReductionTableCell from './limit-reduction-table-cell';
import { IColumnsDef } from './columns-definitions';

interface TableRowComponentProps {
    columnsDefinition: IColumnsDef[];
    row: Record<'id', string>;
    index: number;
}

const LimitReductionTableRow: FunctionComponent<TableRowComponentProps> = ({
    columnsDefinition,
    row,
    index,
}) => {
    return (
        <TableRow key={`${row.id}.${index}`}>
            {columnsDefinition.map((column: IColumnsDef) =>
                LimitReductionTableCell(index, column)
            )}
        </TableRow>
    );
};

export default LimitReductionTableRow;
