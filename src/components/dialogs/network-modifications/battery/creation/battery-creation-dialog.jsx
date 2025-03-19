/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SET_POINT,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FREQUENCY_REGULATION,
    ID,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import BatteryCreationForm from './battery-creation-form';
import { sanitizeString } from '../../../dialog-utils';
import { FORM_LOADING_DELAY, UNDEFINED_CONNECTION_DIRECTION } from 'components/network/constants';
import { getActivePowerSetPointSchema } from '../../../set-points/set-points-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import PropTypes from 'prop-types';
import { createBattery } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';
import {
    getActivePowerControlEmptyFormData,
    getActivePowerControlSchema,
} from '../../../active-power-control/active-power-control-utils';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    ...getActivePowerControlEmptyFormData(),
    ...getReactiveLimitsEmptyFormData(),
    ...getConnectivityWithPositionEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [MINIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [REACTIVE_POWER_SET_POINT]: yup.number().nullable().required(),
        ...getActivePowerSetPointSchema(false),
        ...getReactiveLimitsSchema(),
        ...getConnectivityWithPositionValidationSchema(),
        ...getActivePowerControlSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

const BatteryCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
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
        reset(
            {
                [EQUIPMENT_ID]: battery.id + '(1)',
                [EQUIPMENT_NAME]: battery.name ?? '',
                [MAXIMUM_ACTIVE_POWER]: battery.maxP,
                [MINIMUM_ACTIVE_POWER]: battery.minP,
                [ACTIVE_POWER_SET_POINT]: battery.targetP,
                [REACTIVE_POWER_SET_POINT]: battery.targetQ,
                [FREQUENCY_REGULATION]: battery.activePowerControl?.participate,
                [DROOP]: battery.activePowerControl?.droop,
                ...getConnectivityFormData({
                    voltageLevelId: battery.voltageLevelId,
                    busbarSectionId: battery.busOrBusbarSectionId,
                    connectionDirection: battery.connectablePosition.connectionDirection,
                    connectionName: battery.connectablePosition.connectionName,
                    // connected is not copied on purpose: we use the default value (true) in all cases
                }),
                ...getReactiveLimitsFormData({
                    reactiveCapabilityCurveChoice: battery?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE',
                    minimumReactivePower: battery?.minMaxReactiveLimits?.minQ ?? null,
                    maximumReactivePower: battery?.minMaxReactiveLimits?.maxQ ?? null,
                    reactiveCapabilityCurveTable: battery?.reactiveCapabilityCurvePoints ?? [{}, {}],
                }),
                ...copyEquipmentPropertiesForCreation(battery),
            },
            { keepDefaultValues: true }
        );
    };
    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.BATTERY,
    });

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [MAXIMUM_ACTIVE_POWER]: editData.maxP,
                [MINIMUM_ACTIVE_POWER]: editData.minP,
                [ACTIVE_POWER_SET_POINT]: editData.targetP,
                [REACTIVE_POWER_SET_POINT]: editData.targetQ,
                [FREQUENCY_REGULATION]: editData.participate,
                [DROOP]: editData.droop,
                ...getConnectivityFormData({
                    voltageLevelId: editData.voltageLevelId,
                    busbarSectionId: editData.busOrBusbarSectionId,
                    connectionDirection: editData.connectionDirection,
                    connectionName: editData.connectionName,
                    connectionPosition: editData.connectionPosition,
                    terminalConnected: editData.terminalConnected,
                }),
                ...getReactiveLimitsFormData({
                    reactiveCapabilityCurveChoice: editData?.reactiveCapabilityCurve ? 'CURVE' : 'MINMAX',
                    minimumReactivePower: editData?.minQ,
                    maximumReactivePower: editData?.maxQ,
                    reactiveCapabilityCurveTable: editData?.reactiveCapabilityCurve
                        ? editData?.reactiveCapabilityCurvePoints
                        : [{}, {}],
                }),
                ...getPropertiesFromModification(editData.properties),
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (battery) => {
            const reactiveLimits = battery[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn = reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
            createBattery({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                id: battery[EQUIPMENT_ID],
                name: sanitizeString(battery[EQUIPMENT_NAME]),
                voltageLevelId: battery[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                busOrBusbarSectionId: battery[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                connectionName: sanitizeString(battery[CONNECTIVITY]?.[CONNECTION_NAME]),
                connectionDirection: battery[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionPosition: battery[CONNECTIVITY]?.[CONNECTION_POSITION],
                terminalConnected: battery[CONNECTIVITY]?.[CONNECTED],
                minP: battery[MINIMUM_ACTIVE_POWER],
                maxP: battery[MAXIMUM_ACTIVE_POWER],
                isReactiveCapabilityCurveOn: isReactiveCapabilityCurveOn,
                minQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MINIMUM_REACTIVE_POWER],
                maxQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MAXIMUM_REACTIVE_POWER],
                reactiveCapabilityCurve: isReactiveCapabilityCurveOn
                    ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
                    : null,
                targetP: battery[ACTIVE_POWER_SET_POINT],
                targetQ: battery[REACTIVE_POWER_SET_POINT],
                participate: battery[FREQUENCY_REGULATION],
                droop: battery[DROOP] ?? null,
                isUpdate: !!editData,
                modificationUuid: editData?.uuid ?? null,
                properties: toModificationProperties(battery),
            }).catch((error) => {
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
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-battery"
                maxWidth={'md'}
                titleId="CreateBattery"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <BatteryCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'BATTERY'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

BatteryCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};
export default BatteryCreationDialog;
