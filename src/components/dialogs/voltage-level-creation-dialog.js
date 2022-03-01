/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
    useDoubleValue,
    useEnumValue,
    useExpandableValues,
    useInputForm,
    useIntegerValue,
    useTextValue,
} from './input-hooks';
import { filledTextField, GridSection } from './dialogUtils';

function gridItem(field, size = 3) {
    return (
        <Grid item xs={size} align="start">
            {field}
        </Grid>
    );
}

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
            function: () => errors?.get('BusBarSectionID'),
        },
        defaultValue: defaultValue?.id || '',
        inputForm: inputForm,
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
            function: () => errors?.get('BusBarHorizPos'),
        },
        defaultValue: defaultValue?.horizPos || 1,
        inputForm: inputForm,
        formProps: numericalWithButton,
    });

    const [vertPos, vertPosField] = useIntegerValue({
        id: 'BusBarVertPos' + index,
        label: 'BusBarVertPos',
        validation: {
            isFieldRequired: true,
            function: () => errors?.get('BusBarVertPos'),
        },
        defaultValue: defaultValue?.vertPos || 1,
        inputForm: inputForm,
        formProps: numericalWithButton,
    });

    useEffect(() => {
        onChange(index, { idSjb, name, horizPos, vertPos });
    }, [index, onChange, horizPos, idSjb, name, vertPos]);

    return (
        <>
            {gridItem(idField)}
            {gridItem(nameField)}
            {gridItem(horizPosField)}
            {gridItem(vertPosField, 2)}
        </>
    );
};

const SWITCH_TYPE = [
    { id: 'BREAKER', label: 'Breaker' },
    { id: 'DISCONNECTOR', label: 'Disconnector' },
];

const getIdSjb = (e) => e?.idSjb;
const getId = (e) => e?.id;

const BusBarConnexion = ({
    onChange,
    index,
    defaultValue,
    inputForm,
    fieldProps,
    errors,
}) => {
    const [fromBBS, fromBBSField] = useEnumValue({
        id: 'sjbFrom' + index,
        label: 'BusBarSection',
        inputForm: inputForm,
        validation: {
            isFieldRequired: true,
            function: () => errors?.get('sjbFrom'),
        },
        defaultValue: defaultValue?.fromBBS,
        enumValues: fieldProps,
        doTranslation: false,
        getId: getIdSjb,
        getEnumLabel: getIdSjb,
    });
    const [toBBS, toBBSField] = useEnumValue({
        id: 'sjbTo' + index,
        label: 'BusBarSection',
        inputForm: inputForm,
        enumValues: fieldProps,
        validation: {
            isFieldRequired: true,
            function: () => errors?.get('sjbTo'),
        },
        defaultValue: defaultValue?.toBBS,
        doTranslation: false,
        getId: getIdSjb,
        getEnumLabel: getIdSjb,
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
            {gridItem(fromBBSField)}
            {gridItem(toBBSField)}
            {gridItem(switchKindField)}
        </>
    );
};

function validateBusBarSection(values) {
    const res = new Map();
    const idMap = values.reduce(
        (m, v) => m.set(v.idSjb, m.get(v.idSjb) + 1 || 1),
        new Map()
    );

    const keyPosition = (val) => val.horizPos + '#' + val.vertPos;
    const posMap = values.reduce(
        (m, v) => m.set(keyPosition(v), m.get(keyPosition(v)) + 1 || 1),
        new Map()
    );
    values.forEach((val, idx) => {
        const errorId = idMap.get(val) > 1;
        const errorPosition = posMap.get(keyPosition(val));
        res.set(idx, {
            error: errorId || errorPosition,
            ...(errorId && { BusBarSection: 'not unique' }),
            ...(errorPosition && {
                BusBarHorizPos: 'SameHorizAndVertPos',
                BusBarVertPos: 'SameHorizAndVertPos',
            }),
        });
    });
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

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [voltageLevelId, voltageLevelIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [voltageLevelName, voltageLevelNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [nominalVoltage, nominalVoltageField] = useDoubleValue({
        label: 'NominalVoltage',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [substation, substationField] = useAutocompleteField({
        label: 'Substation',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        values: substationOptions,
        allowNewValue: true,
        getLabel: getId,
    });

    const [busBarSections, busBarSectionsField] = useExpandableValues({
        id: 'bbs',
        labelAddValue: 'CreateBusBarSection',
        validateItem: validateBusBarSection,
        inputForm: inputForm,
        formProps: filledTextField,
        Field: BusBarSection,
    });

    const [connections, connectionsField] = useExpandableValues({
        id: 'connections',
        labelAddValue: 'CreateLink',
        validateItem: validateConnection,
        inputForm: inputForm,
        formProps: filledTextField,
        Field: BusBarConnexion,
        fieldProps: busBarSections,
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

    const clearValues = () => {
        inputForm.clear();
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
        <Dialog
            fullWidth
            maxWidth="md" // 3 columns
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-voltage-level"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateVoltageLevel' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {gridItem(voltageLevelIdField)}
                    {gridItem(voltageLevelNameField)}
                    {gridItem(nominalVoltageField)}
                    {gridItem(substationField)}
                    <GridSection title={'BusBarSections'} />
                    {busBarSectionsField}
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
    );
};

VoltageLevelCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    substationOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
};

export default VoltageLevelCreationDialog;
