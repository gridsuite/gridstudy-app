/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    snackWithFallback,
    useSnackMessage,
    VoltageLevelCreationDto,
    VoltageLevelCreationFormData,
    VoltageLevelFormInfos,
    voltageLevelCreationDtoToForm,
    voltageLevelInfosToForm,
    voltageLevelCreationEmptyFormData,
    voltageLevelCreationFormSchema,
    voltageLevelCreationFormToDto,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/commons/use-form-search-copy';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';

import { useIntl } from 'react-intl';
import StudyVoltageLevelCreationForm from './voltage-level-creation-form';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { createVoltageLevel } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import { UUID } from 'node:crypto';
import {
    AttachedSubstationCreationInfo,
    CouplingDeviceInfos,
    SwitchKind,
    VoltageLevelCreationInfo,
} from '../../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';

interface StudyVoltageLevelCreationDto extends VoltageLevelCreationDto {
    uuid?: UUID;
}

interface VoltageLevelCreationDialogProps {
    editData?: StudyVoltageLevelCreationDto;
    currentNode: CurrentTreeNode;
    studyUuid: string;
    currentRootNetworkUuid: UUID;
    isUpdate?: boolean;
    editDataFetchStatus?: string;
    onCreateVoltageLevel?: (data: VoltageLevelCreationInfo) => Promise<string>;
    isAttachmentPointModification?: boolean;
    titleId?: string;
    open?: boolean;
    onClose?: () => void;
}

/**
 * Dialog to create a voltage level in the network
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param onCreateVoltageLevel to create voltage level from other forms,
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */

const VoltageLevelCreationDialog: FC<VoltageLevelCreationDialogProps> = ({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    onCreateVoltageLevel = createVoltageLevel,
    isAttachmentPointModification = false,
    titleId = 'CreateVoltageLevel',
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const intl = useIntl();
    const { snackError, snackWarning } = useSnackMessage();

    const defaultValues = useMemo(() => {
        if (isAttachmentPointModification) {
            return {
                ...voltageLevelCreationEmptyFormData,
                [FieldConstants.ADD_SUBSTATION_CREATION]: true,
                [FieldConstants.HIDE_NOMINAL_VOLTAGE]: true,
                [FieldConstants.HIDE_BUS_BAR_SECTION]: true,
            };
        }
        return voltageLevelCreationEmptyFormData;
    }, [isAttachmentPointModification]);

    const formMethods = useForm<DeepNullable<VoltageLevelCreationFormData>>({
        defaultValues: defaultValues,
        resolver: yupResolver<DeepNullable<VoltageLevelCreationFormData>>(voltageLevelCreationFormSchema),
    });

    const { reset, getValues, trigger, subscribe } = formMethods;

    const applyAttachmentPointOverrides = useCallback(
        (formData: Record<string, any>) => {
            if (isAttachmentPointModification) {
                formData[FieldConstants.HIDE_NOMINAL_VOLTAGE] = true;
                formData[FieldConstants.HIDE_BUS_BAR_SECTION] = true;
                if (!formData[FieldConstants.ADD_SUBSTATION_CREATION]) {
                    formData[FieldConstants.ADD_SUBSTATION_CREATION] = true;
                }
            }
        },
        [isAttachmentPointModification]
    );

    const fromSearchCopyToFormValues = useCallback(
        (voltageLevel: VoltageLevelFormInfos) => {
            const formData = voltageLevelInfosToForm(voltageLevel, intl);
            formData[FieldConstants.EQUIPMENT_ID] += '(1)';
            applyAttachmentPointOverrides(formData);
            reset(formData, { keepDefaultValues: true });

            if (!voltageLevel.isSymmetrical) {
                snackWarning({
                    messageId: 'BusBarSectionsCopyingNotSupported',
                });
            }
        },
        [applyAttachmentPointOverrides, intl, reset, snackWarning]
    );

    const fromEditDataToFormValues = useCallback(
        (editDto: VoltageLevelCreationDto) => {
            const formData = voltageLevelCreationDtoToForm(editDto);
            applyAttachmentPointOverrides(formData);
            reset(formData, { keepDefaultValues: true });
        },
        [applyAttachmentPointOverrides, reset]
    );

    // Supervisor watches to trigger validation for interdependent constraints
    useEffect(() => {
        const unsubscribeHighVoltageLimit = subscribe({
            name: [FieldConstants.HIGH_VOLTAGE_LIMIT],
            formState: {
                values: true,
            },
            callback: ({ isSubmitted }: { isSubmitted?: boolean }) => {
                if (isSubmitted) {
                    trigger(FieldConstants.LOW_VOLTAGE_LIMIT).then();
                }
            },
        });

        const unsubscribeEquipmentId = subscribe({
            name: [FieldConstants.EQUIPMENT_ID],
            formState: {
                values: true,
            },
            callback: () => {
                if (getValues(FieldConstants.SUBSTATION_ID)) {
                    trigger(FieldConstants.SUBSTATION_ID);
                }
                if (getValues(FieldConstants.SUBSTATION_CREATION_ID)) {
                    trigger(FieldConstants.SUBSTATION_CREATION_ID);
                }
            },
        });

        const unsubscribeSubstationIds = subscribe({
            name: [FieldConstants.SUBSTATION_ID, FieldConstants.SUBSTATION_CREATION_ID],
            formState: {
                values: true,
            },
            callback: () => {
                if (getValues(FieldConstants.EQUIPMENT_ID)) {
                    trigger(FieldConstants.EQUIPMENT_ID);
                }
            },
        });

        return () => {
            unsubscribeHighVoltageLimit();
            unsubscribeEquipmentId();
            unsubscribeSubstationIds();
        };
    }, [subscribe, trigger, getValues]);

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EQUIPMENT_TYPES.VOLTAGE_LEVEL);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (voltageLevel: VoltageLevelCreationFormData) => {
            const dto = voltageLevelCreationFormToDto(voltageLevel);
            onCreateVoltageLevel({
                studyUuid: studyUuid as UUID,
                nodeUuid: currentNodeUuid,
                equipmentId: dto.equipmentId,
                equipmentName: dto.equipmentName ?? undefined,
                substationId: dto.substationId,
                substationCreation: dto.substationCreation as AttachedSubstationCreationInfo | null,
                nominalV: dto.nominalV,
                lowVoltageLimit: dto.lowVoltageLimit,
                highVoltageLimit: dto.highVoltageLimit,
                ipMin: dto.ipMin,
                ipMax: dto.ipMax,
                busbarCount: dto.busbarCount,
                sectionCount: dto.sectionCount,
                switchKinds: dto.switchKinds as SwitchKind[],
                couplingDevices: dto.couplingDevices as CouplingDeviceInfos[],
                isUpdate: !!editData,
                modificationUuid: editData?.uuid,
                properties: dto.properties,
            }).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'VoltageLevelCreationError' });
            });
        },
        [onCreateVoltageLevel, studyUuid, currentNodeUuid, editData, snackError]
    );

    const clear = useCallback(() => {
        reset(defaultValues);
    }, [reset, defaultValues]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={voltageLevelCreationFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId={titleId}
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <StudyVoltageLevelCreationForm
                    currentNodeUuid={currentNodeUuid}
                    studyUuid={studyUuid as UUID}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.VOLTAGE_LEVEL}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default VoltageLevelCreationDialog;
