/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell } from '@mui/material';
import { FloatInput, RawReadOnlyInput } from '@gridsuite/commons-ui';
import { FunctionComponent } from 'react';
import { IColumnsDef, LIMIT_REDUCTIONS_FORM, VOLTAGE_LEVELS_FORM } from './columns-definitions';

const LimitReductionTableCell: FunctionComponent<{
    rowIndex: number;
    column: IColumnsDef;
}> = ({ rowIndex, column }) => {
    return (
        <TableCell sx={{ fontWeight: 'bold' }}>
            {column.dataKey === VOLTAGE_LEVELS_FORM ? (
                <RawReadOnlyInput name={`${LIMIT_REDUCTIONS_FORM}[${rowIndex}].${column.dataKey}`} />
            ) : (
                <FloatInput name={`${LIMIT_REDUCTIONS_FORM}[${rowIndex}].${column.dataKey}`} />
            )}
        </TableCell>
    );
};

export default LimitReductionTableCell;
