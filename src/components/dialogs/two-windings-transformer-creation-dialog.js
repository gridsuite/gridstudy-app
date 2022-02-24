/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { createTwoWindingsTransformer } from '../../utils/rest-api';
import {
    filledTextField,
    OhmAdornment,
    SusceptanceAdornment,
    useConnectivityValue,
    useDoubleValue,
    useInputForm,
    useTextValue,
    VoltageAdornment,
} from './input-hooks';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
    h4: {
        marginBottom: 0,
    },
}));

/**
 * Dialog to create a two windings transformer in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 */
const TwoWindingsTransformerCreationDialog = ({
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
    workingNodeUuid,
}) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [twoWindingsTransformerId, twoWindingsTransformerIdField] =
        useTextValue({
            label: 'ID',
            validation: { isFieldRequired: true },
            inputForm: inputForm,
            formProps: filledTextField,
        });

    const [twoWindingsTransformerName, twoWindingsTransformerNameField] =
        useTextValue({
            label: 'Name',
            inputForm: inputForm,
            formProps: filledTextField,
        });

    const [seriesResistance, seriesResistanceField] = useDoubleValue({
        label: 'SeriesResistanceText',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: OhmAdornment,
        inputForm: inputForm,
    });

    const [seriesReactance, seriesReactanceField] = useDoubleValue({
        label: 'SeriesReactanceText',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: OhmAdornment,
        inputForm: inputForm,
    });

    const [magnetizingConductance, magnetizingConductanceField] =
        useDoubleValue({
            label: 'MagnetizingConductance',
            validation: { isFieldRequired: true, isFieldNumeric: true },
            adornment: SusceptanceAdornment,
            inputForm: inputForm,
        });

    const [magnetizingSusceptance, magnetizingSusceptanceField] =
        useDoubleValue({
            label: 'MagnetizingSusceptance',
            validation: { isFieldRequired: true, isFieldNumeric: true },
            adornment: SusceptanceAdornment,
            inputForm: inputForm,
        });

    const [ratedVoltage1, ratedVoltage1Field] = useDoubleValue({
        label: 'RatedVoltage',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: VoltageAdornment,
        inputForm: inputForm,
    });

    const [ratedVoltage2, ratedVoltage2Field] = useDoubleValue({
        label: 'RatedVoltage',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: VoltageAdornment,
        inputForm: inputForm,
    });

    const [connectivity1, connectivity1Field] = useConnectivityValue({
        label: 'Connectivity',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
        direction: 'column',
    });

    const [connectivity2, connectivity2Field] = useConnectivityValue({
        label: 'Connectivity',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
        direction: 'column',
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            createTwoWindingsTransformer(
                studyUuid,
                selectedNodeUuid,
                twoWindingsTransformerId,
                twoWindingsTransformerName,
                seriesResistance,
                seriesReactance,
                magnetizingConductance,
                magnetizingSusceptance,
                ratedVoltage1,
                ratedVoltage2,
                connectivity1.voltageLevel.id,
                connectivity1.busOrBusbarSection.id,
                connectivity2.voltageLevel.id,
                connectivity2.busOrBusbarSection.id
            )
                .then(() => {
                    handleCloseAndClear();
                })
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId:
                                'TwoWindingsTransformerCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
        }
    };

    const clearValues = useCallback(() => {
        inputForm.clear();
    }, [inputForm]);

    const handleClose = useCallback(
        (event, reason) => {
            if (reason !== 'backdropClick') {
                inputForm.reset();
                onClose();
            }
        },
        [inputForm, onClose]
    );

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    function gridItem(field, size = 6) {
        return (
            <Grid item xs={size} align="start">
                {field}
            </Grid>
        );
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-two-windings-transformer"
            fullWidth={true}
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateTwoWindingsTransformer' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {gridItem(twoWindingsTransformerIdField)}
                    {gridItem(twoWindingsTransformerNameField)}
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3 className={classes.h3}>
                            <FormattedMessage id="Characteristics" />
                        </h3>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    {gridItem(seriesResistanceField)}
                    {gridItem(seriesReactanceField)}
                    {gridItem(magnetizingConductanceField)}
                    {gridItem(magnetizingSusceptanceField)}
                </Grid>
                {/* <br /> */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3 className={classes.h3}>
                            <FormattedMessage id="Limits" />
                        </h3>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side1" />
                        </h4>
                    </Grid>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side2" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    {gridItem(ratedVoltage1Field)}
                    {gridItem(ratedVoltage2Field)}
                </Grid>
                {/* <br /> */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3 className={classes.h3}>
                            <FormattedMessage id="Connectivity" />
                        </h3>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side1" />
                        </h4>
                    </Grid>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side2" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item container xs={6} direction="column">
                        <Grid container direction="column" spacing={2}>
                            {gridItem(connectivity1Field, 'column')}
                        </Grid>
                    </Grid>
                    <Grid item container direction="column" xs={6}>
                        <Grid container direction="column" spacing={2}>
                            {gridItem(connectivity2Field, 'column')}
                        </Grid>
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

TwoWindingsTransformerCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default TwoWindingsTransformerCreationDialog;
