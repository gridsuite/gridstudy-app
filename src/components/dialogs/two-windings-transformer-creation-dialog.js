/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { createTwoWindingsTransformer } from '../../utils/rest-api';
import {
    useButtonWithTooltip,
    useDoubleValue,
    useInputForm,
    useTextValue,
} from './inputs/input-hooks';
import {
    filledTextField,
    gridItem,
    OhmAdornment,
    sanitizeString,
    SusceptanceAdornment,
    VoltageAdornment,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { useConnectivityValue } from './connectivity-edition';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

/**
 * Dialog to create a two windings transformer in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid : the node we are currently working on
 * @param editData the data to edit
 */
const TwoWindingsTransformerCreationDialog = ({
    editData,
    open,
    onClose,
    voltageLevelOptionsPromise,
    currentNodeUuid,
}) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = '2-windings-transformers';

    const toFormValues = (twt) => {
        return {
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
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
    });

    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: searchCopy.handleOpenSearchDialog,
    });

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

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
            validation: { isFieldRequired: false },
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
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        direction: 'column',
        voltageLevelIdDefaultValue: formValues?.voltageLevelId1 || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId1 || null,
        connectionDirectionValue: formValues
            ? formValues.connectionDirection1
            : '',
        connectionNameValue: formValues?.connectionName1,
        withPosition: true,
    });

    const [connectivity2, connectivity2Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity2',
        inputForm: inputForm,
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        direction: 'column',
        voltageLevelIdDefaultValue: formValues?.voltageLevelId2 || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId2 || null,
        connectionDirectionValue: formValues
            ? formValues.connectionDirection2
            : '',
        connectionNameValue: formValues?.connectionName2,
        withPosition: true,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            createTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                twoWindingsTransformerId,
                sanitizeString(twoWindingsTransformerName),
                seriesResistance,
                seriesReactance,
                magnetizingConductance,
                magnetizingSusceptance,
                ratedVoltage1,
                ratedVoltage2,
                connectivity1.voltageLevel.id,
                connectivity1.busOrBusbarSection.id,
                connectivity2.voltageLevel.id,
                connectivity2.busOrBusbarSection.id,
                editData ? true : false,
                editData ? editData.uuid : undefined,
                connectivity1?.connectionName?.id ?? null,
                connectivity1?.connectionDirection?.id ?? 'UNDEFINED',
                connectivity2?.connectionName?.id ?? null,
                connectivity2?.connectionDirection?.id ?? 'UNDEFINED'
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
        setFormValues(null);
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
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <h3>
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAndClear}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button onClick={handleSave}>
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
            </Dialog>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'TWO_WINDINGS_TRANSFORMER'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </>
    );
};

TwoWindingsTransformerCreationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default TwoWindingsTransformerCreationDialog;
