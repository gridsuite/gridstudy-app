/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell } from '@mui/material';
import { FloatInput } from '@gridsuite/commons-ui';
import React from 'react';

function LimitReductionTableCell(rowIndex: number, column: any) {
    return (
        <TableCell
            key={column.dataKey}
            sx={{
                width: column.width,
            }}
        >
            {/*{column.floatItems && (*/}
            <FloatInput
                name={`limitReduction[${rowIndex}].${column.dataKey}`}
                previousValue={1}
            />
            {/*)}*/}
        </TableCell>
    );
}

export default LimitReductionTableCell;
