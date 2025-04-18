/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { IconButton, Box, Theme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { lighten, darken } from '@mui/material/styles';
import { OverflowableText } from '@gridsuite/commons-ui';
import { RootNetworkSelection } from './root-network-selection';
import NodeNameEditDialog from '../node-name-edit-dialog';

const styles = {
    header: (theme: Theme) => ({
        backgroundColor: theme.networkModificationPanel.backgroundColor,
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
};

interface EditableTitleProps {
    name: string;
    onClose: () => void;
    onChange?: (value: string) => void;
    showRootNetworkSelection?: boolean;
}

export const EditableTitle = ({ name, onClose, onChange, showRootNetworkSelection }: EditableTitleProps) => {
    const [openEditTitle, setOpenEditTitle] = useState(false);

    return (
        <Box sx={styles.header}>
            <IconButton size="small" onClick={() => setOpenEditTitle(true)} disabled={!onChange}>
                <EditIcon />
            </IconButton>
            <OverflowableText text={name} sx={styles.nodeNameTitle} />
            {showRootNetworkSelection && <RootNetworkSelection />}
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
