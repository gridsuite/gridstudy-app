/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { createCellStyle, styles } from '../styles';
import { flexRender, Row } from '@tanstack/react-table';
import { memo } from 'react';

const DragCloneRow = memo(({ row }: { row: Row<NetworkModificationMetadata> }) => (
    <Box sx={styles.dragRowClone}>
        {row.getVisibleCells().map(
            (cell) =>
                cell.column.columnDef.id === 'modificationName' && (
                    <Box key={cell.id} style={createCellStyle(cell, styles)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Box>
                )
        )}
    </Box>
));

export default DragCloneRow;
