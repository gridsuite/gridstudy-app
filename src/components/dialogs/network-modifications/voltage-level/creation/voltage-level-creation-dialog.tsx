/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    FieldType,
    getPropertiesFromModification,
    snackWithFallback,
    useSnackMessage,
    VoltageLevelCreationFormData,
    voltageLevelCreationEmptyFormData,
    voltageLevelCreationFormSchema,
    voltageLevelCreationFormToDto,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/commons/use-form-search-copy';
import { EQUIPMENT_ID } from 'components/utils/field-constants';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';

import StudyVoltageLevelCreationForm from './voltage-level-creation-form';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useIntl } from 'react-intl';
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

interface StudyVoltageLevelCreationFormData extends VoltageLevelCreationFormData {
    uuid?: UUID;
}

interface VoltageLevelCreationDialogProps {
    editData?: StudyVoltageLevelCreationFormData;
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
    const { snackError, snackWarning } = useSnackMessage();

    const defaultValues = useMemo((): StudyVoltageLevelCreationFormData => {
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

    const { reset, setValue, getValues, trigger, subscribe } = formMethods;

    const intl = useIntl();
    const fromExternalDataToFormValues = useCallback(
        (voltageLevel: Record<string, any>, fromCopy = true) => {
            const isSubstationCreation =
                (!fromCopy && voltageLevel.substationCreation?.equipmentId != null) || isAttachmentPointModification;
            const shortCircuitLimits = {
                [FieldConstants.LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: convertInputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    fromCopy ? voltageLevel.identifiableShortCircuit?.ipMin : voltageLevel.ipMin
                ),
                [FieldConstants.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: convertInputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    fromCopy ? voltageLevel.identifiableShortCircuit?.ipMax : voltageLevel.ipMax
                ),
            };
            const switchKinds =
                voltageLevel.switchKinds?.map((switchKind: string) => ({
                    [FieldConstants.SWITCH_KIND]: switchKind,
                })) || [];
            const switchesBetweenSections =
                voltageLevel.switchKinds
                    ?.map((switchKind: string) => intl.formatMessage({ id: switchKind }))
                    .join(' / ') || '';

            // Read from external data using API field names (equipmentId with lowercase d, id, name)
            const equipmentId =
                (voltageLevel[EQUIPMENT_ID] ?? voltageLevel[FieldConstants.ID]) + (fromCopy ? '(1)' : '');
            const equipmentName =
                voltageLevel[FieldConstants.EQUIPMENT_NAME] ?? voltageLevel[FieldConstants.NAME];
            const substationId = isSubstationCreation
                ? null
                : (voltageLevel[FieldConstants.SUBSTATION_ID] ?? null);

            const properties = fromCopy
                ? copyEquipmentPropertiesForCreation(voltageLevel)
                : getPropertiesFromModification(voltageLevel.properties);
            reset(
                {
                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                    [FieldConstants.EQUIPMENT_NAME]: equipmentName,
                    [FieldConstants.TOPOLOGY_KIND]: voltageLevel[FieldConstants.TOPOLOGY_KIND],
                    [FieldConstants.SUBSTATION_ID]: substationId,
                    [FieldConstants.NOMINAL_V]: voltageLevel[FieldConstants.NOMINAL_V],
                    [FieldConstants.LOW_VOLTAGE_LIMIT]: voltageLevel[FieldConstants.LOW_VOLTAGE_LIMIT],
                    [FieldConstants.HIGH_VOLTAGE_LIMIT]: voltageLevel[FieldConstants.HIGH_VOLTAGE_LIMIT],
                    ...shortCircuitLimits,
                    [FieldConstants.BUS_BAR_COUNT]: voltageLevel[FieldConstants.BUS_BAR_COUNT] ?? 1,
                    [FieldConstants.SECTION_COUNT]: voltageLevel[FieldConstants.SECTION_COUNT] ?? 1,
                    [FieldConstants.SWITCHES_BETWEEN_SECTIONS]: switchesBetweenSections,
                    [FieldConstants.COUPLING_OMNIBUS]:
                        voltageLevel.couplingDevices?.map(
                            (device: { busbarSectionId1: string; busbarSectionId2: string }) => ({
                                [FieldConstants.BUS_BAR_SECTION_ID1]: device.busbarSectionId1,
                                [FieldConstants.BUS_BAR_SECTION_ID2]: device.busbarSectionId2,
                            })
                        ) ?? [],
                    [FieldConstants.SWITCH_KINDS]: switchKinds,
                    [FieldConstants.HIDE_NOMINAL_VOLTAGE]: isAttachmentPointModification,
                    [FieldConstants.HIDE_BUS_BAR_SECTION]: isAttachmentPointModification,
                    ...properties,
                },
                { keepDefaultValues: true }
            );
            if (isSubstationCreation) {
                const substationKeys = [
                    [FieldConstants.SUBSTATION_CREATION_ID, voltageLevel.substationCreation?.equipmentId],
                    [FieldConstants.SUBSTATION_NAME, voltageLevel.substationCreation?.equipmentName],
                    [FieldConstants.COUNTRY, voltageLevel.substationCreation?.country],
                ];
                substationKeys.forEach(([key, value]) => {
                    setValue(key, value);
                });
                setValue(
                    `${FieldConstants.SUBSTATION_CREATION}.${FieldConstants.ADDITIONAL_PROPERTIES}`,
                    voltageLevel.substationCreation?.properties
                );
                setValue(FieldConstants.ADD_SUBSTATION_CREATION, true);
            } else {
                setValue(FieldConstants.ADD_SUBSTATION_CREATION, false);
            }
            if (!voltageLevel.isSymmetrical && fromCopy) {
                snackWarning({
                    messageId: 'BusBarSectionsCopyingNotSupported',
                });
            }
        },
        [isAttachmentPointModification, reset, intl, setValue, snackWarning]
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

    const searchCopy = useFormSearchCopy(fromExternalDataToFormValues, EQUIPMENT_TYPES.VOLTAGE_LEVEL);

    useEffect(() => {
        if (editData) {
            fromExternalDataToFormValues(editData, false);
        }
    }, [fromExternalDataToFormValues, editData]);

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
