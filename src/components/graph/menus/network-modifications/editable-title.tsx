/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { darken, lighten } from '@mui/material/styles';
import { type MuiStyles, OverflowableText } from '@gridsuite/commons-ui';
import NodeNameEditDialog from '../node-name-edit-dialog';

const styles = {
    header: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1),
        color: theme.palette.getContrastText(
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2)
        ),
        display: 'flex',
        alignItems: 'center',
    }),
    nodeNameTitle: {
        flexGrow: 1,
        fontWeight: 'bold',
    },
} as const satisfies MuiStyles;

interface EditableTitleProps {
    name: string;
    onClose: () => void;
    onChange?: (value: string) => void;
}

export const EditableTitle = ({ name, onClose, onChange }: EditableTitleProps) => {
    const [openEditTitle, setOpenEditTitle] = useState(false);

    return (
        <Box sx={styles.header}>
            <IconButton size="small" onClick={() => setOpenEditTitle(true)} disabled={!onChange}>
                <EditIcon />
            </IconButton>
            <OverflowableText text={name} sx={styles.nodeNameTitle} />
            <IconButton size="small" onClick={onClose}>
                <CloseIcon />
            </IconButton>
            <NodeNameEditDialog
                open={openEditTitle}
                titleId={'NewName'}
                initialName={name}
                onSave={(data) => onChange?.(data.name)}
                onClose={() => setOpenEditTitle(false)}
            />
        </Box>
    );
};
