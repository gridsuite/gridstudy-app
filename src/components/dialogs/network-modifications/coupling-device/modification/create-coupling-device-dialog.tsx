/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { createCouplingDevice } from '../../../../../services/study/network-modifications';
import {
    CouplingDeviceCreationDto,
    couplingDeviceCreationDtoToForm,
    CouplingDeviceCreationForm,
    CouplingDeviceCreationFormData,
    couplingDeviceCreationFormSchema,
    couplingDeviceCreationFormToDto,
    CustomFormProvider,
    DeepNullable,
    emptyCouplingDeviceCreationFormData,
    EquipmentType,
    FieldConstants,
    Option,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { useForm } from 'react-hook-form';

export type CreateCouplingDeviceDialogProps = EquipmentModificationDialogProps & {
    editData?: CouplingDeviceCreationDto;
};
export default function CreateCouplingDeviceDialog({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<CreateCouplingDeviceDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState<Option[]>([]);

    const formMethods = useForm<DeepNullable<CouplingDeviceCreationFormData>>({
        defaultValues: emptyCouplingDeviceCreationFormData,
        resolver: yupResolver<DeepNullable<CouplingDeviceCreationFormData>>(couplingDeviceCreationFormSchema),
    });

    const { reset, trigger, getValues, subscribe } = formMethods;

    // Watch BUS_BAR_SECTION_ID1 changed
    useEffect(() => {
        const unsubscribe = subscribe({
            name: [FieldConstants.BUS_BAR_SECTION_ID1],
            formState: {
                values: true,
            },
            callback: () => {
                // force trigger validation on BUS_BAR_SECTION_ID2 if it has a value
                if (getValues(FieldConstants.BUS_BAR_SECTION_ID2)) {
                    trigger(FieldConstants.BUS_BAR_SECTION_ID2);
                }
            },
        });
        return () => unsubscribe();
    }, [subscribe, trigger, getValues]);

    useEffect(() => {
        if (editData) {
            if (editData?.voltageLevelId) {
                setSelectedId(editData.voltageLevelId);
            }
            reset(couplingDeviceCreationDtoToForm(editData));
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyCouplingDeviceCreationFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const onSubmit = useCallback(
        (formData: CouplingDeviceCreationFormData) => {
            createCouplingDevice({
                couplingDeviceCreationDto: couplingDeviceCreationFormToDto(formData),
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'CreateCouplingDeviceError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                reset((formValues) => ({
                    ...formValues,
                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                }));
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchBusesOrBusbarSectionsForVoltageLevel(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    equipmentId
                )
                    .then((busesOrbusbarSections) => {
                        setBusOrBusbarSectionOptions(
                            busesOrbusbarSections?.map((busesOrbusbarSection) => busesOrbusbarSection.id) || []
                        );
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setBusOrBusbarSectionOptions([]);
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, reset]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    return (
        <CustomFormProvider
            validationSchema={couplingDeviceCreationFormSchema}
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
                open={open}
                titleId={'CREATE_COUPLING_DEVICE'}
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
                        equipmentType={EquipmentType.VOLTAGE_LEVEL}
                        fillerHeight={4}
                    />
                )}
                {selectedId != null && (
                    <CouplingDeviceCreationForm
                        sectionOptions={busOrBusbarSectionOptions}
                        PositionDiagramPane={PositionDiagramPane}
                        canOpenPositionDiagramPane={isNodeBuilt(currentNode)}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
