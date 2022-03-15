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
import {
    createTwoWindingsTransformer,
    fetchTwoWindingsTransformerInfos,
} from '../../utils/rest-api';
import {
    useButtonWithTooltip,
    useConnectivityValue,
    useDoubleValue,
    useInputForm,
    useTextValue,
} from './input-hooks';
import {
    filledTextField,
    gridItem,
    OhmAdornment,
    SusceptanceAdornment,
    VoltageAdornment,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';

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

    const [twoWindingsTransformerId, twoWindingsTransformerIdField] =
        useTextValue({
            label: 'ID',
            validation: { isFieldRequired: true },
            inputForm: inputForm,
            formProps: filledTextField,
            defaultValue: formValues?.equipmentId,
        });

    const [twoWindingsTransformerName, twoWindingsTransformerNameField] =
        useTextValue({
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

    const [magnetizingConductance, magnetizingConductanceField] =
        useDoubleValue({
            label: 'MagnetizingConductance',
            validation: { isFieldRequired: true, isFieldNumeric: true },
            adornment: SusceptanceAdornment,
            inputForm: inputForm,
            defaultValue: formValues?.magnetizingConductance,
        });

    const [magnetizingSusceptance, magnetizingSusceptanceField] =
        useDoubleValue({
            label: 'MagnetizingSusceptance',
            validation: { isFieldRequired: true, isFieldNumeric: true },
            adornment: SusceptanceAdornment,
            inputForm: inputForm,
            defaultValue: formValues?.magnetizingSusceptance,
        });

    const [ratedVoltage1, ratedVoltage1Field] = useDoubleValue({
        label: 'RatedVoltage',
        id: 'RatedVoltage1',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: VoltageAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.ratedVoltage1,
    });

    const [ratedVoltage2, ratedVoltage2Field] = useDoubleValue({
        label: 'RatedVoltage',
        id: 'RatedVoltage2',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: VoltageAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.ratedVoltage2,
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
            ).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'TwoWindingsTransformerCreationError',
                        intlRef: intlRef,
                    },
                });
            });
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
        }
    };

    const handleSelectionChange = (element) => {
        let msg;
        fetchTwoWindingsTransformerInfos(
            studyUuid,
            selectedNodeUuid,
            element.id
        ).then((response) => {
            if (response.status === 200) {
                response.json().then((twt) => {
                    setFormValues(null);
                    const twtFormValues = {
                        equipmentId: twt.id + '(1)',
                        equipmentName: twt.name,
                        seriesResistance: twt.r,
                        seriesReactance: twt.x,
                        magnetizingConductance: twt.g,
                        magnetizingSusceptance: twt.b,
                        ratedVoltage1: twt.ratedU1,
                        ratedVoltage2: twt.ratedU2,
                        voltageLevelId1: twt.voltageLevelId1,
                        busOrBusbarSectionId1: null,
                        voltageLevelId2: twt.voltageLevelId2,
                        busOrBusbarSectionId2: null,
                    };
                    setFormValues(twtFormValues);

                    msg = intl.formatMessage(
                        { id: 'TwoWindingsTransformerCopied' },
                        {
                            twoWindingsTransformerId: element.id,
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
                    'error while fetching two windings transformer {twoWindingsTransformerId} : status = {status}',
                    element.id,
                    response.status
                );
                if (response.status === 404) {
                    msg = intl.formatMessage(
                        { id: 'TwoWindingsTransformerCopyFailed404' },
                        {
                            twoWindingsTransformerId: element.id,
                        }
                    );
                } else {
                    msg = intl.formatMessage(
                        { id: 'TwoWindingsTransformerCopyFailed' },
                        {
                            twoWindingsTransformerId: element.id,
                        }
                    );
                }
                displayErrorMessageWithSnackbar({
                    errorMessage: msg,
                    enqueueSnackbar,
                });
            }
        });
        handleCloseSearchDialog();
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

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-two-windings-transformer"
                fullWidth={true}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateTwoWindingsTransformer" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
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
                equipmentType={'TWO_WINDINGS_TRANSFORMER'}
                onSelectionChange={handleSelectionChange}
                selectedNodeUuid={selectedNodeUuid}
            />
        </>
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
