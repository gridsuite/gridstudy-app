/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    convertOutputValue,
    CustomFormProvider,
    FieldType,
    MODIFICATION_TYPES,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { sanitizeString } from 'components/dialogs/dialog-utils';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/form-search-copy-hook';
import {
    ADD_SUBSTATION_CREATION,
    ADDITIONAL_PROPERTIES,
    BUS_BAR_COUNT,
    BUS_BAR_SECTION_ID1,
    BUS_BAR_SECTION_ID2,
    COUNTRY,
    COUPLING_OMNIBUS,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    ID,
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
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';

import VoltageLevelCreationForm from './voltage-level-creation-form';
import { controlCouplingOmnibusBetweenSections } from '../voltage-level-creation-utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useIntl } from 'react-intl';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { createVoltageLevel } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';

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

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
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
    [COUNTRY]: null,
    [SUBSTATION_CREATION]: emptyProperties,
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [SUBSTATION_ID]: yup
            .string()
            .nullable()
            .when([ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation) => addSubstationCreation === false,
                then: (schema) => schema.required(),
            }),
        [SUBSTATION_CREATION_ID]: yup
            .string()
            .nullable()
            .when([ADD_SUBSTATION_CREATION], {
                is: (addSubstationCreation) => addSubstationCreation === true,
                then: (schema) => schema.required(),
            }),
        [SUBSTATION_NAME]: yup.string().nullable(),
        [COUNTRY]: yup.string().nullable(),
        [SUBSTATION_CREATION]: creationPropertiesSchema,
        [NOMINAL_V]: yup.number().nullable().required(),
        [LOW_VOLTAGE_LIMIT]: yup.number().nullable(),
        [HIGH_VOLTAGE_LIMIT]: yup.number().nullable(),
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
                is: (lowShortCircuitCurrentLimit) => lowShortCircuitCurrentLimit != null,
                then: (schema) => schema.required(),
            }),
        [BUS_BAR_COUNT]: yup.number().min(1, 'BusBarCountMustBeGreaterThanOrEqualToOne').nullable().required(),
        [SECTION_COUNT]: yup.number().min(1, 'SectionCountMustBeGreaterThanOrEqualToOne').nullable().required(),
        [SWITCHES_BETWEEN_SECTIONS]: yup
            .string()
            .nullable()
            .when([SECTION_COUNT], {
                is: (sectionCount) => sectionCount > 1,
                then: (schema) => schema.required(),
            }),
        [COUPLING_OMNIBUS]: yup
            .array()
            .of(
                yup.object().shape({
                    [BUS_BAR_SECTION_ID1]: yup.string().nullable().required(),
                    [BUS_BAR_SECTION_ID2]: yup.string().nullable().required(),
                })
            )
            .test('coupling-omnibus-between-sections', (values) =>
                controlCouplingOmnibusBetweenSections(values, 'CouplingOmnibusBetweenSameBusbar')
            ),
    })
    .concat(creationPropertiesSchema);
const VoltageLevelCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    onCreateVoltageLevel = createVoltageLevel,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError, snackWarning } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue, getValues } = formMethods;
    const intl = useIntl();
    const fromExternalDataToFormValues = useCallback(
        (voltageLevel, fromCopy = true) => {
            const isSubstationCreation = !fromCopy && voltageLevel.substationCreation?.equipmentId != null;
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
            const switchKinds =
                voltageLevel.switchKinds?.map((switchKind) => ({
                    [SWITCH_KIND]: switchKind,
                })) || [];

            const switchesBetweenSections =
                voltageLevel.switchKinds?.map((switchKind) => intl.formatMessage({ id: switchKind })).join(' / ') || '';

            const equipmentId = (voltageLevel[EQUIPMENT_ID] ?? voltageLevel[ID]) + (fromCopy ? '(1)' : '');
            const equipmentName = voltageLevel[EQUIPMENT_NAME] ?? voltageLevel[NAME];
            const substationId = isSubstationCreation ? null : voltageLevel[SUBSTATION_ID] ?? null;

            const properties = fromCopy
                ? copyEquipmentPropertiesForCreation(voltageLevel)
                : getPropertiesFromModification(voltageLevel.properties);
            reset(
                {
                    [EQUIPMENT_ID]: equipmentId,
                    [EQUIPMENT_NAME]: equipmentName,
                    [TOPOLOGY_KIND]: voltageLevel[TOPOLOGY_KIND],
                    [SUBSTATION_ID]: substationId,
                    [NOMINAL_V]: voltageLevel[NOMINAL_V],
                    [LOW_VOLTAGE_LIMIT]: voltageLevel[LOW_VOLTAGE_LIMIT],
                    [HIGH_VOLTAGE_LIMIT]: voltageLevel[HIGH_VOLTAGE_LIMIT],
                    [LOW_VOLTAGE_LIMIT]: voltageLevel[LOW_VOLTAGE_LIMIT],
                    [HIGH_VOLTAGE_LIMIT]: voltageLevel[HIGH_VOLTAGE_LIMIT],
                    ...shortCircuitLimits,
                    [BUS_BAR_COUNT]: voltageLevel[BUS_BAR_COUNT] ?? 1,
                    [SECTION_COUNT]: voltageLevel[SECTION_COUNT] ?? 1,
                    [SWITCHES_BETWEEN_SECTIONS]: switchesBetweenSections,
                    [COUPLING_OMNIBUS]: voltageLevel.couplingDevices ?? [],
                    [SWITCH_KINDS]: switchKinds,
                    ...properties,
                },
                { keepDefaultValues: true }
            );
            if (isSubstationCreation) {
                const substationKeys = [
                    [SUBSTATION_CREATION_ID, voltageLevel.substationCreation?.equipmentId],
                    [SUBSTATION_NAME, voltageLevel.substationCreation?.equipmentName],
                    [COUNTRY, voltageLevel.substationCreation?.country],
                ];
                substationKeys.forEach(([key, value]) => {
                    setValue(key, value);
                });
                setValue(
                    `${SUBSTATION_CREATION}.${ADDITIONAL_PROPERTIES}`,
                    voltageLevel.substationCreation?.properties
                );
                setValue(ADD_SUBSTATION_CREATION, true);
            } else {
                setValue(ADD_SUBSTATION_CREATION, false);
            }
            if (!voltageLevel.isRetrievedBusbarSections && fromCopy) {
                snackWarning({
                    messageId: 'BusBarSectionsCopyingNotSupported',
                });
            }
        },
        [setValue, intl, reset, snackWarning]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        toFormValues: (data) => data,
        setFormValues: fromExternalDataToFormValues,
        elementType: EQUIPMENT_TYPES.VOLTAGE_LEVEL,
    });

    useEffect(() => {
        if (editData) {
            fromExternalDataToFormValues(editData, false);
        }
    }, [fromExternalDataToFormValues, editData]);

    const onSubmit = useCallback(
        (voltageLevel) => {
            const substationCreation = getValues(ADD_SUBSTATION_CREATION)
                ? {
                      type: MODIFICATION_TYPES.SUBSTATION_CREATION.type,
                      equipmentId: voltageLevel[SUBSTATION_CREATION_ID],
                      equipmentName: voltageLevel[SUBSTATION_NAME],
                      country: voltageLevel[COUNTRY],
                      properties: toModificationProperties(voltageLevel[SUBSTATION_CREATION]),
                  }
                : null;
            onCreateVoltageLevel({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                voltageLevelId: voltageLevel[EQUIPMENT_ID],
                voltageLevelName: sanitizeString(voltageLevel[EQUIPMENT_NAME]),
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
                    return e.switchKind;
                }),
                couplingDevices: voltageLevel[COUPLING_OMNIBUS],
                isUpdate: !!editData,
                modificationUuid: editData?.uuid,
                topologyKind: voltageLevel[TOPOLOGY_KIND],
                properties: toModificationProperties(voltageLevel),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelCreationError',
                });
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
                aria-labelledby="dialog-create-voltage-level"
                maxWidth={'md'}
                titleId="CreateVoltageLevel"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <VoltageLevelCreationForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

VoltageLevelCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    isUpdate: PropTypes.bool,
    onCreateVoltageLevel: PropTypes.func,
    editDataFetchStatus: PropTypes.string,
};

export default VoltageLevelCreationDialog;
