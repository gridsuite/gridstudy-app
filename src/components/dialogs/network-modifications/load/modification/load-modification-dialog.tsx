/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, EquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_NAME,
    ID,
    LOAD_TYPE,
    MEASUREMENT_P,
    MEASUREMENT_Q,
    REACTIVE_POWER_SET_POINT,
    STATE_ESTIMATION,
    VALIDITY,
    VALUE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialog-utils';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { modifyLoad } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import {
    getInjectionActiveReactivePowerEditData,
    getInjectionActiveReactivePowerEmptyFormData,
    getInjectionActiveReactivePowerValidationSchemaProperties,
} from '../../common/measurements/injection-active-reactive-power-form-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { LoadDialogTab } from '../common/load-utils';
import { EquipmentModificationDialogProps } from 'components/graph/menus/network-modifications/network-modification-menu.type';
import { LoadModificationInfos, LoadModificationSchemaForm } from './load-modification.type';
import LoadDialogHeader from '../common/load-dialog-header';
import LoadDialogTabsContent from '../common/load-dialog-tabs-content';
import { LoadFormInfos } from '../common/load.type';
import { DeepNullable } from 'components/utils/ts-utils';
import { getSetPointsEmptyFormData, getSetPointsSchema } from 'components/dialogs/set-points/set-points-utils';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [LOAD_TYPE]: null,
    ...getSetPointsEmptyFormData(true),
    ...getConnectivityWithPositionEmptyFormData(true),
    ...getInjectionActiveReactivePowerEmptyFormData(STATE_ESTIMATION),
    ...emptyProperties,
};

const formSchema: yup.ObjectSchema<DeepNullable<LoadModificationSchemaForm>> = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [LOAD_TYPE]: yup.string().nullable(),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(true),
        [STATE_ESTIMATION]: getInjectionActiveReactivePowerValidationSchemaProperties(),
        ...getSetPointsSchema(true),
    })
    .concat(modificationPropertiesSchema)
    .required();

export type LoadModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: LoadModificationInfos;
};

export default function LoadModificationDialog({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: LoadModificationDialogProps) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string | null>(defaultIdValue ?? null);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const [tabIndex, setTabIndex] = useState<number>(LoadDialogTab.CONNECTIVITY_TAB);
    const [loadToModify, setLoadToModify] = useState<LoadFormInfos | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<LoadModificationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LoadModificationSchemaForm>>(formSchema),
    });

    const {
        reset,
        getValues,
        formState: { isDirty },
    } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (load: LoadModificationInfos) => {
            if (load?.equipmentId) {
                setSelectedId(load.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: load.equipmentName?.value ?? '',
                [LOAD_TYPE]: load.loadType?.value ?? null,
                [ACTIVE_POWER_SETPOINT]: load.p0?.value ?? null,
                [REACTIVE_POWER_SET_POINT]: load.q0?.value ?? null,
                ...getConnectivityFormData({
                    voltageLevelId: load?.voltageLevelId?.value ?? null,
                    busbarSectionId: load?.busOrBusbarSectionId?.value ?? null,
                    connectionName: load?.connectionName?.value ?? '',
                    connectionDirection: load?.connectionDirection?.value ?? null,
                    connectionPosition: load?.connectionPosition?.value ?? null,
                    terminalConnected: load?.terminalConnected?.value ?? null,
                    isEquipmentModification: true,
                }),
                ...getInjectionActiveReactivePowerEditData(STATE_ESTIMATION, load),
                ...(getPropertiesFromModification(load.properties) ?? undefined),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (!equipmentId) {
                setLoadToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EquipmentType.LOAD,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((load: LoadFormInfos) => {
                        if (load) {
                            setLoadToModify(load);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(load, getValues),
                                }),
                                { keepDefaultValues: isDirty }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setLoadToModify(null);
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [reset, studyUuid, currentNodeUuid, currentRootNetworkUuid, isDirty, getValues, editData?.equipmentId]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (load: LoadModificationSchemaForm) => {
            const stateEstimationData = load[STATE_ESTIMATION];
            modifyLoad({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                id: selectedId,
                name: sanitizeString(load?.equipmentName),
                loadType: load?.loadType,
                p0: load?.activePowerSetpoint,
                q0: load?.reactivePowerSetpoint,
                voltageLevelId: load[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                busOrBusbarSectionId: load[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                connectionName: sanitizeString(load[CONNECTIVITY]?.[CONNECTION_NAME]),
                connectionDirection: load[CONNECTIVITY]?.[CONNECTION_DIRECTION],
                connectionPosition: load[CONNECTIVITY]?.[CONNECTION_POSITION],
                terminalConnected: load[CONNECTIVITY]?.[CONNECTED],
                pMeasurementValue: stateEstimationData?.[MEASUREMENT_P]?.[VALUE],
                pMeasurementValidity: stateEstimationData?.[MEASUREMENT_P]?.[VALIDITY],
                qMeasurementValue: stateEstimationData?.[MEASUREMENT_Q]?.[VALUE],
                qMeasurementValidity: stateEstimationData?.[MEASUREMENT_Q]?.[VALIDITY],
                properties: toModificationProperties(load) ?? null,
            }).catch((error: Error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadModificationError',
                });
            });
        },
        [selectedId, editData, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onValidationError = (errors: FieldErrors) => {
        let tabsInError: number[] = [];
        if (
            errors?.[ACTIVE_POWER_SETPOINT] !== undefined ||
            errors?.[REACTIVE_POWER_SET_POINT] !== undefined ||
            errors?.[ADDITIONAL_PROPERTIES] !== undefined
        ) {
            tabsInError.push(LoadDialogTab.CHARACTERISTICS_TAB);
        }
        if (errors?.[CONNECTIVITY] !== undefined) {
            tabsInError.push(LoadDialogTab.CONNECTIVITY_TAB);
        }
        if (errors?.[STATE_ESTIMATION] !== undefined) {
            tabsInError.push(LoadDialogTab.STATE_ESTIMATION_TAB);
        }
        if (tabsInError.length > 0) {
            setTabIndex(tabsInError[0]);
        }
        setTabIndexesWithError(tabsInError);
    };

    const headerAndTabs = (
        <LoadDialogHeader
            loadToModify={loadToModify}
            tabIndexesWithError={tabIndexesWithError}
            tabIndex={tabIndex}
            setTabIndex={setTabIndex}
            equipmentId={selectedId}
            isModification={true}
        />
    );

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                onValidationError={onValidationError}
                subtitle={selectedId != null ? headerAndTabs : undefined}
                maxWidth={'md'}
                titleId="ModifyLoad"
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.LOAD}
                        fillerHeight={2}
                    />
                )}
                {selectedId != null && (
                    <LoadDialogTabsContent
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        loadToModify={loadToModify}
                        tabIndex={tabIndex}
                        voltageLevelOptions={voltageLevelOptions}
                        isModification={true}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
