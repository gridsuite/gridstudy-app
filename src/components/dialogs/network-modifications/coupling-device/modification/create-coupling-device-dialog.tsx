/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BUS_BAR_SECTION_ID1, BUS_BAR_SECTION_ID2 } from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FetchStatus } from '../../../../../services/utils';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { createCouplingDevice } from '../../../../../services/study/network-modifications';
import {
    CustomFormProvider,
    EquipmentType,
    MODIFICATION_TYPES,
    Option,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
} from '@gridsuite/commons-ui';
import yup from '../../../../utils/yup-config';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';
import CreateCouplingDeviceForm from './create-coupling-device-form';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { CreateCouplingDeviceInfos } from '../../../../../services/network-modification-types';
import { CreateCouplingDeviceDialogSchemaForm } from '../coupling-device-dialog.type';

const emptyFormData = {
    [BUS_BAR_SECTION_ID1]: null,
    [BUS_BAR_SECTION_ID2]: null,
};
const formSchema = yup.object().shape({
    [BUS_BAR_SECTION_ID1]: yup.string().nullable().required(),
    [BUS_BAR_SECTION_ID2]: yup
        .string()
        .nullable()
        .required()
        .notOneOf([yup.ref(BUS_BAR_SECTION_ID1), null], 'CreateCouplingDeviceIdenticalBusBar'),
});
export type CreateCouplingDeviceDialogProps = EquipmentModificationDialogProps & {
    editData?: CreateCouplingDeviceInfos;
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

    const formMethods = useForm<DeepNullable<CreateCouplingDeviceDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<CreateCouplingDeviceDialogSchemaForm>>(formSchema),
    });

    const { reset, trigger, getValues, subscribe } = formMethods;

    // Watch BUS_BAR_SECTION_ID1 changed
    useEffect(() => {
        const unsubscribe = subscribe({
            name: [BUS_BAR_SECTION_ID1],
            formState: {
                values: true,
            },
            callback: () => {
                // force trigger validation on BUS_BAR_SECTION_ID2 if it has a value
                if (getValues(BUS_BAR_SECTION_ID2)) {
                    trigger(BUS_BAR_SECTION_ID2);
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
            reset({
                [BUS_BAR_SECTION_ID1]: editData?.couplingDeviceInfos?.busbarSectionId1 ?? '',
                [BUS_BAR_SECTION_ID2]: editData?.couplingDeviceInfos?.busbarSectionId2 ?? '',
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const onSubmit = useCallback(
        (couplingDevice: CreateCouplingDeviceDialogSchemaForm) => {
            const createCouplingDeviceInfos = {
                type: MODIFICATION_TYPES.CREATE_COUPLING_DEVICE.type,
                voltageLevelId: selectedId,
                couplingDeviceInfos: {
                    busbarSectionId1: couplingDevice[BUS_BAR_SECTION_ID1],
                    busbarSectionId2: couplingDevice[BUS_BAR_SECTION_ID2],
                },
            } satisfies CreateCouplingDeviceInfos;
            createCouplingDevice({
                createCouplingDeviceInfos: createCouplingDeviceInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'CreateCouplingDeviceError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError, selectedId]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
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
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, setDataFetchStatus]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

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
                    <CreateCouplingDeviceForm
                        sectionOptions={busOrBusbarSectionOptions}
                        studyUuid={studyUuid}
                        voltageLevelId={selectedId}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
