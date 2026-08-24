/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ModificationDialog } from '../../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../../equipment-id/equipment-id-selector';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchStatus } from '../../../../../../services/utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { modifyVscHvdcLine } from 'services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../../services/study/network';

import {
    CustomFormProvider,
    DeepNullable,
    ExtendedEquipmentType,
    FieldConstants,
    getConcatenatedProperties,
    ReactiveCapabilityCurvePoints,
    REMOVE,
    snackWithFallback,
    useSnackMessage,
    VscHdvLineModificationDto,
    VscHvdcLineForm,
    VscHvdcLineInfo,
    vscHvdcLineModificationDtoToForm,
    vscHvdcLineModificationEmptyFormData,
    VscHvdcLineModificationFormData,
    vscHvdcLineModificationFormSchema,
    vscHvdcLineModificationFormToDto,
} from '@gridsuite/commons-ui';
import { isNodeBuilt } from '../../../../../graph/util/model-functions';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { EquipmentModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import PositionDiagramPane from '../../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import useVoltageLevelsListInfos from '../../../../../../hooks/use-voltage-levels-list-infos';

type VscModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: VscHdvLineModificationDto;
};

export default function VscModificationDialog({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<VscModificationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const [equipmentId, setEquipmentId] = useState<string | null>(defaultIdValue ?? null);
    const [vscToModify, setVscToModify] = useState<VscHvdcLineInfo | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useFormWithDirtyTracking<DeepNullable<VscHvdcLineModificationFormData>>({
        defaultValues: vscHvdcLineModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<VscHvdcLineModificationFormData>>(vscHvdcLineModificationFormSchema),
    });
    const { reset, getValues, setValue } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setEquipmentId(editData.equipmentId);
            }
            reset(vscHvdcLineModificationDtoToForm(editData));
        }
    }, [reset, editData]);

    const clear = useCallback(() => {
        reset(vscHvdcLineModificationEmptyFormData);
    }, [reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string | null) => {
            if (!equipmentId) {
                setVscToModify(null);
                reset(vscHvdcLineModificationEmptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    ExtendedEquipmentType.HVDC_LINE_VSC,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value: any) => {
                        if (value) {
                            // when editing modification form, first render should not trigger this reset
                            // which would empty the form instead of displaying data of existing form

                            const previousReactiveCapabilityCurveTable1 =
                                value.converterStation1?.reactiveCapabilityCurvePoints;
                            if (previousReactiveCapabilityCurveTable1) {
                                setValue(
                                    `${FieldConstants.CONVERTER_STATION_1}.${FieldConstants.REACTIVE_LIMITS}.${FieldConstants.REACTIVE_CAPABILITY_CURVE_TABLE}` as any,
                                    previousReactiveCapabilityCurveTable1
                                );
                            }

                            const previousReactiveCapabilityCurveTable2 =
                                value.converterStation2?.reactiveCapabilityCurvePoints;
                            if (previousReactiveCapabilityCurveTable2) {
                                setValue(
                                    `${FieldConstants.CONVERTER_STATION_2}.${FieldConstants.REACTIVE_LIMITS}.${FieldConstants.REACTIVE_CAPABILITY_CURVE_TABLE}` as any,
                                    previousReactiveCapabilityCurveTable2
                                );
                            }

                            setValue(
                                `${FieldConstants.CONVERTER_STATION_1}.${FieldConstants.REACTIVE_LIMITS}.${FieldConstants.REACTIVE_CAPABILITY_CURVE_CHOICE}` as any,
                                value.converterStation1?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE'
                            );
                            setValue(
                                `${FieldConstants.CONVERTER_STATION_2}.${FieldConstants.REACTIVE_LIMITS}.${FieldConstants.REACTIVE_CAPABILITY_CURVE_CHOICE}` as any,
                                value.converterStation2?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE'
                            );

                            setVscToModify({
                                ...value,
                                converterStation1: {
                                    ...value.converterStation1,
                                    reactiveCapabilityCurveTable: previousReactiveCapabilityCurveTable1,
                                },
                                converterStation2: {
                                    ...value.converterStation2,
                                    reactiveCapabilityCurveTable: previousReactiveCapabilityCurveTable2,
                                },
                            });
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
                                }),
                                {
                                    keepDirty: true,
                                }
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
                            setVscToModify(null);
                        }
                    });
            }
        },
        [currentRootNetworkUuid, studyUuid, currentNode, setValue, reset, getValues, editData?.equipmentId]
    );

    useEffect(() => {
        if (equipmentId) {
            onEquipmentIdChange(equipmentId);
        }
    }, [equipmentId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (lineForm: VscHvdcLineModificationFormData) => {
            const dto = vscHvdcLineModificationFormToDto(lineForm);
            modifyVscHvdcLine(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'HvdcModificationError' });
            });
        },
        [editData?.uuid, studyUuid, currentNodeUuid, snackError]
    );

    const updateConverterStationCapabilityCurveTable = (
        newRccValues: ReactiveCapabilityCurvePoints[] | undefined,
        action: string,
        index: number,
        previousValue: VscHvdcLineInfo | null
    ): any => {
        if (!newRccValues) {
            return previousValue;
        }
        action === REMOVE
            ? newRccValues.splice(index, 1)
            : newRccValues.splice(index, 0, {
                  [FieldConstants.P]: null,
                  [FieldConstants.MIN_Q]: null,
                  [FieldConstants.MAX_Q]: null,
              });
        return {
            ...previousValue,
            reactiveCapabilityCurveTable: newRccValues,
        };
    };

    const updatePreviousReactiveCapabilityCurveTableConverterStation = (
        action: string,
        index: number,
        converterStationName: FieldConstants.CONVERTER_STATION_1 | FieldConstants.CONVERTER_STATION_2
    ) => {
        setVscToModify((previousValue: VscHvdcLineInfo | null) => {
            const newRccValues = previousValue?.[converterStationName]?.reactiveCapabilityCurvePoints;
            return updateConverterStationCapabilityCurveTable(newRccValues, action, index, previousValue);
        });
    };

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

    return (
        <CustomFormProvider
            validationSchema={vscHvdcLineModificationFormSchema}
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
                titleId="ModifyVsc"
                slotProps={{
                    paper: {
                        sx: {
                            height: '95vh', // we want the dialog height to be fixed even when switching tabs
                        },
                    },
                }}
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {equipmentId === null && (
                    <EquipmentIdSelector
                        defaultValue={equipmentId}
                        setSelectedId={setEquipmentId}
                        equipmentType={ExtendedEquipmentType.HVDC_LINE_VSC}
                        fillerHeight={17}
                    />
                )}
                {equipmentId !== null && (
                    <VscHvdcLineForm
                        voltageLevelOptions={voltageLevelOptions}
                        PositionDiagramPane={PositionDiagramPane}
                        fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                        updatePreviousReactiveCapabilityCurveTableConverterStation={
                            updatePreviousReactiveCapabilityCurveTableConverterStation
                        }
                        hvdcLineToModify={vscToModify}
                        isModification
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
