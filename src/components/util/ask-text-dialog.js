/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

/**
 * Display a modal window asking for a single string
 * @param title : string title of the modal box
 * @param value : string initial value
 * @param show : boolean modal showing
 * @param onValidate : function called when validate button is pressed with the new string as parameter
 * @param onClose : function called when exiting the box (and after onValidate)
 * @returns {JSX.Element}
 * @constructor
 */
export const AskTextDialog = ({ title, value, show, onValidate, onClose }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const intl = useIntl();

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleChange = (e) => {
        setCurrentValue(e.target.value || '');
    };

    const handleValidate = (e) => {
        onValidate(currentValue || '');
        onClose();
    };

    return (
        <Dialog open={show} onClose={onClose}>
            <DialogTitle id={'modal-title'}>{title}</DialogTitle>
            <DialogContent>
                <TextField value={currentValue} onChange={handleChange} />
            </DialogContent>
            <DialogActions>
                <Button variant={'outlined'} onClick={handleValidate}>
                    {intl.formatMessage({ id: 'validate' })}
                </Button>
                <Button onClick={onClose}>
                    {intl.formatMessage({ id: 'cancel' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AskTextDialog;

AskTextDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.string,
};
