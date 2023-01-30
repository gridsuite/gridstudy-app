/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useInputForm, useIntegerValue } from '../inputs/input-hooks';
import { filledTextField, getIdOrSelf, gridItem } from '../dialogUtils';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useAutocompleteField } from '../inputs/use-autocomplete-field';
import { getDynamicMappings } from '../../../utils/rest-api';

function makeButton(onClick, message, disabled) {
    return (
        <Grid item>
            <Button onClick={onClick} variant="contained" disabled={disabled}>
                <FormattedMessage id={message} />
            </Button>
        </Grid>
    );
}

const MAPPING_SELECTION_LABEL = 'DynamicSimulationMappingSelection';
const PARAMETER_START_TIME_LABEL = 'DynamicSimulationStartTime';
const PARAMETER_START_TIME_ERROR_MSG =
    'DynamicSimulationStartTimeGreaterThanOrEqualDefaultValue';
const PARAMETER_STOP_TIME_LABEL = 'DynamicSimulationStopTime';
const PARAMETER_STOP_TIME_ERROR_MSG =
    'DynamicSimulationStopTimeLessThanOrEqualDefaultValue';

const DynamicSimulationParametersSelector = (props) => {
    const { open, onClose, onStart, studyUuid, currentNodeUuid } = props;

    const [mappingNames, setMappingNames] = useState([]);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [mappingName, mappingNameField] = useAutocompleteField({
        label: MAPPING_SELECTION_LABEL,
        inputForm: inputForm,
        values: mappingNames,
        defaultValue: '',
        validation: {
            isFieldRequired: true,
        },
        getLabel: getIdOrSelf,
    });

    const [startTime, startTimeField] = useIntegerValue({
        label: PARAMETER_START_TIME_LABEL,
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
            valueGreaterThanOrEqualTo: 0,
            errorMsgId: PARAMETER_START_TIME_ERROR_MSG,
        },
        inputForm: inputForm,
        defaultValue: 0,
        formProps: filledTextField,
    });

    const [stopTime, stopTimeField] = useIntegerValue({
        label: PARAMETER_STOP_TIME_LABEL,
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
            valueLessThanOrEqualTo: 10000,
            errorMsgId: PARAMETER_STOP_TIME_ERROR_MSG,
        },
        inputForm: inputForm,
        defaultValue: 500,
        formProps: filledTextField,
    });

    useEffect(() => {
        // get all mapping names
        getDynamicMappings(studyUuid, currentNodeUuid)
            .then((mappings) =>
                setMappingNames(mappings.map((mapping) => mapping.name))
            )
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'DynamicSimulationGetMappingError',
                });
            });
    }, [studyUuid, currentNodeUuid, snackError]);

    const handleClose = () => {
        onClose();
    };

    const handleStart = () => {
        if (inputForm.validate()) {
            onStart({
                mappingName: mappingName,
                dynamicSimulationConfiguration: {
                    startTime: startTime,
                    stopTime: stopTime,
                },
            });
        }
    };

    function renderInputs() {
        return (
            <Grid
                container
                spacing={2}
                direction="column"
                item
                xs={12}
                justifyContent={'center'}
            >
                <Grid item>{gridItem(mappingNameField, 6)}</Grid>
                <Grid item>{gridItem(startTimeField, 3)}</Grid>
                <Grid item>{gridItem(stopTimeField, 3)}</Grid>
            </Grid>
        );
    }

    const renderButtons = () => {
        return (
            <Grid container spacing={1} item justifyContent={'right'}>
                {makeButton(handleClose, 'close', false)}
                {makeButton(handleStart, 'Execute', false)}
            </Grid>
        );
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={'sm'}
                fullWidth={true}
            >
                <DialogTitle>
                    <Typography component="span" variant="h5">
                        <FormattedMessage id="DynamicSimulationParametersSelection" />
                    </Typography>
                </DialogTitle>
                <DialogContent>{renderInputs()}</DialogContent>
                <DialogActions>{renderButtons()}</DialogActions>
            </Dialog>
        </>
    );
};

DynamicSimulationParametersSelector.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onStart: PropTypes.func,
    studyUuid: PropTypes.string,
    currentNodeUuid: PropTypes.string,
};

export default DynamicSimulationParametersSelector;
