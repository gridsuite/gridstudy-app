/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeepNullable,
    emptyProperties,
    EquipmentType,
    FieldConstants,
    getConcatenatedProperties,
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
    getInjectionActiveReactivePowerEditData,
    getInjectionActiveReactivePowerEmptyFormData,
    getInjectionActiveReactivePowerValidationSchemaProperties,
    getPropertiesFromModification,
    LoadForm,
    LoadFormInfos,
    modificationPropertiesSchema,
    sanitizeString,
    snackWithFallback,
    toModificationProperties,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    ACTIVE_POWER_SETPOINT,
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
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { modifyLoad } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../services/study/network';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { EquipmentModificationDialogProps } from 'components/graph/menus/network-modifications/network-modification-menu.type';
import { LoadModificationInfos, LoadModificationSchemaForm } from './load-modification.type';
import { getSetPointsEmptyFormData, getSetPointsSchema } from 'components/dialogs/set-points/set-points-utils';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
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
    const [loadToModify, setLoadToModify] = useState<LoadFormInfos | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useFormWithDirtyTracking<DeepNullable<LoadModificationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LoadModificationSchemaForm>>(formSchema),
    });

    const { reset, getValues } = formMethods;

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

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
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(load, getValues),
                                }),
                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setLoadToModify(null);
                        }
                    });
            }
        },
        [studyUuid, currentRootNetworkUuid, currentNodeUuid, reset, getValues, editData]
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
                pMeasurementValue: stateEstimationData?.[MEASUREMENT_P]?.[FieldConstants.VALUE],
                pMeasurementValidity: stateEstimationData?.[MEASUREMENT_P]?.[VALIDITY],
                qMeasurementValue: stateEstimationData?.[MEASUREMENT_Q]?.[FieldConstants.VALUE],
                qMeasurementValidity: stateEstimationData?.[MEASUREMENT_Q]?.[VALIDITY],
                properties: toModificationProperties(load) ?? null,
            }).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'LoadModificationError' });
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
                    <LoadForm
                        loadToModify={loadToModify}
                        equipmentId={selectedId}
                        isModification={true}
                        voltageLevelOptions={voltageLevelOptions}
                        PositionDiagramPane={PositionDiagramPane}
                        fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
