/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useState } from 'react';
import { IconButton, Box, Theme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AskTextDialog from '../../utils/ask-text-dialog';
import { lighten, darken } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { OverflowableText } from '@gridsuite/commons-ui';

const styles = {
    header: (theme: Theme) => ({
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2),
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
}

export const EditableTitle: FunctionComponent<EditableTitleProps> = ({ name, onClose, onChange }) => {
    const [openEditTitle, setOpenEditTitle] = useState(false);
    const intl = useIntl();

    return (
        <Box sx={styles.header}>
            <IconButton size={'small'} onClick={() => setOpenEditTitle(true)} disabled={onChange === undefined}>
                <EditIcon />
            </IconButton>
            <OverflowableText text={name} sx={styles.nodeNameTitle} />
            <IconButton size={'small'} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            <AskTextDialog
                show={openEditTitle}
                title={intl.formatMessage({ id: 'NewName' })}
                value={name}
                onValidate={(e) => {
                    onChange?.(e);
                }}
                onClose={() => setOpenEditTitle(false)}
            />
        </Box>
    );
};
