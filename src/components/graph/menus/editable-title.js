/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AskTextDialog from '../../util/ask-text-dialog';
import { lighten, darken } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { OverflowableText } from '@gridsuite/commons-ui';

const useStyles = makeStyles((theme) => ({
    header: {
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
    },
    nodeNameTitle: {
        flexGrow: 1,
        fontWeight: 'bold',
    },
}));

export const EditableTitle = ({ name, onClose, onChange }) => {
    const [openEditTitle, setOpenEditTitle] = useState(false);
    const classes = useStyles();
    const intl = useIntl();

    return (
        <div className={classes.header}>
            <IconButton
                size={'small'}
                onClick={() => setOpenEditTitle(true)}
                disabled={onChange === undefined}
            >
                <EditIcon />
            </IconButton>
            <OverflowableText text={name} className={classes.nodeNameTitle} />
            <IconButton size={'small'} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            <AskTextDialog
                show={openEditTitle}
                title={intl.formatMessage({ id: 'NewName' })}
                value={name}
                onValidate={(e) => {
                    onChange(e);
                }}
                onClose={() => setOpenEditTitle(false)}
            />
        </div>
    );
};

EditableTitle.propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
};
