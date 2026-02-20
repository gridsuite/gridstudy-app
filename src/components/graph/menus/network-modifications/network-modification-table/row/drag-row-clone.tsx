/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell, TableRow } from '@mui/material';
import { mergeSx, NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { createCellStyle, styles } from '../styles';
import { flexRender, Row } from '@tanstack/react-table';
import { memo } from 'react';

const DragCloneRow = memo(({ row }: { row: Row<NetworkModificationMetadata> }) => (
    <TableRow
        sx={mergeSx(styles.tr, {
            backgroundColor: 'background.paper',
            boxShadow: 4,
            opacity: 1,
        })}
    >
        {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} style={createCellStyle(cell, styles)}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
        ))}
    </TableRow>
));

export default DragCloneRow;
