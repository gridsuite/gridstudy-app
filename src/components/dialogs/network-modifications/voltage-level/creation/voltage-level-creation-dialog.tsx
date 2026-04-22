/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    EquipmentType,
    snackWithFallback,
    toModificationProperties,
    useSnackMessage,
    DeepNullable,
    FieldConstants,
    voltageLevelCreationEmptyFormData,
    voltageLevelCreationFormSchema,
    VoltageLevelCreationFormData,
    VoltageLevelCreationDto,
    voltageLevelCreationFormToDto,
    voltageLevelCreationDtoToForm,
    VoltageLevelCreationForm,
    convertInputValue,
    FieldType,
    translateSwitchKinds,
    substationCreationEmptyFormData,
    copyEquipmentPropertiesForCreation,
    VoltageLevelDto,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/commons/use-form-search-copy';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';

import { IntlShape, useIntl } from 'react-intl';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { createVoltageLevel } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import { UUID } from 'node:crypto';
import {
    AttachedSubstationCreationInfo,
    VoltageLevelCreationInfo,
} from '../../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { fetchEquipmentsIds } from 'services/study/network-map';

const voltageLevelDtoToForm = (formInfos: VoltageLevelDto, intl?: IntlShape) => ({
    [FieldConstants.EQUIPMENT_ID]: formInfos?.id,
    [FieldConstants.EQUIPMENT_NAME]: formInfos?.name ?? '',
    [FieldConstants.TOPOLOGY_KIND]: formInfos?.topologyKind ?? null,
    [FieldConstants.SUBSTATION_ID]: formInfos?.substationId ?? null,
    [FieldConstants.NOMINAL_V]: formInfos?.nominalV,
    [FieldConstants.LOW_VOLTAGE_LIMIT]: formInfos?.lowVoltageLimit,
    [FieldConstants.HIGH_VOLTAGE_LIMIT]: formInfos?.highVoltageLimit,
    [FieldConstants.LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: convertInputValue(
        FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
        formInfos?.identifiableShortCircuit?.ipMin ?? null
    ),
    [FieldConstants.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: convertInputValue(
        FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
        formInfos?.identifiableShortCircuit?.ipMax ?? null
    ),
    [FieldConstants.BUS_BAR_COUNT]: formInfos?.busbarCount ?? 1,
    [FieldConstants.SECTION_COUNT]: formInfos?.sectionCount ?? 1,
    [FieldConstants.SWITCHES_BETWEEN_SECTIONS]: translateSwitchKinds(formInfos?.switchKinds, intl),
    [FieldConstants.COUPLING_OMNIBUS]: [],
    [FieldConstants.SWITCH_KINDS]:
        formInfos.switchKinds?.map((switchKind) => ({
            [FieldConstants.SWITCH_KIND]: switchKind,
        })) ?? [],
    [FieldConstants.ADD_SUBSTATION_CREATION]: false,
    [FieldConstants.SUBSTATION_CREATION_ID]: null,
    [FieldConstants.SUBSTATION_NAME]: null,
    [FieldConstants.COUNTRY]: null,
    [FieldConstants.SUBSTATION_CREATION]: substationCreationEmptyFormData,
    [FieldConstants.HIDE_NOMINAL_VOLTAGE]: false,
    [FieldConstants.HIDE_BUS_BAR_SECTION]: false,
    ...copyEquipmentPropertiesForCreation({ properties: formInfos.properties ?? undefined }),
});

interface VoltageLevelCreationEditData extends VoltageLevelCreationDto {
    uuid?: UUID;
}
interface VoltageLevelCreationDialogProps {
    editData?: VoltageLevelCreationEditData;
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
    const [substations, setSubstations] = useState<string[]>([]);

    const defaultValues = useMemo((): VoltageLevelCreationFormData => {
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

    const intl = useIntl();

    const applyAttachmentPointOverrides = useCallback(
        (formData: Record<string, any>) => {
            if (isAttachmentPointModification) {
                formData[FieldConstants.HIDE_NOMINAL_VOLTAGE] = true;
                formData[FieldConstants.HIDE_BUS_BAR_SECTION] = true;
                formData[FieldConstants.ADD_SUBSTATION_CREATION] = true;
            }
        },
        [isAttachmentPointModification]
    );

    const fromSearchCopyToFormValues = useCallback(
        (voltageLevel: VoltageLevelDto) => {
            const formData = voltageLevelDtoToForm(voltageLevel, intl);
            formData[FieldConstants.EQUIPMENT_ID] += '(1)';
            applyAttachmentPointOverrides(formData);
            reset(formData, { keepDefaultValues: true });

            if (!voltageLevel.isSymmetrical) {
                snackWarning({
                    messageId: 'BusBarSectionsCopyingNotSupported',
                });
            }
        },
        [applyAttachmentPointOverrides, reset, snackWarning, intl]
    );

    const fromEditDataToFormValues = useCallback(
        (editDto: VoltageLevelCreationDto) => {
            const formData = voltageLevelCreationDtoToForm(editDto, intl, true);
            applyAttachmentPointOverrides(formData);
            reset(formData, { keepDefaultValues: true });
        },
        [applyAttachmentPointOverrides, intl, reset]
    );

    useEffect(() => {
        if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
            fetchEquipmentsIds(
                studyUuid as UUID,
                currentNodeUuid,
                currentRootNetworkUuid,
                undefined,
                EquipmentType.SUBSTATION,
                true
            ).then((values: string[]) => {
                setSubstations(values.toSorted((a, b) => a.localeCompare(b)));
            });
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    // Supervisor watches to trigger validation for interdependent constraints
    useEffect(() => {
        // Watch HIGH_VOLTAGE_LIMIT changed
        const unsubscribeHighVoltageLimit = subscribe({
            name: [`${FieldConstants.HIGH_VOLTAGE_LIMIT}`],
            formState: {
                values: true,
            },
            callback: ({ isSubmitted }: { isSubmitted?: boolean }) => {
                if (isSubmitted) {
                    trigger(`${FieldConstants.LOW_VOLTAGE_LIMIT}`).then();
                }
            },
        });

        // Watch EQUIPMENT_ID changed
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

        // Watch SUBSTATION_ID or SUBSTATION_CREATION_ID changed
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

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.VOLTAGE_LEVEL);

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
                switchKinds: dto.switchKinds,
                couplingDevices: dto.couplingDevices,
                isUpdate: !!editData,
                modificationUuid: editData?.uuid,
                properties: toModificationProperties(voltageLevel),
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
                PaperProps={{
                    sx: {
                        height: '75vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                {...dialogProps}
            >
                <VoltageLevelCreationForm
                    substationOptions={substations}
                    showDeleteSubstationButton={!isAttachmentPointModification}
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
