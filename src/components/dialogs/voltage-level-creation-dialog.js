/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { createVoltageLevel } from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import {
    useAutocompleteField,
    useButtonWithTooltip,
    useDoubleValue,
    useEnumValue,
    useExpandableValues,
    useInputForm,
    useIntegerValue,
    useTextValue,
} from './input-hooks';
import { filledTextField, gridItem, GridSection } from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';

const numericalWithButton = {
    type: 'number',
    inputProps: { min: 0, style: { textAlign: 'right' } },
};

const BusBarSection = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    errors,
}) => {
    const [idSjb, idField] = useTextValue({
        id: 'BusBarSectionID' + index,
        label: 'BusBarSectionID',
        validation: {
            isFieldRequired: true,
        },
        defaultValue: defaultValue?.id || '',
        inputForm: inputForm,
        errorMsg: errors?.BusBarSectionID,
    });
    const [name, nameField] = useTextValue({
        id: 'BusBarSectionName' + index,
        label: 'BusBarSectionName',
        defaultValue: defaultValue?.name || '',
        inputForm: inputForm,
    });

    const [horizPos, horizPosField] = useIntegerValue({
        id: 'BusBarHorizPos' + index,
        label: 'BusBarHorizPos',
        validation: {
            isFieldRequired: true,
        },
        defaultValue: defaultValue?.horizPos || 1,
        inputForm: inputForm,
        formProps: numericalWithButton,
        errorMsg: errors?.BusBarHorizPos,
    });

    const [vertPos, vertPosField] = useIntegerValue({
        id: 'BusBarVertPos' + index,
        label: 'BusBarVertPos',
        validation: {
            isFieldRequired: true,
        },
        defaultValue: defaultValue?.vertPos || 1,
        inputForm: inputForm,
        formProps: numericalWithButton,
        errorMsg: errors?.BusBarVertPos,
    });

    useEffect(() => {
        onChange(index, { id: idSjb, name, horizPos, vertPos });
    }, [index, onChange, horizPos, idSjb, name, vertPos]);

    return (
        <>
            {gridItem(idField, 3)}
            {gridItem(nameField, 3)}
            {gridItem(horizPosField, 3)}
            {gridItem(vertPosField, 2)}
        </>
    );
};

const SWITCH_TYPE = [
    { id: 'BREAKER', label: 'Breaker' },
    { id: 'DISCONNECTOR', label: 'Disconnector' },
];

const getId = (e) => e?.id;

const BusBarConnexion = ({
    onChange,
    index,
    defaultValue,
    inputForm,
    fieldProps,
    errors,
}) => {
    const [fromBBS, fromBBSField] = useAutocompleteField({
        id: 'sjbFrom' + index,
        label: 'BusBarSection',
        inputForm: inputForm,
        validation: {
            isFieldRequired: true,
        },
        defaultValue: defaultValue?.fromBBS,
        values: fieldProps,
        getLabel: getId,
        errorMsg: errors?.sjbFrom,
        allowNewValue: true,
    });
    const [toBBS, toBBSField] = useAutocompleteField({
        id: 'sjbTo' + index,
        label: 'BusBarSection',
        inputForm: inputForm,
        validation: {
            isFieldRequired: true,
        },
        defaultValue: defaultValue?.toBBS,
        values: fieldProps,
        getLabel: getId,
        errorMsg: errors?.sjbTo,
        allowNewValue: true,
    });
    const [switchKind, switchKindField] = useEnumValue({
        label: 'Type',
        defaultValue: defaultValue?.switchKind || 'BREAKER',
        inputForm: inputForm,
        validation: { isFieldRequired: true },
        enumValues: SWITCH_TYPE,
    });

    useEffect(() => {
        onChange(index, {
            fromBBS,
            toBBS,
            switchKind,
        });
    }, [index, fromBBS, toBBS, onChange, switchKind]);

    return (
        <>
            {gridItem(fromBBSField, 3)}
            {gridItem(toBBSField, 3)}
            {gridItem(switchKindField, 3)}
        </>
    );
};

function validateBusBarSection(values) {
    const res = new Map();
    const idMap = values.reduce(
        (m, v) => m.set(v.id, (m.get(v.id) || 0) + 1),
        new Map()
    );

    const keyPosition = (val) => val.horizPos + '#' + val.vertPos;
    const posMap = values.reduce(
        (m, v) => m.set(keyPosition(v), (m.get(keyPosition(v)) || 0) + 1),
        new Map()
    );
    values.forEach((val, idx) => {
        const errorId = idMap.get(val.id) > 1;
        const errorPosition = posMap.get(keyPosition(val)) > 1;
        if (errorId || errorPosition)
            res.set(idx, {
                error: true,
                ...(errorId && { BusBarSectionID: 'DuplicateId' }),
                ...(errorPosition && {
                    BusBarHorizPos: 'SameHorizAndVertPos',
                    BusBarVertPos: 'SameHorizAndVertPos',
                }),
            });
    });
    return res;
}

function validateConnection(values) {
    const res = new Map();
    values.forEach((cnx, idx) => {
        if (cnx.switchKind === 'DISCONNECTOR' && cnx.fromBBS === cnx.toBBS)
            res.set(idx, {
                error: true,
                sjbFrom: 'DisconnectorBetweenSameBusbar',
                sjbTo: 'DisconnectorBetweenSameBusbar',
            });
    });
    return res;
}

/**
 * Dialog to create a voltage level in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param substationOptions the available network sites
 * @param selectedNodeUuid the currently selected tree node
 */
const VoltageLevelCreationDialog = ({
    open,
    onClose,
    substationOptions,
    selectedNodeUuid,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'voltage-levels';

    const clearValues = () => {
        setFormValues(null);
    };

    const toFormValues = (voltageLevel) => {
        return {
            equipmentId: voltageLevel.id + '(1)',
            equipmentName: voltageLevel.name,
            nominalVoltage: voltageLevel.nominalVoltage,
            substationId: voltageLevel.substationId,
            busbarSections: voltageLevel.busbarSections,
            busbarConnections: [],
        };
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        selectedNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
        clearValues,
    });

    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: searchCopy.handleOpenSearchDialog,
    });

    const [voltageLevelId, voltageLevelIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [voltageLevelName, voltageLevelNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [nominalVoltage, nominalVoltageField] = useDoubleValue({
        label: 'NominalVoltage',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.nominalVoltage,
    });

    const [substation, substationField] = useAutocompleteField({
        label: 'Substation',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        values: substationOptions,
        allowNewValue: true,
        getLabel: getId,
        defaultValue: null,
        selectedValue: formValues
            ? substationOptions.find(
                  (value) => value.id === formValues.substationId
              )
            : null,
    });

    const [busBarSections, busBarSectionsField] = useExpandableValues({
        id: 'bbs',
        labelAddValue: 'CreateBusBarSection',
        validateItem: validateBusBarSection,
        inputForm: inputForm,
        Field: BusBarSection,
        defaultValues: formValues?.busbarSections,
    });

    const [connections, connectionsField] = useExpandableValues({
        id: 'connections',
        labelAddValue: 'CreateLink',
        validateItem: validateConnection,
        inputForm: inputForm,
        Field: BusBarConnexion,
        fieldProps: busBarSections,
        defaultValues: formValues?.busbarConnections,
    });

    const handleSave = () => {
        // Check if error list contains an error
        let isValid = inputForm.validate();
        if (isValid) {
            createVoltageLevel(
                studyUuid,
                selectedNodeUuid,
                voltageLevelId,
                voltageLevelName ? voltageLevelName : null,
                nominalVoltage,
                substation.id,
                busBarSections,
                connections
            ).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'VoltageLevelCreationError',
                        intlRef: intlRef,
                    },
                });
            });
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
        }
    };

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    const handleClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            onClose();
        }
    };

    return (
        <>
            <Dialog
                fullWidth
                maxWidth="md" // 3 columns
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-voltage-level"
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateVoltageLevel" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {gridItem(voltageLevelIdField, 3)}
                        {gridItem(voltageLevelNameField, 3)}
                        {gridItem(nominalVoltageField, 3)}
                        {gridItem(substationField, 3)}
                    </Grid>
                    <Grid container>
                        <GridSection title={'BusBarSections'} />
                        {busBarSectionsField}
                    </Grid>
                    <Grid container>
                        <GridSection title={'Connectivity'} />
                        {connectionsField}
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
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'VOLTAGE_LEVEL'}
                onSelectionChange={searchCopy.handleSelectionChange}
                selectedNodeUuid={selectedNodeUuid}
            />
        </>
    );
};

VoltageLevelCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    substationOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
};

export default VoltageLevelCreationDialog;
