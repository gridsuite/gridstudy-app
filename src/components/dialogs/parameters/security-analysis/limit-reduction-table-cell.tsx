/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell, TextField } from '@mui/material';
import { FloatInput } from '@gridsuite/commons-ui';
import React from 'react';
import {
    IColumnsDef,
    LIMIT_REDUCTIONS_FORM,
    VOLTAGE_LEVELS_FORM,
} from './columns-definitions';

function LimitReductionTableCell(rowIndex: number, column: IColumnsDef) {
    return (
        <TableCell
            key={`LimitReductionTableCell[${rowIndex}].${column.dataKey}`}
            sx={{
                width: column.width,
            }}
        >
            {column.dataKey === VOLTAGE_LEVELS_FORM ? (
                <TextField
                    name={`${LIMIT_REDUCTIONS_FORM}[${rowIndex}].${column.dataKey}`}
                    fullWidth
                    InputProps={{
                        readOnly: true,
                    }}
                />
            ) : (
                <FloatInput
                    name={`${LIMIT_REDUCTIONS_FORM}[${rowIndex}].${column.dataKey}`}
                />
            )}
        </TableCell>
    );
}

export default LimitReductionTableCell;
