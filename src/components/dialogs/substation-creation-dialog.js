/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { createSubstation } from '../../utils/rest-api';
import { validateField } from '../util/validation-functions';
import { Autocomplete } from '@material-ui/lab';
import { useParameterState } from '../parameters';
import { PARAM_LANGUAGE } from '../../utils/config-params';
import { getComputedLanguage } from '../../utils/language';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
    h4: {
        marginBottom: 0,
    },
}));

/**
 * Dialog to create a substation in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param selectedNodeUuid : the currently selected tree node
 */
const SubstationCreationDialog = ({ open, onClose, selectedNodeUuid }) => {
    const classes = useStyles();

    const [languageLocal] = useParameterState(PARAM_LANGUAGE);

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [substationId, setSubstationId] = useState('');

    const [substationName, setSubstationName] = useState('');

    const [substationCountry, setSubstationCountry] = useState('');

    const [errors, setErrors] = useState(new Map());

    const handleChangeSubstationId = (event) => {
        setSubstationId(event.target.value);
    };

    const handleChangeSubstationName = (event) => {
        setSubstationName(event.target.value);
    };

    const handleChangeCountry = (newValue) => {
        setSubstationCountry(newValue);
    };

    const handleSave = () => {
        let tmpErrors = new Map(errors);

        tmpErrors.set(
            'substation-id',
            validateField(substationId, {
                isFieldRequired: true,
            })
        );

        setErrors(tmpErrors);

        // Check if error list contains an error
        let isValid =
            Array.from(tmpErrors.values()).findIndex((err) => err.error) === -1;

        if (isValid) {
            createSubstation(
                studyUuid,
                selectedNodeUuid,
                substationId,
                substationName,
                substationCountry
            )
                .then(() => {
                    handleCloseAndClear();
                })
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'SubstationCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
        }
    };

    const clearValues = () => {
        setSubstationId('');
        setSubstationName('');
        setSubstationCountry('');
    };

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    const handleClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            setErrors(new Map());
            onClose();
        }
    };

    const countriesListCB = useCallback(() => {
        try {
            return require('localized-countries')(
                require('localized-countries/data/' +
                    getComputedLanguage(languageLocal).substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            return require('localized-countries')(
                require('localized-countries/data/en')
            );
        }
    }, [languageLocal]);

    const countriesList = countriesListCB();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-substation"
            fullWidth={true}
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateSubstation' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={4} align="start">
                        <TextField
                            size="small"
                            fullWidth
                            id="substation-id"
                            label={intl.formatMessage({ id: 'ID' })}
                            variant="filled"
                            value={substationId}
                            onChange={handleChangeSubstationId}
                            /* Ensures no margin for error message (as when variant "filled" is used, a margin seems to be automatically applied to error message
                               which is not the case when no variant is used) */
                            FormHelperTextProps={{
                                className: classes.helperText,
                            }}
                            {...(errors.get('substation-id')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('substation-id')?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={4} align="start">
                        <TextField
                            size="small"
                            fullWidth
                            id="substation-name"
                            label={
                                intl.formatMessage({ id: 'Name' }) +
                                ' ' +
                                intl.formatMessage({
                                    id: 'Optional',
                                })
                            }
                            value={substationName}
                            onChange={handleChangeSubstationName}
                            variant="filled"
                        />
                    </Grid>
                    <Grid item xs={4} align="start">
                        <Autocomplete
                            id="select-countries"
                            onChange={(event, newValue) => {
                                handleChangeCountry(newValue);
                            }}
                            options={Object.keys(countriesList.object())}
                            getOptionLabel={(code) => countriesList.get(code)}
                            renderInput={(props) => (
                                <TextField
                                    {...props}
                                    variant="filled"
                                    size="small"
                                    label={
                                        intl.formatMessage({ id: 'Country' }) +
                                        ' ' +
                                        intl.formatMessage({
                                            id: 'Optional',
                                        })
                                    }
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAndClear} variant="text">
                    <FormattedMessage id="close" />
                </Button>
                <Button onClick={handleSave} variant="text">
                    <FormattedMessage id="save" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

SubstationCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedNodeUuid: PropTypes.string,
};

export default SubstationCreationDialog;
