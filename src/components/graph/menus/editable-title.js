/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { IconButton, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import AskTextDialog from '../../util/ask-text-dialog';
import { darken, makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    header: {
        backgroundColor: darken(theme.palette.background.default, 0.2),
    },
}));

export const EditableTitle = ({ name, onClose, onChange }) => {
    const [openEditTitle, setOpenEditTitle] = useState(false);
    const classes = useStyles();
    const intl = useIntl();

    return (
        <div style={{ display: 'flex' }} className={classes.header}>
            <IconButton
                size={'small'}
                onClick={() => setOpenEditTitle(true)}
                disabled={onChange === undefined}
            >
                <EditIcon />
            </IconButton>
            <Typography variant={'h5'} style={{ flexGrow: '1' }}>
                {name}
            </Typography>
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
