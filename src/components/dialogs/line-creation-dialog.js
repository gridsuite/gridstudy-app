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
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { createLine } from '../../utils/rest-api';
import {
    filledTextField,
    SusceptanceAdornment,
    OhmAdornment,
    AmpereAdornment,
    useDoubleValue,
    useInputForm,
    useTextValue,
    useConnectivityValue,
} from './input-hooks';
import { makeStyles } from '@material-ui/core/styles';

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
 * Dialog to create a line in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 */
const LineCreationDialog = ({
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
    workingNodeUuid,
}) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [lineId, lineIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [lineName, lineNameField] = useTextValue({
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

    const [shuntConductance1, shuntConductance1Field] = useDoubleValue({
        label: 'ShuntConductanceText',
        id: 'ShuntConductance1',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
    });

    const [shuntSusceptance1, shuntSusceptance1Field] = useDoubleValue({
        label: 'ShuntSusceptanceText',
        id: 'ShuntSusceptance1',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
    });

    const [shuntConductance2, shuntConductance2Field] = useDoubleValue({
        label: 'ShuntConductanceText',
        id: 'ShuntConductance2',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
    });

    const [shuntSusceptance2, shuntSusceptance2Field] = useDoubleValue({
        label: 'ShuntSusceptanceText',
        id: 'ShuntSusceptance2',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
    });

    const [connectivity1, connectivity1Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity1',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
        direction: 'column',
    });

    const [connectivity2, connectivity2Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity2',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
        direction: 'column',
    });

    const [permanentCurrentLimit1, permanentCurrentLimit1Field] =
        useDoubleValue({
            label: 'PermanentCurrentLimitText',
            validation: {
                isFieldRequired: false,
                isFieldNumeric: true,
                isValueGreaterThan: '0',
                errorMsgId: 'permanentCurrentLimitGreaterThanZero',
            },
            adornment: AmpereAdornment,
            inputForm: inputForm,
        });

    const [permanentCurrentLimit2, permanentCurrentLimit2Field] =
        useDoubleValue({
            label: 'PermanentCurrentLimitText',
            validation: {
                isFieldRequired: false,
                isFieldNumeric: true,
                isValueGreaterThan: '0',
                errorMsgId: 'permanentCurrentLimitGreaterThanZero',
            },
            adornment: AmpereAdornment,
            inputForm: inputForm,
        });

    const handleSave = () => {
        if (inputForm.validate()) {
            createLine(
                studyUuid,
                selectedNodeUuid,
                lineId,
                lineName,
                seriesResistance,
                seriesReactance,
                shuntConductance1,
                shuntSusceptance1,
                shuntConductance2,
                shuntSusceptance2,
                connectivity1.voltageLevel.id,
                connectivity1.busOrBusbarSection.id,
                connectivity2.voltageLevel.id,
                connectivity2.busOrBusbarSection.id,
                permanentCurrentLimit1,
                permanentCurrentLimit2
            )
                .then(() => {
                    handleCloseAndClear();
                })
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'LineCreationError',
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
            aria-labelledby="dialog-create-line"
            fullWidth={true}
        >
            <DialogTitle>
                <FormattedMessage id="CreateLine" />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {gridItem(lineIdField)}
                    {gridItem(lineNameField)}
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
                        {gridItem(shuntConductance1Field, 14)}
                        {gridItem(shuntSusceptance1Field, 14)}
                    </Grid>
                    <Grid item container direction="column" xs={6}>
                        {gridItem(shuntConductance2Field, 14)}
                        {gridItem(shuntSusceptance2Field, 14)}
                    </Grid>
                </Grid>
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
                    <Grid item container xs={6} direction="column">
                        {gridItem(permanentCurrentLimit1Field, 14)}
                    </Grid>
                    <Grid item container direction="column" xs={6}>
                        {gridItem(permanentCurrentLimit2Field, 14)}
                    </Grid>
                </Grid>
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

LineCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default LineCreationDialog;
