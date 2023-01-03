/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import ModificationDialog from '../modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    LOAD_TYPES,
    UNDEFINED_CONNECTION_DIRECTION,
    UNDEFINED_LOAD_TYPE,
} from '../../../network/constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
    sanitizeString,
} from '../../../dialogs/dialogUtils';

import { createLoad, fetchEquipmentInfos } from '../../../../utils/rest-api';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import ReactHookFormTextField from '../../inputs/text-field/react-hook-form-text-field';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import ReactHookFormSelect from '../../inputs/select-field/react-hook-form-select';
import { ConnectivityForm } from '../connectivity/connectivity-form';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import ReactHookFormFloatNumberTextField from '../../inputs/text-field/react-hook-form-float-number-text-field';
import { getAdornmentInputProps } from '../../inputs/utils';

/**
 * Dialog to create a load in the network
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const EQUIPMENT_ID = 'equipmentId';
const EQUIPMENT_NAME = 'equipmentName';
const EQUIPMENT_TYPE = 'loadType';
const ACTIVE_POWER = 'activePower';
const REACTIVE_POWER = 'reactivePower';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [EQUIPMENT_TYPE]: '',
    [ACTIVE_POWER]: 0,
    [REACTIVE_POWER]: 0,
    ...getConnectivityEmptyFormData(),
};

const LoadCreationDialog = ({ editData, currentNodeUuid, ...dialogProps }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const equipmentPath = 'loads';

    const schema = yup
        .object()
        .shape({
            [EQUIPMENT_ID]: yup.string().required(),
            [EQUIPMENT_NAME]: yup.string(),
            [EQUIPMENT_TYPE]: yup.string(),
            [ACTIVE_POWER]: yup.number().required(),
            [REACTIVE_POWER]: yup.number().required(),
            ...getConnectivityFormValidationSchema(),
        })
        .required();

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const {
        control,
        reset,
        formState: { isDirty },
    } = methods;

    const fromSearchCopyToFormValues = (load) => {
        fetchEquipmentInfos(
            studyUuid,
            currentNodeUuid,
            'voltage-levels',
            load.voltageLevelId,
            true
        ).then((vlResult) => {
            reset({
                [EQUIPMENT_ID]: load.id + '(1)',
                [EQUIPMENT_NAME]: load.name ?? '',
                [EQUIPMENT_TYPE]: load.type,
                [ACTIVE_POWER]: load.p0,
                [REACTIVE_POWER]: load.q0,
                ...getConnectivityFormData({
                    voltageLevelId: load.voltageLevelId,
                    voltageLevelTopologyKind: vlResult.topologyKind,
                    voltageLevelName: vlResult.name,
                    voltageLevelNominalVoltage: vlResult.nominalVoltage,
                    voltageLevelSubstationId: vlResult.substationId,
                }),
            });
        });
    };

    const fromEditDataToFormValues = useCallback(
        (load) => {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'voltage-levels',
                load.voltageLevelId,
                true
            ).then((vlResult) => {
                reset({
                    [EQUIPMENT_ID]: load.equipmentId,
                    [EQUIPMENT_NAME]: load.equipmentName ?? '',
                    [EQUIPMENT_TYPE]: load.loadType,
                    [ACTIVE_POWER]: load.activePower,
                    [REACTIVE_POWER]: load.reactivePower,
                    ...getConnectivityFormData({
                        voltageLevelId: load.voltageLevelId,
                        voltageLevelTopologyKind: vlResult.topologyKind,
                        voltageLevelName: vlResult.name,
                        voltageLevelNominalVoltage: vlResult.nominalVoltage,
                        voltageLevelSubstationId: vlResult.substationId,
                        busbarSectionId: load.busOrBusbarSectionId,
                        connectionDirection: load.connectionDirection,
                        connectionName: load.connectionName,
                        connectionPosition: load.connectionPosition,
                    }),
                });
            });
        },
        [studyUuid, currentNodeUuid, reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const newLoadIdField = (
        <ReactHookFormTextField
            name={EQUIPMENT_ID}
            label="ID"
            required={
                yup.reach(schema, EQUIPMENT_ID)?.exclusiveTests?.required ===
                true
            }
            control={control}
            {...filledTextField}
        />
    );

    const newLoadNameField = (
        <ReactHookFormTextField
            name={EQUIPMENT_NAME}
            label="Name"
            control={control}
            required={
                yup.reach(schema, EQUIPMENT_NAME)?.exclusiveTests?.required ===
                true
            }
            {...filledTextField}
        />
    );

    const newLoadTypeField = (
        <ReactHookFormSelect
            name={EQUIPMENT_TYPE}
            label="Type"
            options={LOAD_TYPES}
            size="small"
            fullWidth
            control={control}
            required={
                yup.reach(schema, EQUIPMENT_TYPE)?.exclusiveTests?.required ===
                true
            }
            {...filledTextField}
        />
    );

    const newActivePowerField = (
        <ReactHookFormFloatNumberTextField
            name={ACTIVE_POWER}
            label="ActivePowerText"
            control={control}
            required={
                yup.reach(schema, ACTIVE_POWER)?.exclusiveTests?.required ===
                true
            }
            adornmentCallback={getAdornmentInputProps(ActivePowerAdornment)}
        />
    );

    const newReactivePowerField = (
        <ReactHookFormFloatNumberTextField
            name={REACTIVE_POWER}
            label="ReactivePowerText"
            control={control}
            required={
                yup.reach(schema, REACTIVE_POWER)?.exclusiveTests?.required ===
                true
            }
            adornmentCallback={getAdornmentInputProps(ReactivePowerAdornment)}
        />
    );

    const connectivityForm = (
        <ConnectivityForm label={'Connectivity'} withPosition={true} />
    );

    const onSubmit = useCallback(
        (load) => {
            createLoad(
                studyUuid,
                currentNodeUuid,
                load[EQUIPMENT_ID],
                sanitizeString(load[EQUIPMENT_NAME]),
                !load[EQUIPMENT_TYPE]
                    ? UNDEFINED_LOAD_TYPE
                    : load[EQUIPMENT_TYPE],
                load[ACTIVE_POWER],
                load[REACTIVE_POWER],
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
        },
        [snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
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
    currentNodeUuid: PropTypes.string,
};

export default LoadCreationDialog;
