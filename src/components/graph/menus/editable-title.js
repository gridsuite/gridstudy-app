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

const useStyles = makeStyles((theme) => ({
    header: {
        backgroundColor: darken(theme.palette.background.default, 0.2),
    },
}));

export const EditableTitle = ({ name, onClose, onChange }) => {
    const [editTitle, setEditTitle] = useState(false);
    const classes = useStyles();

    return (
        <div>
            <Typography
                className={classes.header}
                variant={'h5'}
                style={{ display: 'flex' }}
            >
                <IconButton
                    size={'small'}
                    onClick={() => setEditTitle(true)}
                    disabled={onChange === undefined}
                >
                    <EditIcon />
                </IconButton>
                <span style={{ flexGrow: '1' }}>{name}</span>
                <IconButton size={'small'} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Typography>
            <AskTextDialog
                show={editTitle}
                title={'changeName'}
                value={name}
                onValidate={(e) => {
                    onChange(e);
                }}
                onClose={() => setEditTitle(false)}
            />
        </div>
    );
};
