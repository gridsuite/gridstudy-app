/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import {
    useButtonWithTooltip,
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useIntegerValue,
    useTextValue,
} from './inputs/input-hooks';
import { createShuntCompensator } from '../../utils/rest-api';
import {
    filledTextField,
    gridItem,
    GridSection,
    SusceptanceAdornment,
    toPositiveIntValue,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { useBooleanValue } from './inputs/boolean';
import { useConnectivityValue } from './connectivity-edition';
import { CONNECTION_DIRECTION } from '../network/constants';
import { Box } from '@mui/material';

const disabledChecked = { disabled: true };

/**
 * Dialog to create a shunt compensator in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid : the node we are currently working on
 * @param editData the data to edit
 */
const ShuntCompensatorCreationDialog = ({
    open,
    onClose,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    editData,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'shunt-compensators';

    const toFormValues = (shuntCompensator) => {
        return {
            equipmentId: shuntCompensator.id + '(1)',
            equipmentName: shuntCompensator.name,
            maximumNumberOfSections: shuntCompensator.maximumSectionCount,
            currentNumberOfSections: shuntCompensator.sectionCount,
            susceptancePerSection: shuntCompensator.bperSection,
            voltageLevelId: shuntCompensator.voltageLevelId,
            busOrBusbarSectionId: null,
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

    const [shuntCompensatorId, shuntCompensatorIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [shuntCompensatorName, shuntCompensatorNameField] = useTextValue({
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [maximumNumberOfSections, maximumNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntMaximumNumberOfSections',
            validation: {
                isFieldRequired: true,
                isValueGreaterThan: '0',
                errorMsgId: 'ShuntCompensatorErrorMaximumLessThanOne',
            },
            transformValue: toPositiveIntValue,
            inputForm: inputForm,
            defaultValue: formValues?.maximumNumberOfSections || 1,
        });

    const [currentNumberOfSections, currentNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntCurrentNumberOfSections',
            validation: {
                isValueLessOrEqualTo: maximumNumberOfSections,
                isValueGreaterThan: '-1',
                errorMsgId: 'ShuntCompensatorErrorCurrentLessThanMaximum',
                isFieldRequired: true,
            },
            transformValue: toPositiveIntValue,
            inputForm: inputForm,
            defaultValue: formValues?.currentNumberOfSections || 0,
        });

    const [identicalSections, identicalSectionsField] = useBooleanValue({
        label: 'ShuntIdenticalSections',
        validation: { isFieldRequired: true },
        formProps: disabledChecked,
        inputForm: inputForm,
        defaultValue: formValues?.identicalSections || true,
    });

    const [susceptancePerSection, susceptancePerSectionField] = useDoubleValue({
        label: 'ShuntSusceptancePerSection',
        validation: { isFieldRequired: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.susceptancePerSection,
    });

    const [connectivity, connectivityField] = useConnectivityValue({
        label: 'Connectivity',
        inputForm: inputForm,
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        voltageLevelIdDefaultValue: formValues?.voltageLevelId || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId || null,
        connectionDirection: formValues ? formValues.connectionDirection : '',
        connectionName: formValues?.connectionName,
        withPosition: true,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            createShuntCompensator(
                studyUuid,
                currentNodeUuid,
                shuntCompensatorId,
                shuntCompensatorName ? shuntCompensatorName : null,
                maximumNumberOfSections,
                currentNumberOfSections,
                identicalSections,
                susceptancePerSection,
                connectivity,
                editData ? true : false,
                editData ? editData.uuid : undefined
            ).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'ShuntCompensatorCreationError',
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
                fullWidth
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-shuntCompensator"
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateShuntCompensator" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {gridItem(shuntCompensatorIdField)}
                        {gridItem(shuntCompensatorNameField)}
                    </Grid>
                    <GridSection title="Connectivity" />
                    <Grid container spacing={2}>
                        {gridItem(connectivityField, 12)}
                    </Grid>
                    <GridSection title="Characteristics" />
                    <Grid container spacing={2}>
                        {gridItem(maximumNumberOfSectionsField)}
                        {gridItem(currentNumberOfSectionsField)}
                        {gridItem(identicalSectionsField)}
                        {gridItem(susceptancePerSectionField)}
                    </Grid>
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
                equipmentType={'SHUNT_COMPENSATOR'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </>
    );
};

ShuntCompensatorCreationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default ShuntCompensatorCreationDialog;
