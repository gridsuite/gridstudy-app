/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useValidNodeName } from './inputs/input-hooks';
import { useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';

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
    const intl = useIntl();
    const studyUuid = useSelector((state) => state.studyUuid);
    const [triggerReset, setTriggerReset] = React.useState(false);

    const [nameError, nameField, isNameOK, currentValue] = useValidNodeName({
        studyUuid,
        defaultValue: value,
        triggerReset,
    });

    const handleValidate = (e) => {
        onValidate(currentValue || '');
        onClose();
    };

    useEffect(() => setTriggerReset(false), [show]);

    const handleClose = (e) => {
        setTriggerReset(nameField.props.value !== value);
        onClose();
    };

    return (
        <Dialog open={show} onClose={onClose} maxWidth={'xs'} fullWidth={true}>
            <DialogTitle id={'modal-title'}>{title}</DialogTitle>
            <DialogContent>
                {nameField}
                {!isNameOK && nameError !== undefined && (
                    <Alert severity="error">{nameError}</Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    {intl.formatMessage({ id: 'cancel' })}
                </Button>
                <Button
                    variant={'outlined'}
                    onClick={handleValidate}
                    disabled={!isNameOK}
                >
                    {intl.formatMessage({ id: 'validate' })}
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
