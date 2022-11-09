/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { createVoltageLevel } from '../../utils/rest-api';
import { useSnackMessage } from '../../utils/messages';
import {
    useButtonWithTooltip,
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useIntegerValue,
    useTextValue,
} from './inputs/input-hooks';
import {
    filledTextField,
    gridItem,
    GridSection,
    VoltageAdornment,
    compareById,
    getIdOrSelf,
    sanitizeString,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import { useExpandableValues } from './inputs/use-expandable-values';

const validationObj = { isFieldRequired: true };

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
        id: 'BusBarSection' + index,
        label: 'NameOptional',
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
        onChange(index, {
            id: idSjb,
            name: sanitizeString(name),
            horizPos,
            vertPos,
        });
    }, [index, onChange, horizPos, idSjb, name, vertPos]);

    return (
        <>
            {gridItem(idField, 3)}
            {gridItem(nameField, 3)}
            {gridItem(horizPosField, 2)}
            {gridItem(vertPosField, 2)}
        </>
    );
};

const SWITCH_TYPE = [
    { id: 'BREAKER', label: 'Breaker' },
    { id: 'DISCONNECTOR', label: 'Disconnector' },
];

const getBusbarSectionById = (busbars, id) => {
    if (id) {
        return busbars.find((bbs) => bbs?.id === id || bbs?.id === id?.id);
    }
    return null;
};

const BusBarConnexion = ({
    onChange,
    index,
    defaultValue,
    inputForm,
    fieldProps,
    errors,
}) => {
    const filteredValues = useMemo(
        () => fieldProps.filter((val) => val?.id !== ''),
        [fieldProps]
    );
    const [fromBBS, fromBBSField] = useAutocompleteField({
        id: 'sjbFrom' + index,
        label: 'BusBarSection',
        inputForm: inputForm,
        validation: validationObj,
        defaultValue:
            defaultValue && defaultValue.fromBBS
                ? getBusbarSectionById(fieldProps, defaultValue?.fromBBS)
                : '',
        values: filteredValues,
        getLabel: getIdOrSelf,
        errorMsg: errors?.sjbFrom,
        allowNewValue: true,
    });
    const [toBBS, toBBSField] = useAutocompleteField({
        id: 'sjbTo' + index,
        label: 'BusBarSection',
        inputForm: inputForm,
        validation: validationObj,
        defaultValue:
            defaultValue && defaultValue.toBBS
                ? getBusbarSectionById(fieldProps, defaultValue?.toBBS)
                : '',
        values: filteredValues,
        getLabel: getIdOrSelf,
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
 * @param substationOptionsPromise Promise handling list of network substations
 * @param currentNodeUuid the currently selected tree node
 * @param editData the data to edit
 * @param onCreateVoltageLevel callback when OK is triggered,
 *   defaults to create creation hypothesis on server side.
 *   Called with : {
 *     studyUuid,
 *     currentNodeUuid,
 *     voltageLevelId,
 *     voltageLevelName,
 *     nominalVoltage,
 *     substationId,
 *     busBarSections,
 *     busbarConnections
 *     }
 */
const VoltageLevelCreationDialog = ({
    editData,
    open,
    onClose,
    substationOptionsPromise,
    currentNodeUuid,
    onCreateVoltageLevel = createVoltageLevel,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'voltage-levels';

    const [substationOptions, setSubstationOptions] = useState([]);

    const [loadingSubstationOptions, setLoadingSubstationOptions] =
        useState(true);

    const toFormValues = (voltageLevel) => {
        return {
            equipmentId: voltageLevel.id + '(1)',
            equipmentName: voltageLevel.name ?? '',
            nominalVoltage: voltageLevel.nominalVoltage,
            substationId: voltageLevel.substationId,
            busbarSections: voltageLevel.busbarSections,
            busbarConnections: voltageLevel.busbarConnections,
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

    useEffect(() => {
        if (!substationOptionsPromise) return;
        substationOptionsPromise.then((values) => {
            setSubstationOptions(values);
            setLoadingSubstationOptions(false);
        });
    }, [substationOptionsPromise]);

    const [voltageLevelId, voltageLevelIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [voltageLevelName, voltageLevelNameField] = useTextValue({
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName || '',
    });

    const [nominalVoltage, nominalVoltageField] = useDoubleValue({
        label: 'NominalVoltage',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        adornment: VoltageAdornment,
        defaultValue: formValues?.nominalVoltage,
    });

    const formValueSubstationId = useMemo(() => {
        return formValues?.substationId
            ? { id: formValues?.substationId }
            : { id: '' };
    }, [formValues]);

    const [substation, substationField] = useAutocompleteField({
        id: 'optSubstation',
        label: 'Substation',
        validation: validationObj,
        inputForm: inputForm,
        formProps: filledTextField,
        values: substationOptions?.sort(compareById),
        allowNewValue: true,
        getLabel: getIdOrSelf, // as useAutocompleteField is given allowNewValue: true, it will add the string (that has no id property) the user types as allowed option along with the substationOptions that are supposed to have an id property
        defaultValue:
            substationOptions.find(
                (value) => value.id === formValues?.substationId
            ) || formValueSubstationId,
        loading: loadingSubstationOptions,
    });

    const [busBarSections, busBarSectionsField] = useExpandableValues({
        id: 'bbs',
        labelAddValue: 'CreateBusBarSection',
        validateItem: validateBusBarSection,
        inputForm: inputForm,
        Field: BusBarSection,
        defaultValues: formValues?.busbarSections,
        isRequired: true,
    });

    const [connections, connectionsField] = useExpandableValues({
        id: 'connections',
        labelAddValue: 'CreateLink',
        validateItem: validateConnection,
        inputForm: inputForm,
        Field: BusBarConnexion,
        fieldProps: busBarSections,
        defaultValues: formValues?.busbarConnections,
        isRequired: false,
    });

    const handleSave = () => {
        // Check if error list contains an error
        if (inputForm.validate()) {
            let busbarConnections = connections.map((c) => {
                return {
                    fromBBS: c.fromBBS.id,
                    toBBS: c.toBBS.id,
                    switchKind: c.switchKind,
                };
            });

            onCreateVoltageLevel({
                studyUuid,
                currentNodeUuid,
                voltageLevelId,
                voltageLevelName: sanitizeString(voltageLevelName),
                nominalVoltage,
                substationId: getIdOrSelf(substation),
                busbarSections: busBarSections,
                busbarConnections: busbarConnections,
                isUpdate: editData ? true : false,
                modificationUuid: editData ? editData.uuid : undefined,
            }).catch((errorMessage) => {
                console.error('while edit/create VL', errorMessage);
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'VoltageLevelCreationError',
                });
            });
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
        }
    };

    const handleCloseAndClear = () => {
        setFormValues(null);
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
                    <Button onClick={handleCloseAndClear}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!inputForm.hasChanged}
                    >
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
            </Dialog>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'VOLTAGE_LEVEL'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </>
    );
};

VoltageLevelCreationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    substationOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default VoltageLevelCreationDialog;
