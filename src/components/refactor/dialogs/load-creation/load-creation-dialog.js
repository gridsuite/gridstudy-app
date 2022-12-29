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
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ReactHookFormSelect from '../../inputs/select-field/react-hook-form-select';
import { ConnectivityForm } from '../connectivity/connectivity-form';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import ReactHookFormFloatNumberTextField from '../../inputs/text-field/react-hook-form-float-number-text-field';
import { InputAdornment } from '@mui/material';
import {
    getAdornmentInputProps,
    getClearAdornmentInputProps,
} from '../../inputs/utils';
import { ReactiveCapabilityCurveTable } from '../reactive-capability-curve-reactive-range/reactive-capability-curve-table';

/**
 * Dialog to create a load in the network
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const EQUIPMENT_ID_FIELD = 'equipmentId';
const EQUIPMENT_NAME_FIELD = 'equipmentName';
const EQUIPMENT_TYPE_FIELD = 'loadType';
const ACTIVE_POWER_FIELD = 'activePower';
const REACTIVE_POWER_FIELD = 'reactivePower';

const emptyFormData = {
    [EQUIPMENT_ID_FIELD]: '',
    [EQUIPMENT_NAME_FIELD]: '',
    [EQUIPMENT_TYPE_FIELD]: '',
    [ACTIVE_POWER_FIELD]: 0,
    [REACTIVE_POWER_FIELD]: 0,
    reactiveCapabilityCurvePoints: [
        { p: 0, qminP: 0, qmaxP: 0 },
        { p: 0, qminP: 0, qmaxP: 0 },
    ],
    ...getConnectivityEmptyFormData(),
};

const LoadCreationDialog = ({ editData, currentNodeUuid, ...dialogProps }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const equipmentPath = 'loads';

    yup.setLocale({
        mixed: {
            required: 'FieldIsRequired',
        },
    });

    yup.addMethod(yup.array, 'pBetweenMinMax', function (errorMessage) {
        return this.test(`p-value`, errorMessage, function (items) {
            const { path, createError } = this;
            const errors = items
                .map((item, index) => {
                    if (
                        parseInt(item.p) >= parseInt(items[0].p) &&
                        parseInt(item.p) <= parseInt(items[items.length - 1].p)
                    ) {
                        return null;
                    }

                    return new yup.ValidationError(
                        `P${index} value should be between pMin and pMax`,
                        item.p,
                        `${path}[${index}].p`
                    );
                })
                .filter(Boolean);

            return (
                errors.length === 0 || createError({ message: () => errors })
            );
        });
    });

    const schema = yup
        .object()
        .shape({
            [EQUIPMENT_ID_FIELD]: yup.string().required(),
            [EQUIPMENT_NAME_FIELD]: yup.string(),
            [EQUIPMENT_TYPE_FIELD]: yup.string(),
            [ACTIVE_POWER_FIELD]: yup.number().required().min(0),
            [REACTIVE_POWER_FIELD]: yup.number().required().min(0),
            reactiveCapabilityCurvePoints: yup
                .array()
                .pBetweenMinMax()
                .of(
                    yup.object().shape({
                        p: yup.string().required(),
                        qminP: yup.string().required(),
                        qmaxP: yup.string(),
                    })
                ),
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
        formState: { isDirty, errors },
    } = methods;

    console.log('ERRRRORS ', errors);
    const fromSearchCopyToFormValues = (load) => {
        fetchEquipmentInfos(
            studyUuid,
            currentNodeUuid,
            'voltage-levels',
            load.voltageLevelId,
            true
        ).then((vlResult) => {
            reset({
                [EQUIPMENT_ID_FIELD]: load.id + '(1)',
                [EQUIPMENT_NAME_FIELD]: load.name ?? '',
                [EQUIPMENT_TYPE_FIELD]: load.type,
                [ACTIVE_POWER_FIELD]: load.p0,
                [REACTIVE_POWER_FIELD]: load.q0,
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
                    [EQUIPMENT_ID_FIELD]: load.equipmentId,
                    [EQUIPMENT_NAME_FIELD]: load.equipmentName ?? '',
                    [EQUIPMENT_TYPE_FIELD]: load.loadType,
                    [ACTIVE_POWER_FIELD]: load.activePower,
                    [REACTIVE_POWER_FIELD]: load.reactivePower,
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
            name={EQUIPMENT_ID_FIELD}
            label="ID"
            required={
                yup.reach(schema, EQUIPMENT_ID_FIELD)?.exclusiveTests
                    ?.required === true
            }
            control={control}
            {...filledTextField}
        />
    );

    const newLoadNameField = (
        <ReactHookFormTextField
            name={EQUIPMENT_NAME_FIELD}
            label="Name"
            control={control}
            required={
                yup.reach(schema, EQUIPMENT_NAME_FIELD)?.exclusiveTests
                    ?.required === true
            }
            {...filledTextField}
        />
    );

    const newLoadTypeField = (
        <ReactHookFormSelect
            name={EQUIPMENT_TYPE_FIELD}
            label="Type"
            options={LOAD_TYPES}
            size="small"
            fullWidth
            control={control}
            required={
                yup.reach(schema, EQUIPMENT_TYPE_FIELD)?.exclusiveTests
                    ?.required === true
            }
            {...filledTextField}
        />
    );

    const newActivePowerField = (
        <ReactHookFormFloatNumberTextField
            name={ACTIVE_POWER_FIELD}
            label="ActivePowerText"
            control={control}
            required={
                yup.reach(schema, ACTIVE_POWER_FIELD)?.exclusiveTests
                    ?.required === true
            }
            adornmentCallback={getAdornmentInputProps(ActivePowerAdornment)}
        />
    );

    const newReactivePowerField = (
        <ReactHookFormFloatNumberTextField
            name={REACTIVE_POWER_FIELD}
            label="ReactivePowerText"
            control={control}
            required={
                yup.reach(schema, REACTIVE_POWER_FIELD)?.exclusiveTests
                    ?.required === true
            }
            adornmentCallback={getClearAdornmentInputProps({ position: 'end' })}
        />
    );

    const connectivityForm = (
        <ConnectivityForm label={'Connectivity'} withPosition={true} />
    );

    const onSubmit = (load) => {
        console.log('RESULT ', load);
        // createLoad(
        //     studyUuid,
        //     currentNodeUuid,
        //     load[EQUIPMENT_ID_FIELD],
        //     sanitizeString(load[EQUIPMENT_NAME_FIELD]),
        //     !load[EQUIPMENT_TYPE_FIELD]
        //         ? UNDEFINED_LOAD_TYPE
        //         : load[EQUIPMENT_TYPE_FIELD],
        //     load[ACTIVE_POWER_FIELD],
        //     load[REACTIVE_POWER_FIELD],
        //     load.connectivity.voltageLevel.id,
        //     load.connectivity.busOrBusbarSection.id,
        //     editData ? true : false,
        //     editData ? editData.uuid : undefined,
        //     load.connectivity?.connectionDirection ??
        //         UNDEFINED_CONNECTION_DIRECTION,
        //     load.connectivity?.connectionName ?? null,
        //     load.connectivity?.connectionPosition ?? null
        // ).catch((error) => {
        //     snackError({
        //         messageTxt: error.message,
        //         headerId: 'LoadCreationError',
        //     });
        // });
    };

    const clear = () => {
        reset(emptyFormData);
    };

    /***TEST */
    const headerIds = [
        'ActivePowerText',
        'MinimumReactivePower',
        'MaximumReactivePower',
    ];

    /***END TEST */
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
                <GridSection title="Testing" />
                <Grid container spacing={2}>
                    <ReactiveCapabilityCurveTable tableHeadersIds={headerIds} />
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
