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
    emptyProperties,
    EquipmentType,
    FieldType,
    getPropertiesFromModification,
    MODIFICATION_TYPES,
    Properties,
    Property,
    snackWithFallback,
    toModificationProperties,
    useSnackMessage,
    DeepNullable,
    sanitizeString,
    FieldConstants,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/commons/use-form-search-copy';
import {
    ADD_SUBSTATION_CREATION,
    BUS_BAR_COUNT,
    BUS_BAR_SECTION_ID1,
    BUS_BAR_SECTION_ID2,
    COUPLING_OMNIBUS,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    ID,
    IS_ATTACHMENT_POINT_CREATION,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NAME,
    NOMINAL_V,
    SECTION_COUNT,
    SUBSTATION_CREATION,
    SUBSTATION_CREATION_ID,
    SUBSTATION_ID,
    SUBSTATION_NAME,
    SWITCH_KIND,
    SWITCH_KINDS,
    SWITCHES_BETWEEN_SECTIONS,
    TOPOLOGY_KIND,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';

import VoltageLevelCreationForm from './voltage-level-creation-form';
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

export type SwitchKindFormData = { [SWITCH_KIND]: string };

interface VoltageLevelCreationFormData {
    [FieldConstants.ADDITIONAL_PROPERTIES]?: Property[];
    [ADD_SUBSTATION_CREATION]: boolean;
    [BUS_BAR_COUNT]: number;
    [FieldConstants.COUNTRY]: string | null;
    [COUPLING_OMNIBUS]: CreateCouplingDeviceDialogSchemaForm[];
    [FieldConstants.EQUIPMENT_ID]: string;
    [FieldConstants.EQUIPMENT_NAME]: string;
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: number | null;
    [HIGH_VOLTAGE_LIMIT]: number | null;
    [IS_ATTACHMENT_POINT_CREATION]: boolean;
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: number | null;
    [LOW_VOLTAGE_LIMIT]: number | null;
    [NOMINAL_V]: number | null;
    [SECTION_COUNT]: number;
    [SUBSTATION_CREATION]: Properties;
    [SUBSTATION_CREATION_ID]: string | null;
    [SUBSTATION_ID]: string | null;
    [SUBSTATION_NAME]: string | null;
    [SWITCHES_BETWEEN_SECTIONS]: string;
    [SWITCH_KINDS]: SwitchKindFormData[];
    [TOPOLOGY_KIND]: string | null;
    uuid?: UUID;
}

interface VoltageLevelCreationDialogProps {
    editData?: VoltageLevelCreationFormData;
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
 * Dialog to create a load in the network
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param onCreateVoltageLevel to create voltage level from other forms,
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */

const emptyFormData: VoltageLevelCreationFormData = {
    [FieldConstants.EQUIPMENT_ID]: '',
    [FieldConstants.EQUIPMENT_NAME]: '',
    [SUBSTATION_ID]: null,
    [NOMINAL_V]: null,
    [LOW_VOLTAGE_LIMIT]: null,
    [HIGH_VOLTAGE_LIMIT]: null,
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    [BUS_BAR_COUNT]: 1,
    [SECTION_COUNT]: 1,
    [SWITCHES_BETWEEN_SECTIONS]: '',
    [COUPLING_OMNIBUS]: [],
    [SWITCH_KINDS]: [],
    [ADD_SUBSTATION_CREATION]: false,
    [SUBSTATION_CREATION_ID]: null,
    [SUBSTATION_NAME]: null,
    [FieldConstants.COUNTRY]: null,
    [IS_ATTACHMENT_POINT_CREATION]: false,
    [TOPOLOGY_KIND]: null,
    [SUBSTATION_CREATION]: emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [FieldConstants.EQUIPMENT_ID]: yup
            .string()
            .required()
            .when([ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation: boolean) => !addSubstationCreation,
                then: (schema) =>
                    schema.notOneOf([yup.ref(SUBSTATION_ID), null], 'CreateSubstationInVoltageLevelIdenticalId'),
            })
            .when([ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation: boolean) => addSubstationCreation,
                then: (schema) =>
                    schema.notOneOf(
                        [yup.ref(SUBSTATION_CREATION_ID), null],
                        'CreateSubstationInVoltageLevelIdenticalId'
                    ),
            }),
        [FieldConstants.EQUIPMENT_NAME]: yup.string().nullable(),
        [ADD_SUBSTATION_CREATION]: yup.boolean().required(),
        [SUBSTATION_ID]: yup
            .string()
            .nullable()
            .when([ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation: boolean) => !addSubstationCreation,
                then: (schema) =>
                    schema
                        .required()
                        .notOneOf(
                            [yup.ref(FieldConstants.EQUIPMENT_ID), null],
                            'CreateSubstationInVoltageLevelIdenticalId'
                        ),
            }),
        [SUBSTATION_CREATION_ID]: yup
            .string()
            .nullable()
            .when([ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation: boolean) => addSubstationCreation,
                then: (schema) =>
                    schema
                        .required()
                        .notOneOf(
                            [yup.ref(FieldConstants.EQUIPMENT_ID), null],
                            'CreateSubstationInVoltageLevelIdenticalId'
                        ),
            }),
        [SUBSTATION_NAME]: yup.string().nullable(),
        [FieldConstants.COUNTRY]: yup.string().nullable(),
        [SUBSTATION_CREATION]: creationPropertiesSchema,
        [NOMINAL_V]: yup
            .number()
            .nullable()
            .when([IS_ATTACHMENT_POINT_CREATION], {
                is: (isAttachmentPointCreation: boolean) => !isAttachmentPointCreation,
                then: (schema) => schema.min(0, 'mustBeGreaterOrEqualToZero').required(),
            }),
        [LOW_VOLTAGE_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'mustBeGreaterOrEqualToZero')
            .max(yup.ref(HIGH_VOLTAGE_LIMIT), 'voltageLevelNominalVoltageMaxValueError'),
        [HIGH_VOLTAGE_LIMIT]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
        [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'ShortCircuitCurrentLimitMustBeGreaterOrEqualToZero')
            .max(yup.ref(HIGH_SHORT_CIRCUIT_CURRENT_LIMIT), 'ShortCircuitCurrentLimitMinMaxError'),
        [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'ShortCircuitCurrentLimitMustBeGreaterOrEqualToZero')
            .when([LOW_SHORT_CIRCUIT_CURRENT_LIMIT], {
                is: (lowShortCircuitCurrentLimit: number | null) => lowShortCircuitCurrentLimit != null,
                then: (schema) => schema.required(),
            }),
        [BUS_BAR_COUNT]: yup
            .number()
            .nullable()
            .when([IS_ATTACHMENT_POINT_CREATION], {
                is: (isAttachmentPointCreation: boolean) => !isAttachmentPointCreation,
                then: (schema) => schema.min(1, 'BusBarCountMustBeGreaterThanOrEqualToOne').required(),
            }),
        [SECTION_COUNT]: yup
            .number()
            .nullable()
            .when([IS_ATTACHMENT_POINT_CREATION], {
                is: (isAttachmentPointCreation: boolean) => !isAttachmentPointCreation,
                then: (schema) => schema.min(1, 'SectionCountMustBeGreaterThanOrEqualToOne').required(),
            }),
        [SWITCHES_BETWEEN_SECTIONS]: yup
            .string()
            .nullable()
            .when([SECTION_COUNT], {
                is: (sectionCount: number) => sectionCount > 1,
                then: (schema) => schema.required(),
            }),
        [SWITCH_KINDS]: yup.array().of(
            yup.object().shape({
                [SWITCH_KIND]: yup.string().required(),
            })
        ),
        [IS_ATTACHMENT_POINT_CREATION]: yup.boolean().required(),
        [TOPOLOGY_KIND]: yup.string().nullable(),
        [COUPLING_OMNIBUS]: yup.array().of(
            yup.object().shape({
                [BUS_BAR_SECTION_ID1]: yup.string().nullable().required(),
                [BUS_BAR_SECTION_ID2]: yup
                    .string()
                    .nullable()
                    .required()
                    .notOneOf([yup.ref(BUS_BAR_SECTION_ID1), null], 'CreateCouplingDeviceIdenticalBusBar'),
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

    const defaultValues = useMemo((): VoltageLevelCreationFormData => {
        if (isAttachmentPointModification) {
            return { ...emptyFormData, [ADD_SUBSTATION_CREATION]: true, [IS_ATTACHMENT_POINT_CREATION]: true };
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
                [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: convertInputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    fromCopy ? voltageLevel.identifiableShortCircuit?.ipMin : voltageLevel.ipMin
                ),
                [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: convertInputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    fromCopy ? voltageLevel.identifiableShortCircuit?.ipMax : voltageLevel.ipMax
                ),
            };
            const switchKinds: SwitchKindFormData[] =
                voltageLevel.switchKinds?.map((switchKind: string) => ({
                    [SWITCH_KIND]: switchKind,
                })) || [];
            const switchesBetweenSections =
                voltageLevel.switchKinds
                    ?.map((switchKind: string) => intl.formatMessage({ id: switchKind }))
                    .join(' / ') || '';

            const equipmentId =
                (voltageLevel[FieldConstants.EQUIPMENT_ID] ?? voltageLevel[ID]) + (fromCopy ? '(1)' : '');
            const equipmentName = voltageLevel[FieldConstants.EQUIPMENT_NAME] ?? voltageLevel[NAME];
            const substationId = isSubstationCreation ? null : (voltageLevel[SUBSTATION_ID] ?? null);

            const properties = fromCopy
                ? copyEquipmentPropertiesForCreation(voltageLevel)
                : getPropertiesFromModification(voltageLevel.properties);
            reset(
                {
                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                    [FieldConstants.EQUIPMENT_NAME]: equipmentName,
                    [TOPOLOGY_KIND]: voltageLevel[TOPOLOGY_KIND],
                    [SUBSTATION_ID]: substationId,
                    [NOMINAL_V]: voltageLevel[NOMINAL_V],
                    [LOW_VOLTAGE_LIMIT]: voltageLevel[LOW_VOLTAGE_LIMIT],
                    [HIGH_VOLTAGE_LIMIT]: voltageLevel[HIGH_VOLTAGE_LIMIT],
                    ...shortCircuitLimits,
                    [BUS_BAR_COUNT]: voltageLevel[BUS_BAR_COUNT] ?? 1,
                    [SECTION_COUNT]: voltageLevel[SECTION_COUNT] ?? 1,
                    [SWITCHES_BETWEEN_SECTIONS]: switchesBetweenSections,
                    [COUPLING_OMNIBUS]: voltageLevel.couplingDevices ?? [],
                    [SWITCH_KINDS]: switchKinds,
                    [IS_ATTACHMENT_POINT_CREATION]: isAttachmentPointModification,
                    ...properties,
                },
                { keepDefaultValues: true }
            );
            if (isSubstationCreation) {
                const substationKeys = [
                    [SUBSTATION_CREATION_ID, voltageLevel.substationCreation?.equipmentId],
                    [SUBSTATION_NAME, voltageLevel.substationCreation?.equipmentName],
                    [FieldConstants.COUNTRY, voltageLevel.substationCreation?.country],
                ];
                substationKeys.forEach(([key, value]) => {
                    setValue(key, value);
                });
                setValue(
                    `${SUBSTATION_CREATION}.${FieldConstants.ADDITIONAL_PROPERTIES}`,
                    voltageLevel.substationCreation?.properties
                );
                setValue(ADD_SUBSTATION_CREATION, true);
            } else {
                setValue(ADD_SUBSTATION_CREATION, false);
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
        // Watch HIGH_VOLTAGE_LIMIT changed
        const unsubscribeHighVoltageLimit = subscribe({
            name: [`${HIGH_VOLTAGE_LIMIT}`],
            formState: {
                values: true,
            },
            callback: ({ isSubmitted }: { isSubmitted?: boolean }) => {
                if (isSubmitted) {
                    trigger(`${LOW_VOLTAGE_LIMIT}`).then();
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
                if (getValues(SUBSTATION_ID)) {
                    trigger(SUBSTATION_ID);
                }
                if (getValues(SUBSTATION_CREATION_ID)) {
                    trigger(SUBSTATION_CREATION_ID);
                }
            },
        });

        // Watch SUBSTATION_ID or SUBSTATION_CREATION_ID changed
        const unsubscribeSubstationIds = subscribe({
            name: [SUBSTATION_ID, SUBSTATION_CREATION_ID],
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
            const substationCreation: AttachedSubstationCreationInfo | null = getValues(ADD_SUBSTATION_CREATION)
                ? {
                      type: MODIFICATION_TYPES.SUBSTATION_CREATION.type,
                      equipmentId: voltageLevel[SUBSTATION_CREATION_ID],
                      equipmentName: voltageLevel[SUBSTATION_NAME],
                      country: voltageLevel[FieldConstants.COUNTRY],
                      properties: toModificationProperties(voltageLevel[SUBSTATION_CREATION]),
                  }
                : null;
            onCreateVoltageLevel({
                studyUuid: studyUuid as UUID,
                nodeUuid: currentNodeUuid,
                equipmentId: voltageLevel[FieldConstants.EQUIPMENT_ID],
                equipmentName: sanitizeString(voltageLevel[FieldConstants.EQUIPMENT_NAME]) ?? undefined,
                substationId: substationCreation === null ? voltageLevel[SUBSTATION_ID] : null,
                substationCreation: substationCreation,
                nominalV: voltageLevel[NOMINAL_V],
                lowVoltageLimit: voltageLevel[LOW_VOLTAGE_LIMIT],
                highVoltageLimit: voltageLevel[HIGH_VOLTAGE_LIMIT],
                ipMin: convertOutputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    voltageLevel[LOW_SHORT_CIRCUIT_CURRENT_LIMIT]
                ),
                ipMax: convertOutputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    voltageLevel[HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]
                ),
                busbarCount: voltageLevel[BUS_BAR_COUNT],
                sectionCount: voltageLevel[SECTION_COUNT],
                switchKinds: voltageLevel[SWITCH_KINDS].map((e) => {
                    return e.switchKind as SwitchKind;
                }),
                couplingDevices: voltageLevel[COUPLING_OMNIBUS],
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
                <VoltageLevelCreationForm
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
