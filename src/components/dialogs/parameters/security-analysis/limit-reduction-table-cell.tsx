/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell } from '@mui/material';
import { FloatInput, TextInput } from '@gridsuite/commons-ui';
import React from 'react';
import {
    IColumnsDef,
    LIMIT_REDUCTIONS_FORM,
    VOLTAGE_LEVELS_FORM,
} from './columns-definitions';

function LimitReductionTableCell(rowIndex: number, column: IColumnsDef) {
    return (
        <TableCell
            key={`${rowIndex}].${column.dataKey}`}
            sx={{
                width: column.width,
            }}
        >
            {column.dataKey === VOLTAGE_LEVELS_FORM ? (
                <TextInput
                    name={`${LIMIT_REDUCTIONS_FORM}[${rowIndex}].${column.dataKey}`}
                    formProps={{ disabled: true }}
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
