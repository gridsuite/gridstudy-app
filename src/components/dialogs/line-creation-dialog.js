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
import React, { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { createLine, fetchEquipmentInfos } from '../../utils/rest-api';
import {
    useDoubleValue,
    useInputForm,
    useTextValue,
    useConnectivityValue,
    useButtonWithTooltip,
} from './input-hooks';
import {
    AmpereAdornment,
    filledTextField,
    gridItem,
    OhmAdornment,
    SusceptanceAdornment,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';

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
 * @param workingNodeUuid : the node we are currently working on
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

    const intl = useIntl();

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const [isDialogSearchOpen, setDialogSearchOpen] = useState(false);

    const handleCloseSearchDialog = () => {
        setDialogSearchOpen(false);
    };

    const handleOpenSearchDialog = () => {
        setDialogSearchOpen(true);
    };

    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: handleOpenSearchDialog,
    });

    const [lineId, lineIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [lineName, lineNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [seriesResistance, seriesResistanceField] = useDoubleValue({
        label: 'SeriesResistanceText',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.seriesResistance,
    });

    const [seriesReactance, seriesReactanceField] = useDoubleValue({
        label: 'SeriesReactanceText',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.seriesReactance,
    });

    const [shuntConductance1, shuntConductance1Field] = useDoubleValue({
        label: 'ShuntConductanceText',
        id: 'ShuntConductance1',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.shuntConductance1,
    });

    const [shuntSusceptance1, shuntSusceptance1Field] = useDoubleValue({
        label: 'ShuntSusceptanceText',
        id: 'ShuntSusceptance1',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.shuntSusceptance1,
    });

    const [shuntConductance2, shuntConductance2Field] = useDoubleValue({
        label: 'ShuntConductanceText',
        id: 'ShuntConductance2',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.shuntConductance2,
    });

    const [shuntSusceptance2, shuntSusceptance2Field] = useDoubleValue({
        label: 'ShuntSusceptanceText',
        id: 'ShuntSusceptance2',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.shuntSusceptance2,
    });

    const [connectivity1, connectivity1Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity1',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
        direction: 'column',
        voltageLevelIdDefaultValue: formValues?.voltageLevelId1 || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId1 || null,
    });

    const [connectivity2, connectivity2Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity2',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
        direction: 'column',
        voltageLevelIdDefaultValue: formValues?.voltageLevelId2 || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId2 || null,
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
            defaultValue: formValues
                ? formValues.currentLimits1.permanentLimit
                : undefined,
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
            defaultValue: formValues
                ? formValues.currentLimits2.permanentLimit
                : undefined,
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
            ).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'LineCreationError',
                        intlRef: intlRef,
                    },
                });
            });
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
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

    const handleSelectionChange = (element) => {
        let msg;
        return fetchEquipmentInfos(
            studyUuid,
            selectedNodeUuid,
            'lines',
            element.id,
            true
        ).then((response) => {
            if (response.status === 200) {
                response.json().then((line) => {
                    setFormValues(null);
                    const lineFormValues = {
                        equipmentId: line.id + '(1)',
                        equipmentName: line.name,
                        seriesResistance: line.r,
                        seriesReactance: line.x,
                        shuntConductance1: line.g1,
                        shuntSusceptance1: line.b1,
                        shuntConductance2: line.g2,
                        shuntSusceptance2: line.b2,
                        voltageLevelId1: line.voltageLevelId1,
                        busOrBusbarSectionId1: null,
                        voltageLevelId2: line.voltageLevelId2,
                        busOrBusbarSectionId2: null,
                        currentLimits1: {
                            permanentLimit: line.permanentLimit1,
                        },
                        currentLimits2: {
                            permanentLimit: line.permanentLimit2,
                        },
                    };
                    setFormValues(lineFormValues);

                    msg = intl.formatMessage(
                        { id: 'EquipmentCopied' },
                        {
                            equipmentId: element.id,
                        }
                    );
                    enqueueSnackbar(msg, {
                        variant: 'info',
                        persist: false,
                        style: { whiteSpace: 'pre-line' },
                    });
                });
            } else {
                console.error(
                    'error while fetching load {loadId} : status = {status}',
                    element.id,
                    response.status
                );
                if (response.status === 404) {
                    msg = intl.formatMessage(
                        { id: 'EquipmentCopyFailed404' },
                        {
                            equipmentId: element.id,
                        }
                    );
                } else {
                    msg = intl.formatMessage(
                        { id: 'EquipmentCopyFailed' },
                        {
                            equipmentId: element.id,
                        }
                    );
                }
                displayErrorMessageWithSnackbar({
                    errorMessage: msg,
                    enqueueSnackbar,
                });
            }
            handleCloseSearchDialog();
        });
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-line"
                fullWidth={true}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateLine" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
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
                            {gridItem(shuntConductance1Field, 12)}
                            {gridItem(shuntSusceptance1Field, 12)}
                        </Grid>
                        <Grid item container xs={6} direction="column">
                            {gridItem(shuntConductance2Field, 12)}
                            {gridItem(shuntSusceptance2Field, 12)}
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
                            {gridItem(permanentCurrentLimit1Field, 12)}
                        </Grid>
                        <Grid item container direction="column" xs={6}>
                            {gridItem(permanentCurrentLimit2Field, 12)}
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
                                {gridItem(connectivity1Field, 12)}
                            </Grid>
                        </Grid>
                        <Grid item container direction="column" xs={6}>
                            <Grid container direction="column" spacing={2}>
                                {gridItem(connectivity2Field, 12)}
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
            <EquipmentSearchDialog
                open={isDialogSearchOpen}
                onClose={handleCloseSearchDialog}
                equipmentType={'LINE'}
                onSelectionChange={handleSelectionChange}
                selectedNodeUuid={selectedNodeUuid}
            />
        </>
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
