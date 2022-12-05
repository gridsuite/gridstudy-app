/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState, useMemo } from 'react';
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { createVoltageLevel } from '../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
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
        validation: { isFieldRequired: true },
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
        validation: { isFieldRequired: true },
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
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const VoltageLevelCreationDialog = ({
    editData,
    substationOptionsPromise,
    currentNodeUuid,
    onCreateVoltageLevel = createVoltageLevel,
    ...dialogProps
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
        validation: { isFieldRequired: true },
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

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
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
    };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    return (
        <ModificationDialog
            fullWidth
            maxWidth="md" // 3 columns
            onClear={clear}
            onValidation={handleValidation}
            onSave={handleSave}
            disabledSave={!inputForm.hasChanged}
            aria-labelledby="dialog-create-voltage-level"
            titleId="CreateVoltageLevel"
            searchCopy={searchCopy}
            {...dialogProps}
        >
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

            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'VOLTAGE_LEVEL'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </ModificationDialog>
    );
};

VoltageLevelCreationDialog.propTypes = {
    editData: PropTypes.object,
    substationOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
    onCreateVoltageLevel: PropTypes.func,
};

export default VoltageLevelCreationDialog;
