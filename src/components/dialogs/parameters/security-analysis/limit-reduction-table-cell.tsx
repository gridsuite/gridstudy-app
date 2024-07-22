/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell } from '@mui/material';
import { FloatInput } from '@gridsuite/commons-ui';
import React from 'react';

function LimitReductionTableCell(
    arrayFormName: string,
    rowIndex: number,
    column: any
) {
    return (
        <TableCell
            key={column.dataKey}
            sx={{
                width: column.width,
            }}
        >
            {column.floatItems && (
                <FloatInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    previousValue={1}
                />
            )}
        </TableCell>
    );
}

export default LimitReductionTableCell;
