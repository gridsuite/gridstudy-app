/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ModificationDialog } from '../../../commons/modificationDialog';
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
    GeneratorModificationDto,
    GeneratorFormInfos,
    GeneratorModificationFormData,
    generatorModificationFormSchema,
    generatorModificationEmptyFormData,
    generatorModificationDtoToForm,
    generatorModificationFormToDto,
    GeneratorModificationForm,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyGenerator } from '../../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils.type';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { WithModificationId } from '../../../../../services/network-modification-types';
import { fetchVoltageLevelEquipments } from '../../../../../services/study/network-map';

interface GeneratorCreationDtoWithId extends GeneratorModificationDto, WithModificationId {}

export type GeneratorModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: GeneratorCreationDtoWithId;
};

export default function GeneratorModificationDialog({
    editData,
    defaultIdValue,
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<GeneratorModificationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [generatorToModify, setGeneratorToModify] = useState<GeneratorFormInfos | null>();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

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

    const getVoltageLevelEquipments = useCallback(
        (voltageLevelId: string) =>
            fetchVoltageLevelEquipments(studyUuid, currentNodeUuid, currentRootNetworkUuid, voltageLevelId, true),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    const formMethods = useFormWithDirtyTracking<DeepNullable<GeneratorModificationFormData>>({
        defaultValues: generatorModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<GeneratorModificationFormData>>(generatorModificationFormSchema),
    });

    const { reset, getValues } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: GeneratorModificationDto) => {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset(generatorModificationDtoToForm(editData));
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
            reset({ ...generatorModificationEmptyFormData, ...customData }, { keepDefaultValues: keepDefaultValues });
        },
        [reset]
    );

    const updatePreviousReactiveCapabilityCurveTable = (action: string, index: number) => {
        setGeneratorToModify((previousValue) => {
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
                    EquipmentType.GENERATOR,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value: GeneratorFormInfos) => {
                        if (value) {
                            const previousReactiveCapabilityCurveTable = value?.reactiveCapabilityCurvePoints;

                            setGeneratorToModify({
                                ...value,
                                reactiveCapabilityCurvePoints: previousReactiveCapabilityCurveTable,
                            });
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    ...(!isUpdate && previousReactiveCapabilityCurveTable
                                        ? {
                                              [FieldConstants.REACTIVE_LIMITS]: {
                                                  ...formValues[FieldConstants.REACTIVE_LIMITS],
                                                  [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                                  [FieldConstants.REACTIVE_CAPABILITY_CURVE_CHOICE]: 'CURVE',
                                                  [FieldConstants.REACTIVE_CAPABILITY_CURVE_TABLE]:
                                                      previousReactiveCapabilityCurveTable,
                                              },
                                          }
                                        : {}),
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
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
                            setGeneratorToModify(null);
                        }
                    });
            } else {
                setValuesAndEmptyOthers();
                setGeneratorToModify(null);
            }
        },
        [studyUuid, currentNode, currentRootNetworkUuid, reset, getValues, setValuesAndEmptyOthers, isUpdate, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (form: GeneratorModificationFormData) => {
            const dto = generatorModificationFormToDto(form, editData, generatorToModify ?? undefined);
            modifyGenerator(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: unknown) => {
                snackWithFallback(snackError, error, { headerId: 'GeneratorModificationError' });
            });
        },
        [editData, generatorToModify, selectedId, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: 2000, // Change to 200 ms when fetchEquipmentInfos occurs in GeneratorModificationForm and right after receiving the editData without waiting
    });

    return (
        <CustomFormProvider
            validationSchema={generatorModificationFormSchema}
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
                PaperProps={{ sx: { height: '75vh' } }}
                titleId="ModifyGenerator"
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
                        equipmentType={EquipmentType.GENERATOR}
                        fillerHeight={17}
                    />
                )}
                {selectedId != null && (
                    <GeneratorModificationForm
                        equipmentId={selectedId}
                        generatorToModify={generatorToModify}
                        updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
                        voltageLevelOptions={voltageLevelOptions}
                        PositionDiagramPane={PositionDiagramPane}
                        fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                        fetchVoltageLevelEquipments={getVoltageLevelEquipments}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
