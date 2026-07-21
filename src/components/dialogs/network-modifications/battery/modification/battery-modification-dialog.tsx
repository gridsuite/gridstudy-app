/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    CustomFormProvider,
    EquipmentType,
    getConcatenatedProperties,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
    FieldConstants,
    REMOVE,
    BatteryModificationDto,
    BatteryFormInfos,
    batteryModificationEmptyFormData,
    batteryModificationDtoToForm,
    BatteryModificationFormData,
    batteryModificationFormToDto,
    batteryModificationFormSchema,
    BatteryModificationForm,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyBattery } from '../../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../services/study/network';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { FetchStatus } from '../../../../../services/utils.type';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { WithModificationId } from 'services/network-modification-types';

interface BatteryModificationDtoWithId extends BatteryModificationDto, WithModificationId {}

export type BatteryModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: BatteryModificationDtoWithId;
};

export default function BatteryModificationDialog({
    editData,
    defaultIdValue,
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<BatteryModificationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [batteryToModify, setBatteryToModify] = useState<BatteryFormInfos | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

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

    const formMethods = useFormWithDirtyTracking<DeepNullable<BatteryModificationFormData>>({
        defaultValues: batteryModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<BatteryModificationFormData>>(batteryModificationFormSchema),
    });

    const { reset, getValues } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: BatteryModificationDto) => {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset(batteryModificationDtoToForm(editData));
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    //this method empties the form, and let us pass custom data that we want to set
    const setValuesAndEmptyOthers = useCallback(
        (customData = {}, keepDefaultValues = false) => {
            reset({ ...batteryModificationEmptyFormData, ...customData }, { keepDefaultValues: keepDefaultValues });
        },
        [reset]
    );

    const updatePreviousReactiveCapabilityCurveTable = (action: string, index: number) => {
        setBatteryToModify((previousValue) => {
            if (!previousValue) {
                return null;
            }
            const newRccValues = previousValue?.reactiveCapabilityCurvePoints ?? [];
            if (action === REMOVE) {
                newRccValues.splice(index, 1);
            } else {
                newRccValues.splice(index, 0, {
                    [FieldConstants.P]: null,
                    [FieldConstants.MIN_Q]: null,
                    [FieldConstants.MAX_Q]: null,
                });
            }
            return {
                ...previousValue,
                reactiveCapabilityCurvePoints: newRccValues,
            };
        });
    };

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    EquipmentType.BATTERY,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value: BatteryFormInfos) => {
                        if (value) {
                            const previousReactiveCapabilityCurveTable = value?.reactiveCapabilityCurvePoints;
                            setBatteryToModify({
                                ...value,
                                reactiveCapabilityCurvePoints: previousReactiveCapabilityCurveTable,
                            });
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
                                    ...(!isUpdate && previousReactiveCapabilityCurveTable
                                        ? {
                                              [FieldConstants.REACTIVE_LIMITS]: {
                                                  ...formValues[FieldConstants.REACTIVE_LIMITS],
                                                  [FieldConstants.REACTIVE_CAPABILITY_CURVE_CHOICE]: 'CURVE',
                                                  [FieldConstants.REACTIVE_CAPABILITY_CURVE_TABLE]:
                                                      previousReactiveCapabilityCurveTable,
                                              },
                                          }
                                        : {}),
                                }),

                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                            keepDirty: true,
                        });
                        if (editData?.equipmentId !== equipmentId) {
                            setBatteryToModify(null);
                        }
                    });
            } else {
                setValuesAndEmptyOthers();
                setBatteryToModify(null);
            }
        },
        [
            studyUuid,
            currentNode.id,
            currentRootNetworkUuid,
            reset,
            getValues,
            isUpdate,
            editData?.equipmentId,
            setValuesAndEmptyOthers,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (batteryForm: BatteryModificationFormData) => {
            const dto = batteryModificationFormToDto(batteryForm);
            modifyBattery(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: unknown) => {
                snackWithFallback(snackError, error, { headerId: 'BatteryModificationError' });
            });
        },
        [studyUuid, currentNodeUuid, editData?.uuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: 2000, // Change to 200 ms when fetchEquipmentInfos occurs in BatteryModificationForm and right after receiving the editData without waiting
    });

    return (
        <CustomFormProvider
            validationSchema={batteryModificationFormSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={setValuesAndEmptyOthers}
                onSave={onSubmit}
                maxWidth={'md'}
                slotProps={{ paper: { sx: { height: '75vh' } } }}
                titleId="ModifyBattery"
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
                        equipmentType={EquipmentType.BATTERY}
                        fillerHeight={17}
                    />
                )}
                {selectedId != null && (
                    <BatteryModificationForm
                        equipmentId={selectedId}
                        batteryToModify={batteryToModify}
                        updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
                        voltageLevelOptions={voltageLevelOptions}
                        fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                        PositionDiagramPane={PositionDiagramPane}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
