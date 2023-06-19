/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    CONNECTION_NAME,
    CONNECTIVITY,
    ID,
    VOLTAGE_LEVEL,
    BUS_OR_BUSBAR_SECTION,
    CONNECTION_DIRECTION,
    CONNECTION_POSITION,
    ACTIVE_POWER_SET_POINT,
    REACTIVE_POWER_SET_POINT,
    ACTIVE_POWER,
    REACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    FREQUENCY_REGULATION,
    DROOP,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
} from 'components/utils/field-constants';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import BatteryCreationForm from './battery-creation-form';
import { createBattery } from 'utils/rest-api';
import { sanitizeString } from '../../../dialogUtils';
import {
    FORM_LOADING_DELAY,
    UNDEFINED_CONNECTION_DIRECTION,
} from 'components/network/constants';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsSchema,
} from '../../generator/reactive-limits/reactive-limits-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FetchStatus } from 'utils/rest-api';
import { getFrequencyRegulationSchema } from '../../generator/set-points/set-points-utils';
import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import PropTypes from 'prop-types';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [ACTIVE_POWER]: null,
    [REACTIVE_POWER]: null,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    [FREQUENCY_REGULATION]: false,
    [DROOP]: null,
    ...getReactiveLimitsEmptyFormData(),
    ...getConnectivityWithPositionEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape(
        {
            [EQUIPMENT_ID]: yup.string().required(),
            [EQUIPMENT_NAME]: yup.string(),
            [MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
            [MINIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
            [ACTIVE_POWER]: yup.number().nullable().required(),
            [REACTIVE_POWER]: yup.number().nullable().required(),
            ...getReactiveLimitsSchema(),
            ...getConnectivityWithPositionValidationSchema(),
            ...getFrequencyRegulationSchema(),
        },
        [MAXIMUM_REACTIVE_POWER, MINIMUM_REACTIVE_POWER]
    )
    .required();

const BatteryCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;
    const fromSearchCopyToFormValues = (battery) => {
        reset({
            [EQUIPMENT_ID]: battery.id + '(1)',
            [EQUIPMENT_NAME]: battery.name ?? '',
            [MAXIMUM_ACTIVE_POWER]: battery.maxP,
            [MINIMUM_ACTIVE_POWER]: battery.minP,
            [ACTIVE_POWER]: battery.p0,
            [REACTIVE_POWER]: battery.q0,
            [FREQUENCY_REGULATION]: battery.participate,
            [DROOP]: battery.droop,
            [MINIMUM_REACTIVE_POWER]:
                battery?.minMaxReactiveLimits?.minimumReactivePower ?? null,
            [MAXIMUM_REACTIVE_POWER]:
                battery?.minMaxReactiveLimits?.maximumReactivePower ?? null,
            ...getConnectivityFormData({
                voltageLevelId: battery.voltageLevelId,
                busbarSectionId: battery.busOrBusbarSectionId,
                connectionDirection: battery.connectionDirection,
                connectionName: battery.connectionName,
            }),
            [REACTIVE_CAPABILITY_CURVE_TABLE]:
                battery.reactiveCapabilityCurvePoints,
            [REACTIVE_CAPABILITY_CURVE_CHOICE]: battery?.minMaxReactiveLimits
                ? 'MINMAX'
                : 'CURVE',
            [REACTIVE_CAPABILITY_CURVE_TABLE]:
                battery?.reactiveCapabilityCurvePoints ?? [{}, {}],
        });
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.BATTERY.type,
    });

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [MAXIMUM_ACTIVE_POWER]: editData.maxActivePower,
                [MINIMUM_ACTIVE_POWER]: editData.minActivePower,
                [ACTIVE_POWER_SET_POINT]: editData.activePowerSetpoint,
                [REACTIVE_POWER_SET_POINT]: editData.reactivePowerSetpoint,
                [FREQUENCY_REGULATION]: editData.participate,
                [DROOP]: editData.droop,
                [MINIMUM_REACTIVE_POWER]: editData?.minimumReactivePower,
                [MAXIMUM_REACTIVE_POWER]: editData?.maximumReactivePower,
                ...getConnectivityFormData({
                    voltageLevelId: editData.voltageLevelId,
                    busbarSectionId: editData.busOrBusbarSectionId,
                    connectionDirection: editData.connectionDirection,
                    connectionName: editData.connectionName,
                    connectionPosition: editData.connectionPosition,
                }),
                [REACTIVE_CAPABILITY_CURVE_CHOICE]:
                    editData?.reactiveCapabilityCurve ? 'CURVE' : 'MINMAX',
                [REACTIVE_CAPABILITY_CURVE_TABLE]:
                    editData?.reactiveCapabilityCurve
                        ? editData?.reactiveCapabilityCurvePoints
                        : [{}, {}],
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (battery) => {
            const isReactiveCapabilityCurveOn =
                battery[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
            createBattery(
                studyUuid,
                currentNodeUuid,
                battery[EQUIPMENT_ID],
                sanitizeString(battery[EQUIPMENT_NAME]),
                battery[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                battery[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                sanitizeString(battery[CONNECTIVITY]?.[CONNECTION_NAME]),
                battery[CONNECTIVITY]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                battery[CONNECTIVITY]?.[CONNECTION_POSITION],
                battery[MINIMUM_ACTIVE_POWER],
                battery[MAXIMUM_ACTIVE_POWER],
                isReactiveCapabilityCurveOn,
                isReactiveCapabilityCurveOn
                    ? null
                    : battery[MINIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? null
                    : battery[MAXIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? battery[REACTIVE_CAPABILITY_CURVE_TABLE]
                    : null,
                battery[ACTIVE_POWER],
                battery[REACTIVE_POWER],
                battery[FREQUENCY_REGULATION],
                battery[DROOP] ?? null,
                !!editData,
                editData?.uuid ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'BatteryCreationError',
                });
            });
        },
        [currentNodeUuid, editData, studyUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-battery"
                maxWidth={'md'}
                titleId="CreateBattery"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <BatteryCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'BATTERY'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

BatteryCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};
export default BatteryCreationDialog;
