/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import ModificationDialog from '../modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    LOAD_TYPES,
    UNDEFINED_CONNECTION_DIRECTION,
    UNDEFINED_LOAD_TYPE,
} from '../../network/constants';
import {
    useDoubleValue,
    useOptionalEnumValue,
    useInputForm,
    useTextValue,
} from '../../dialogs/inputs/input-hooks';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
    sanitizeString,
} from '../../dialogs/dialogUtils';

import { createLoad } from '../../../utils/rest-api';
import EquipmentSearchDialog from '../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../dialogs/form-search-copy-hook';
import { useConnectivityValue } from '../../dialogs/connectivity-edition';
import { ReactHookFormTextField } from '../inputs/text-field/react-hook-form-text-field';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import { ReactHookFormSelect } from '../inputs/select-field/react-hook-form-select';
import { ReactHookFormNumberTextField } from '../inputs/text-field/react-hook-form-number-text-field';
import {
    ConnectivityForm,
    getConnectivityFormValidationSchema,
} from '../connectivity-form';

/**
 * Dialog to create a load in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const EQUIPMENT_ID_FIELD = 'equipmentId';
const EQUIPMENT_NAME_FIELD = 'equipmentName';
const EQUIPMENT_TYPE_FIELD = 'loadType';
const ACTIVE_POWER_FIELD = 'activePower';
const REACTIVE_POWER_FIELD = 'activePower';

const LoadCreationDialog = ({
    editData,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'loads';

    const schema = yup
        .object()
        .shape({
            [EQUIPMENT_ID_FIELD]: yup.string().required(),
            [EQUIPMENT_NAME_FIELD]: yup.string(),
            [EQUIPMENT_TYPE_FIELD]: yup.string(),
            [ACTIVE_POWER_FIELD]: yup.string().min(0).required(),
            [REACTIVE_POWER_FIELD]: yup.string().min(0).required(),
            ...getConnectivityFormValidationSchema(),
        })
        .required();

    const methods = useForm({
        defaultValues: {
            [EQUIPMENT_ID_FIELD]: '',
            [EQUIPMENT_NAME_FIELD]: '',
            [EQUIPMENT_TYPE_FIELD]: '',
            [ACTIVE_POWER_FIELD]: '',
            [REACTIVE_POWER_FIELD]: '',
            connectivity: {
                voltageLevel: null,
                busOrBusbarSection: null,
                connectionDirection: '',
                connectionName: '',
                connectionPosition: '',
            },
        },
        resolver: yupResolver(schema),
    });

    const {
        control,
        watch,
        reset,
        formState: { errors: yupErrors, isValid, isDirty, dirtyFields },
    } = methods;

    const object = watch();

    console.log('dirtyFields ', dirtyFields, isDirty, yupErrors, object);

    const fromSearchCopyToFormValues = (load) => {
        console.log('FORM VALUES ', load);
        reset({
            [EQUIPMENT_ID_FIELD]: load.id + '(1)',
            [EQUIPMENT_NAME_FIELD]: load.name ?? '',
            [EQUIPMENT_TYPE_FIELD]: load.type,
            [ACTIVE_POWER_FIELD]: load.p0,
            [REACTIVE_POWER_FIELD]: load.q0,
            connectivity: {
                voltageLevel: load.voltageLevelId,
                busOrBusbarSection: null,
                connectionDirection: load.connectionDirection,
                connectionName: load.connectionName,
                connectionPosition: load.connectionPosition,
            },
        });
    };

    const fromEditDataToFormValues = (load) => {
        return {
            [EQUIPMENT_ID_FIELD]: load.equipmentId,
            [EQUIPMENT_NAME_FIELD]: load.equipmentName ?? '',
            [EQUIPMENT_TYPE_FIELD]: load.loadType,
            [ACTIVE_POWER_FIELD]: load.activePower,
            [REACTIVE_POWER_FIELD]: load.reactivePower,
            connectivity: {
                voltageLevel: load.voltageLevelId,
                busOrBusbarSection: load.busOrBusbarSectionId,
                connectionDirection: load.connectionDirection,
                connectionName: load.connectionName,
                connectionPosition: load.connectionPosition,
            },
        };
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: fromSearchCopyToFormValues,
        setFormValues,
    });

    useEffect(() => {
        if (editData) {
            reset(fromEditDataToFormValues(editData));
        }
    }, [editData]);

    const newLoadIdField = (
        <ReactHookFormTextField
            name={EQUIPMENT_ID_FIELD}
            label="ID"
            variant="filled"
            required={
                yup.reach(schema, EQUIPMENT_ID_FIELD)?.exclusiveTests
                    ?.required === true
            }
            control={control}
            errorMessage={yupErrors?.id?.message}
        />
    );

    const newLoadNameField = (
        <ReactHookFormTextField
            name={EQUIPMENT_NAME_FIELD}
            label="Name"
            variant="filled"
            control={control}
            errorMessage={yupErrors?.name?.message}
            required={
                yup.reach(schema, EQUIPMENT_NAME_FIELD)?.exclusiveTests
                    ?.required === true
            }
        />
    );

    const newLoadTypeField = (
        <ReactHookFormSelect
            name={EQUIPMENT_TYPE_FIELD}
            label="Type"
            options={LOAD_TYPES}
            size="small"
            variant="filled"
            fullWidth
            control={control}
            errorMessage={yupErrors?.type?.message}
            required={
                yup.reach(schema, EQUIPMENT_TYPE_FIELD)?.exclusiveTests
                    ?.required === true
            }
        />
    );

    const newActivePowerField = (
        <ReactHookFormNumberTextField
            name={ACTIVE_POWER_FIELD}
            label="ActivePowerText"
            control={control}
            errorMessage={yupErrors?.activePower?.message}
            required={
                yup.reach(schema, ACTIVE_POWER_FIELD)?.exclusiveTests
                    ?.required === true
            }
        />
    );

    const newReactivePowerField = (
        <ReactHookFormNumberTextField
            name={REACTIVE_POWER_FIELD}
            label="ReactivePowerText"
            control={control}
            errorMessage={yupErrors?.reactivePower?.message}
            required={
                yup.reach(schema, REACTIVE_POWER_FIELD)?.exclusiveTests
                    ?.required === true
            }
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            label={'Connectivity'}
            inputForm={inputForm}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            currentNodeUuid={currentNodeUuid}
            voltageLevelIdDefaultValue={formValues?.voltageLevelId || null}
            busOrBusbarSectionIdDefaultValue={
                formValues?.busOrBusbarSectionId || null
            }
            connectionDirectionValue={
                formValues ? formValues.connectionDirection : ''
            }
            connectionNameValue={formValues?.connectionName}
            connectionPositionValue={formValues?.connectionPosition}
            withPosition={true}
        />
    );

    // const [loadId, loadIdField] = useTextValue({
    //     label: 'ID',
    //     validation: { isFieldRequired: true },
    //     inputForm: inputForm,
    //     formProps: filledTextField,
    //     defaultValue: formValues?.equipmentId,
    // });

    // const [loadName, loadNameField] = useTextValue({
    //     label: 'Name',
    //     validation: { isFieldRequired: false },
    //     inputForm: inputForm,
    //     formProps: filledTextField,
    //     defaultValue: formValues?.equipmentName,
    // });

    // const [loadType, loadTypeField] = useOptionalEnumValue({
    //     label: 'Type',
    //     validation: { isFieldRequired: false },
    //     inputForm: inputForm,
    //     formProps: filledTextField,
    //     enumObjects: LOAD_TYPES,
    //     defaultValue:
    //         formValues?.loadType && formValues.loadType !== UNDEFINED_LOAD_TYPE
    //             ? formValues.loadType
    //             : null,
    // });

    // const [activePower, activePowerField] = useDoubleValue({
    //     label: 'ActivePowerText',
    //     validation: {
    //         isFieldRequired: true,
    //         isFieldNumeric: true,
    //     },
    //     adornment: ActivePowerAdornment,
    //     inputForm: inputForm,
    //     defaultValue: formValues ? String(formValues.activePower) : undefined,
    // });

    // const [reactivePower, reactivePowerField] = useDoubleValue({
    //     label: 'ReactivePowerText',
    //     validation: {
    //         isFieldRequired: true,
    //         isFieldNumeric: true,
    //     },
    //     adornment: ReactivePowerAdornment,
    //     inputForm: inputForm,
    //     defaultValue: formValues ? String(formValues.reactivePower) : undefined,
    // });

    // const [connectivity, connectivityField] = useConnectivityValue({
    //     label: 'Connectivity',
    //     inputForm: inputForm,
    //     voltageLevelOptionsPromise: voltageLevelOptionsPromise,
    //     currentNodeUuid: currentNodeUuid,
    //     voltageLevelIdDefaultValue: formValues?.voltageLevelId || null,
    //     busOrBusbarSectionIdDefaultValue:
    //         formValues?.busOrBusbarSectionId || null,
    //     connectionDirectionValue: formValues
    //         ? formValues.connectionDirection
    //         : '',
    //     connectionNameValue: formValues?.connectionName,
    //     connectionPositionValue: formValues?.connectionPosition,
    //     withPosition: true,
    // });

    const handleValidation = () => {
        console.log('IS VALID ', isValid);
        return isValid;
    };

    const onSubmit = (load) => {
        console.log(load);
        createLoad(
            studyUuid,
            currentNodeUuid,
            load[EQUIPMENT_ID_FIELD],
            sanitizeString(load[EQUIPMENT_NAME_FIELD]),
            !load[EQUIPMENT_TYPE_FIELD]
                ? UNDEFINED_LOAD_TYPE
                : load[EQUIPMENT_TYPE_FIELD],
            load[ACTIVE_POWER_FIELD],
            load[REACTIVE_POWER_FIELD],
            load.connectivity.voltageLevel.id,
            load.connectivity.busOrBusbarSection.id,
            editData ? true : false,
            editData ? editData.uuid : undefined,
            load.connectivity?.connectionDirection ??
                UNDEFINED_CONNECTION_DIRECTION,
            load.connectivity?.connectionName ?? null,
            load.connectivity?.connectionPosition ?? null
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'LoadCreationError',
            });
        });
    };

    // const handleSave = () => {
    //     createLoad(
    //         studyUuid,
    //         currentNodeUuid,
    //         loadId,
    //         sanitizeString(loadName),
    //         !loadType ? UNDEFINED_LOAD_TYPE : loadType,
    //         activePower,
    //         reactivePower,
    //         connectivity.voltageLevel.id,
    //         connectivity.busOrBusbarSection.id,
    //         editData ? true : false,
    //         editData ? editData.uuid : undefined,
    //         connectivity?.connectionDirection?.id ??
    //             UNDEFINED_CONNECTION_DIRECTION,
    //         connectivity?.connectionName?.id ?? null,
    //         connectivity?.connectionPosition?.id ?? null
    //     ).catch((error) => {
    //         snackError({
    //             messageTxt: error.message,
    //             headerId: 'LoadCreationError',
    //         });
    //     });
    // };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    return (
        <FormProvider {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidation={handleValidation}
                onSave={onSubmit}
                disabledSave={!isDirty}
                aria-labelledby="dialog-create-load"
                maxWidth={'md'}
                titleId="CreateLoad"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <Grid container spacing={2}>
                    {gridItem(newLoadIdField, 4)}
                    {gridItem(newLoadNameField, 4)}
                    {gridItem(newLoadTypeField, 4)}
                </Grid>
                <GridSection title="Connectivity" />
                <Grid container spacing={2}>
                    {gridItem(connectivityForm, 12)}
                </Grid>
                <GridSection title="Setpoints" />
                <Grid container spacing={2}>
                    {gridItem(newActivePowerField, 4)}
                    {gridItem(newReactivePowerField, 4)}
                </Grid>

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'LOAD'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LoadCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default LoadCreationDialog;
