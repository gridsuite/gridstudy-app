/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CustomFormProvider, EquipmentType, MODIFICATION_TYPES, useSnackMessage } from '@gridsuite/commons-ui';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    BUS_BAR_COUNT,
    BUS_BAR_SECTIONS,
    BUSBAR_SECTION_ID,
    NEW_SWITCH_STATES,
    SWITCHES_AFTER_SECTIONS,
    SWITCHES_BEFORE_SECTIONS,
} from '../../../../utils/field-constants';
import yup from '../../../../utils/yup-config';
import { FetchStatus } from 'services/utils';
import { EquipmentIdSelector } from 'components/dialogs/equipment-id/equipment-id-selector';
import { CreateVoltageLevelSectionForm } from './create-voltage-level-section-form';
import { BusBarSectionInfos, CreateVoltageLevelSectionDialogSchemaForm } from './voltage-level-section.type';
import { CreateVoltageLevelSectionInfos } from '../../../../../services/network-modification-types';
import { createVoltageLevelSection } from '../../../../../services/study/network-modifications';
import { EQUIPMENT_INFOS_TYPES } from '../../../../utils/equipment-types';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { DeepNullable } from '../../../../utils/ts-utils';

const emptyFormData = {
    [BUS_BAR_COUNT]: null,
    [BUS_BAR_SECTIONS]: 0,
    [SWITCHES_BEFORE_SECTIONS]: null,
    [SWITCHES_AFTER_SECTIONS]: null,
    [NEW_SWITCH_STATES]: false,
    [BUSBAR_SECTION_ID]: null,
};

const formSchema = yup
    .object()
    .shape({
        [BUS_BAR_COUNT]: yup.string().nullable().required(),
        [BUS_BAR_SECTIONS]: yup.number().required(),
        [SWITCHES_BEFORE_SECTIONS]: yup.string().nullable().required(),
        [SWITCHES_AFTER_SECTIONS]: yup.string().nullable().required(),
        [NEW_SWITCH_STATES]: yup.boolean(),
        [BUSBAR_SECTION_ID]: yup.string().nullable().required(),
    })
    .required();

export type VoltageLevelSectionCreationDialogProps = EquipmentModificationDialogProps & {
    editData?: CreateVoltageLevelSectionInfos;
};

export default function CreateVoltageLevelSectionDialog({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    defaultIdValue,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<VoltageLevelSectionCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [busBarSectionInfos, setBusBarSectionInfos] = useState<BusBarSectionInfos[]>();
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const { snackError, snackWarning } = useSnackMessage();
    const formMethods = useForm<DeepNullable<CreateVoltageLevelSectionDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<CreateVoltageLevelSectionDialogSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData?.voltageLevelId) {
            setSelectedId(editData.voltageLevelId);
        }
    }, [editData]);

    const onEquipmentIdChange = useCallback(
        (voltageLevelId: string) => {
            if (voltageLevelId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EquipmentType.VOLTAGE_LEVEL,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    voltageLevelId,
                    true
                )
                    .then((voltageLevel) => {
                        if (voltageLevel) {
                            setBusBarSectionInfos(voltageLevel?.busBarSectionInfos || []);
                            if (!voltageLevel.isRetrievedBusbarSections) {
                                snackWarning({
                                    messageId: 'BusBarSectionsCopyingNotSupported',
                                });
                            }
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, setDataFetchStatus, snackWarning]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const fromEditDataToFormValues = useCallback(
        (editData: CreateVoltageLevelSectionInfos) => {
            if (editData?.voltageLevelId) {
                setSelectedId(editData.voltageLevelId);
            }
            reset({
                [BUS_BAR_COUNT]: editData?.busbarCount?.toString() ?? null,
                [BUS_BAR_SECTIONS]: editData?.sectionCount ?? null,
                [SWITCHES_BEFORE_SECTIONS]: editData?.rightSwitchKind,
                [SWITCHES_AFTER_SECTIONS]: editData?.leftSwitchKind,
                [NEW_SWITCH_STATES]: editData?.newSwitchStates ?? false,
                [BUSBAR_SECTION_ID]: editData?.busbarSectionId ?? null,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

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

    const onSubmit = useCallback(
        (voltageLevelSection: CreateVoltageLevelSectionDialogSchemaForm) => {
            const voltageLevelSectionInfos = {
                type: MODIFICATION_TYPES.CREATE_VOLTAGE_LEVEL_SECTION.type,
                voltageLevelId: selectedId,
                busbarSectionId: voltageLevelSection?.busbarSectionId || '',
                allBusbars: voltageLevelSection?.busbarCount === 'all',
                afterBusbarSectionId: Math.floor(voltageLevelSection?.busbarSections || 0) > 1,
                rightSwitchKind: voltageLevelSection?.switchesBeforeSections || '',
                leftSwitchKind: voltageLevelSection?.switchesAfterSections || '',
                newSwitchStates: voltageLevelSection?.newSwitchStates || false,
                busbarCount: Number(voltageLevelSection?.busbarCount) || 0,
                sectionCount:
                    Math.floor(voltageLevelSection?.busbarSections || 0) < 1
                        ? 1
                        : Math.floor(voltageLevelSection?.busbarSections || 0) + 0.5 || 0,
            } satisfies CreateVoltageLevelSectionInfos;
            createVoltageLevelSection({
                voltageLevelSectionInfos: voltageLevelSectionInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? null,
                isUpdate: !!editData,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelSectionCreationError',
                });
            });
        },
        [selectedId, studyUuid, currentNodeUuid, editData, snackError]
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
                onClear={clear}
                fullWidth
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="CreateVoltageLevelSection"
                open={open}
                keepMounted={true}
                PaperProps={{
                    sx: {
                        height: '75vh',
                    },
                }}
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
                        fillerHeight={17}
                        freeInputAllowed={false}
                        autoSelectEnabled={true}
                        autoHighlightEnabled={true}
                    />
                )}
                {selectedId != null && (
                    <CreateVoltageLevelSectionForm
                        busBarSectionInfos={busBarSectionInfos}
                        voltageLevelId={selectedId}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
