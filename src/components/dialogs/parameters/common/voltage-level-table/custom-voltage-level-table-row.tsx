/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TableRow } from '@mui/material';
import { FunctionComponent } from 'react';

import { CustomVoltageLevelTableCell } from './custom-voltage-level-table-cell';
import { IColumnsDef } from '../limitreductions/columns-definitions';

interface TableRowComponentProps {
    formName: string;
    columnsDefinition: IColumnsDef[];
    index: number;
}

export const CustomVoltageLevelTableRow: FunctionComponent<TableRowComponentProps> = ({
    formName,
    columnsDefinition,
    index,
}) => {
    return (
        <TableRow>
            {columnsDefinition.map((column: IColumnsDef) => (
                <CustomVoltageLevelTableCell
                    key={`${column.dataKey}`}
                    formName={formName}
                    rowIndex={index}
                    column={column}
                />
            ))}
        </TableRow>
    );
};
