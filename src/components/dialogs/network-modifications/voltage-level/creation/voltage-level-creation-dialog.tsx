/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    convertOutputValue,
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    CustomFormProvider,
    DeepNullable,
    emptyProperties,
    EquipmentType,
    FieldConstants,
    FieldType,
    getPropertiesFromModification,
    MODIFICATION_TYPES,
    Properties,
    Property,
    sanitizeString,
    snackWithFallback,
    SwitchKindFormData,
    toModificationProperties,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/commons/use-form-search-copy';
import { EQUIPMENT_ID } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
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
    SwitchKind,
    VoltageLevelCreationInfo,
} from '../../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { CreateCouplingDeviceDialogSchemaForm } from '../../coupling-device/coupling-device-dialog.type';

interface StudyVoltageLevelCreationFormData {
    [FieldConstants.ADDITIONAL_PROPERTIES]?: Property[];
    [FieldConstants.ADD_SUBSTATION_CREATION]: boolean;
    [FieldConstants.BUS_BAR_COUNT]: number;
    [FieldConstants.COUNTRY]: string | null;
    [FieldConstants.COUPLING_OMNIBUS]: CreateCouplingDeviceDialogSchemaForm[];
    [FieldConstants.EQUIPMENT_ID]: string;
    [FieldConstants.EQUIPMENT_NAME]: string;
    [FieldConstants.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: number | null;
    [FieldConstants.HIGH_VOLTAGE_LIMIT]: number | null;
    [FieldConstants.IS_ATTACHMENT_POINT_CREATION]: boolean;
    [FieldConstants.LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: number | null;
    [FieldConstants.LOW_VOLTAGE_LIMIT]: number | null;
    [FieldConstants.NOMINAL_V]: number | null;
    [FieldConstants.SECTION_COUNT]: number;
    [FieldConstants.SUBSTATION_CREATION]: Properties;
    [FieldConstants.SUBSTATION_CREATION_ID]: string | null;
    [FieldConstants.SUBSTATION_ID]: string | null;
    [FieldConstants.SUBSTATION_NAME]: string | null;
    [FieldConstants.SWITCHES_BETWEEN_SECTIONS]: string;
    [FieldConstants.SWITCH_KINDS]: SwitchKindFormData[];
    [FieldConstants.TOPOLOGY_KIND]: string | null;
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

const emptyFormData: StudyVoltageLevelCreationFormData = {
    [FieldConstants.EQUIPMENT_ID]: '',
    [FieldConstants.EQUIPMENT_NAME]: '',
    [FieldConstants.SUBSTATION_ID]: null,
    [FieldConstants.NOMINAL_V]: null,
    [FieldConstants.LOW_VOLTAGE_LIMIT]: null,
    [FieldConstants.HIGH_VOLTAGE_LIMIT]: null,
    [FieldConstants.LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    [FieldConstants.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    [FieldConstants.BUS_BAR_COUNT]: 1,
    [FieldConstants.SECTION_COUNT]: 1,
    [FieldConstants.SWITCHES_BETWEEN_SECTIONS]: '',
    [FieldConstants.COUPLING_OMNIBUS]: [],
    [FieldConstants.SWITCH_KINDS]: [],
    [FieldConstants.ADD_SUBSTATION_CREATION]: false,
    [FieldConstants.SUBSTATION_CREATION_ID]: null,
    [FieldConstants.SUBSTATION_NAME]: null,
    [FieldConstants.COUNTRY]: null,
    [FieldConstants.IS_ATTACHMENT_POINT_CREATION]: false,
    [FieldConstants.TOPOLOGY_KIND]: null,
    [FieldConstants.SUBSTATION_CREATION]: emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [FieldConstants.EQUIPMENT_ID]: yup
            .string()
            .required()
            .when([FieldConstants.ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation: boolean) => !addSubstationCreation,
                then: (schema) =>
                    schema.notOneOf(
                        [yup.ref(FieldConstants.SUBSTATION_ID), null],
                        'CreateSubstationInVoltageLevelIdenticalId'
                    ),
            })
            .when([FieldConstants.ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation: boolean) => addSubstationCreation,
                then: (schema) =>
                    schema.notOneOf(
                        [yup.ref(FieldConstants.SUBSTATION_CREATION_ID), null],
                        'CreateSubstationInVoltageLevelIdenticalId'
                    ),
            }),
        [FieldConstants.EQUIPMENT_NAME]: yup.string().nullable(),
        [FieldConstants.ADD_SUBSTATION_CREATION]: yup.boolean().required(),
        [FieldConstants.SUBSTATION_ID]: yup
            .string()
            .nullable()
            .when([FieldConstants.ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation: boolean) => !addSubstationCreation,
                then: (schema) =>
                    schema
                        .required()
                        .notOneOf(
                            [yup.ref(FieldConstants.EQUIPMENT_ID), null],
                            'CreateSubstationInVoltageLevelIdenticalId'
                        ),
            }),
        [FieldConstants.SUBSTATION_CREATION_ID]: yup
            .string()
            .nullable()
            .when([FieldConstants.ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation: boolean) => addSubstationCreation,
                then: (schema) =>
                    schema
                        .required()
                        .notOneOf(
                            [yup.ref(FieldConstants.EQUIPMENT_ID), null],
                            'CreateSubstationInVoltageLevelIdenticalId'
                        ),
            }),
        [FieldConstants.SUBSTATION_NAME]: yup.string().nullable(),
        [FieldConstants.COUNTRY]: yup.string().nullable(),
        [FieldConstants.SUBSTATION_CREATION]: creationPropertiesSchema,
        [FieldConstants.NOMINAL_V]: yup
            .number()
            .nullable()
            .when([FieldConstants.IS_ATTACHMENT_POINT_CREATION], {
                is: (isAttachmentPointCreation: boolean) => !isAttachmentPointCreation,
                then: (schema) => schema.min(0, 'mustBeGreaterOrEqualToZero').required(),
            }),
        [FieldConstants.LOW_VOLTAGE_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'mustBeGreaterOrEqualToZero')
            .max(yup.ref(FieldConstants.HIGH_VOLTAGE_LIMIT), 'voltageLevelNominalVoltageMaxValueError'),
        [FieldConstants.HIGH_VOLTAGE_LIMIT]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
        [FieldConstants.LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'ShortCircuitCurrentLimitMustBeGreaterOrEqualToZero')
            .max(yup.ref(FieldConstants.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT), 'ShortCircuitCurrentLimitMinMaxError'),
        [FieldConstants.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'ShortCircuitCurrentLimitMustBeGreaterOrEqualToZero')
            .when([FieldConstants.LOW_SHORT_CIRCUIT_CURRENT_LIMIT], {
                is: (lowShortCircuitCurrentLimit: number | null) => lowShortCircuitCurrentLimit != null,
                then: (schema) => schema.required(),
            }),
        [FieldConstants.BUS_BAR_COUNT]: yup
            .number()
            .nullable()
            .when([FieldConstants.IS_ATTACHMENT_POINT_CREATION], {
                is: (isAttachmentPointCreation: boolean) => !isAttachmentPointCreation,
                then: (schema) => schema.min(1, 'BusBarCountMustBeGreaterThanOrEqualToOne').required(),
            }),
        [FieldConstants.SECTION_COUNT]: yup
            .number()
            .nullable()
            .when([FieldConstants.IS_ATTACHMENT_POINT_CREATION], {
                is: (isAttachmentPointCreation: boolean) => !isAttachmentPointCreation,
                then: (schema) => schema.min(1, 'SectionCountMustBeGreaterThanOrEqualToOne').required(),
            }),
        [FieldConstants.SWITCHES_BETWEEN_SECTIONS]: yup
            .string()
            .nullable()
            .when([FieldConstants.SECTION_COUNT], {
                is: (sectionCount: number) => sectionCount > 1,
                then: (schema) => schema.required(),
            }),
        [FieldConstants.SWITCH_KINDS]: yup.array().of(
            yup.object().shape({
                [FieldConstants.SWITCH_KIND]: yup.string().required(),
            })
        ),
        [FieldConstants.IS_ATTACHMENT_POINT_CREATION]: yup.boolean().required(),
        [FieldConstants.TOPOLOGY_KIND]: yup.string().nullable(),
        [FieldConstants.COUPLING_OMNIBUS]: yup.array().of(
            yup.object().shape({
                [FieldConstants.BUS_BAR_SECTION_ID1]: yup.string().nullable().required(),
                [FieldConstants.BUS_BAR_SECTION_ID2]: yup
                    .string()
                    .nullable()
                    .required()
                    .notOneOf(
                        [yup.ref(FieldConstants.BUS_BAR_SECTION_ID1), null],
                        'CreateCouplingDeviceIdenticalBusBar'
                    ),
            })
        ),
    })
    .concat(creationPropertiesSchema);

type VoltageLevelFormInfos = yup.InferType<typeof formSchema>;

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
                ...emptyFormData,
                [FieldConstants.ADD_SUBSTATION_CREATION]: true,
                [FieldConstants.IS_ATTACHMENT_POINT_CREATION]: true,
            };
        } else {
            return emptyFormData;
        }
    }, [isAttachmentPointModification]);

    const formMethods = useForm<DeepNullable<VoltageLevelFormInfos>>({
        defaultValues: defaultValues,
        resolver: yupResolver<DeepNullable<VoltageLevelFormInfos>>(formSchema),
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
            const switchKinds: SwitchKindFormData[] =
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
                    [FieldConstants.COUPLING_OMNIBUS]: voltageLevel.couplingDevices ?? [],
                    [FieldConstants.SWITCH_KINDS]: switchKinds,
                    [FieldConstants.IS_ATTACHMENT_POINT_CREATION]: isAttachmentPointModification,
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
        (voltageLevel: StudyVoltageLevelCreationFormData) => {
            const substationCreation: AttachedSubstationCreationInfo | null = getValues(
                FieldConstants.ADD_SUBSTATION_CREATION
            )
                ? {
                      type: MODIFICATION_TYPES.SUBSTATION_CREATION.type,
                      equipmentId: voltageLevel[FieldConstants.SUBSTATION_CREATION_ID],
                      equipmentName: voltageLevel[FieldConstants.SUBSTATION_NAME],
                      country: voltageLevel[FieldConstants.COUNTRY],
                      properties: toModificationProperties(voltageLevel[FieldConstants.SUBSTATION_CREATION]),
                  }
                : null;
            onCreateVoltageLevel({
                studyUuid: studyUuid as UUID,
                nodeUuid: currentNodeUuid,
                equipmentId: voltageLevel[FieldConstants.EQUIPMENT_ID],
                equipmentName: sanitizeString(voltageLevel[FieldConstants.EQUIPMENT_NAME]) ?? undefined,
                substationId: substationCreation === null ? voltageLevel[FieldConstants.SUBSTATION_ID] : null,
                substationCreation: substationCreation,
                nominalV: voltageLevel[FieldConstants.NOMINAL_V],
                lowVoltageLimit: voltageLevel[FieldConstants.LOW_VOLTAGE_LIMIT],
                highVoltageLimit: voltageLevel[FieldConstants.HIGH_VOLTAGE_LIMIT],
                ipMin: convertOutputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    voltageLevel[FieldConstants.LOW_SHORT_CIRCUIT_CURRENT_LIMIT]
                ),
                ipMax: convertOutputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    voltageLevel[FieldConstants.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]
                ),
                busbarCount: voltageLevel[FieldConstants.BUS_BAR_COUNT],
                sectionCount: voltageLevel[FieldConstants.SECTION_COUNT],
                switchKinds: voltageLevel[FieldConstants.SWITCH_KINDS].map((e) => {
                    return e.switchKind as SwitchKind;
                }),
                couplingDevices: voltageLevel[FieldConstants.COUPLING_OMNIBUS],
                isUpdate: !!editData,
                modificationUuid: editData?.uuid,
                properties: toModificationProperties(voltageLevel),
            }).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'VoltageLevelCreationError' });
            });
        },
        [getValues, onCreateVoltageLevel, studyUuid, currentNodeUuid, editData, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
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
