/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';

export const AskTextDialog = ({ title, value, show, onValidate, onClose }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const intl = useIntl();
    const handleChange = (e) => {
        setCurrentValue(e.target.value);
    };

    const handleValidate = (e) => {
        onValidate(e.target.value);
        onClose();
    };

    return (
        <Dialog open={show} onClose={onClose}>
            <DialogTitle id={'modal-title'}>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    value={currentValue}
                    onChange={handleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color={'primary'}
                    variant={'outlined'}
                    onClick={handleValidate}
                >
                    {intl.formatMessage({ id: 'validate' })}
                </Button>
                <Button color={'primary'} onClick={onClose}>
                    {intl.formatMessage({ id: 'cancel' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AskTextDialog;
