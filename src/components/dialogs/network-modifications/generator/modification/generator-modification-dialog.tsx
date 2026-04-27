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
    emptyProperties,
    EquipmentType,
    getConcatenatedProperties,
    getPropertiesFromModification,
    MODIFICATION_TYPES,
    modificationPropertiesSchema,
    snackWithFallback,
    toModificationProperties,
    useSnackMessage,
    DeepNullable,
    sanitizeString,
    FieldConstants,
    toModificationOperation,
    getConnectivityFormData,
    getConnectivityWithPositionSchema,
    getConnectivityWithPositionEmptyFormData,
    getSetPointsSchema,
    getSetPointsEmptyFormData,
    getActivePowerControlEmptyFormData,
    getActivePowerControlSchema,
    getShortCircuitFormData,
    getShortCircuitEmptyFormData,
    getShortCircuitFormSchema,
    getReactiveLimitsValidationSchema,
    toReactiveCapabilityCurveChoiceForGeneratorModification,
    REMOVE,
    getReactiveLimitsFormData,
    getReactiveLimitsEmptyFormData,
    GeneratorModificationDto,
    GeneratorModificationDialogSchemaForm,
    GeneratorFormInfos,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SET_POINT,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    ENERGY_SOURCE,
    EQUIPMENT_NAME,
    ID,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
} from 'components/utils/field-constants';
import GeneratorModificationForm from './generator-modification-form';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyGenerator } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils.type';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import {
    getVoltageRegulationEmptyFormData,
    getVoltageRegulationSchema,
} from '../../../voltage-regulation/voltage-regulation-utils';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [ENERGY_SOURCE]: null,
    [FieldConstants.MAXIMUM_ACTIVE_POWER]: null,
    [FieldConstants.MINIMUM_ACTIVE_POWER]: null,
    [FieldConstants.RATED_NOMINAL_POWER]: null,
    ...getShortCircuitEmptyFormData(),
    [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]: null,
    [FieldConstants.MARGINAL_COST]: null,
    [FieldConstants.PLANNED_OUTAGE_RATE]: null,
    [FieldConstants.FORCED_OUTAGE_RATE]: null,
    ...getConnectivityWithPositionEmptyFormData(true),
    ...getSetPointsEmptyFormData(true),
    ...getVoltageRegulationEmptyFormData(true),
    ...getActivePowerControlEmptyFormData(true),
    ...getReactiveLimitsEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [ENERGY_SOURCE]: yup.string().nullable(),
        [FieldConstants.MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
        [FieldConstants.MINIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([FieldConstants.MAXIMUM_ACTIVE_POWER], {
                is: (maximumActivePower: number) => maximumActivePower != null,
                then: (schema) =>
                    schema.max(
                        yup.ref(FieldConstants.MAXIMUM_ACTIVE_POWER),
                        'MinActivePowerMustBeLessOrEqualToMaxActivePower'
                    ),
            }),
        [FieldConstants.RATED_NOMINAL_POWER]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
        ...getShortCircuitFormSchema(),
        [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
        [FieldConstants.MARGINAL_COST]: yup.number().nullable(),

        [FieldConstants.PLANNED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [FieldConstants.FORCED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(true),
        [FieldConstants.REACTIVE_LIMITS]: getReactiveLimitsValidationSchema(true),
        ...getSetPointsSchema(true),
        ...getVoltageRegulationSchema(true),
        ...getActivePowerControlSchema(true),
    })
    .concat(modificationPropertiesSchema)
    .required();

export type GeneratorModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: GeneratorModificationDto;
};

export default function GeneratorModificationDialog({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD
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

    const formMethods = useFormWithDirtyTracking<DeepNullable<GeneratorModificationDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<GeneratorModificationDialogSchemaForm>>(formSchema),
    });

    const { reset, getValues } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: GeneratorModificationDto) => {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                [ENERGY_SOURCE]: editData?.energySource?.value ?? null,
                [FieldConstants.MAXIMUM_ACTIVE_POWER]: editData?.maxP?.value ?? null,
                [FieldConstants.MINIMUM_ACTIVE_POWER]: editData?.minP?.value ?? null,
                [FieldConstants.RATED_NOMINAL_POWER]: editData?.ratedS?.value ?? null,
                [ACTIVE_POWER_SET_POINT]: editData?.targetP?.value ?? null,
                [VOLTAGE_REGULATION]: editData?.voltageRegulationOn?.value ?? null,
                [FieldConstants.VOLTAGE_SET_POINT]: editData?.targetV?.value ?? null,
                [REACTIVE_POWER_SET_POINT]: editData?.targetQ?.value ?? null,
                [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]: editData?.plannedActivePowerSetPoint?.value ?? null,
                [FieldConstants.MARGINAL_COST]: editData?.marginalCost?.value ?? null,
                [FieldConstants.PLANNED_OUTAGE_RATE]: editData?.plannedOutageRate?.value ?? null,
                [FieldConstants.FORCED_OUTAGE_RATE]: editData?.forcedOutageRate?.value ?? null,
                [FieldConstants.FREQUENCY_REGULATION]: editData?.participate?.value ?? null,
                [FieldConstants.DROOP]: editData?.droop?.value ?? null,
                ...getShortCircuitFormData({
                    directTransX: editData?.directTransX?.value ?? null,
                    stepUpTransformerX: editData?.stepUpTransformerX?.value ?? null,
                }),
                [FieldConstants.VOLTAGE_REGULATION_TYPE]: editData?.voltageRegulationType?.value ?? null,
                [FieldConstants.Q_PERCENT]: editData?.qPercent?.value ?? null,
                ...getConnectivityFormData({
                    voltageLevelId: editData?.voltageLevelId?.value ?? null,
                    busbarSectionId: editData?.busOrBusbarSectionId?.value ?? null,
                    connectionName: editData?.connectionName?.value ?? '',
                    connectionDirection: editData?.connectionDirection?.value ?? null,
                    connectionPosition: editData?.connectionPosition?.value ?? null,
                    terminalConnected: editData?.terminalConnected?.value ?? null,
                    isEquipmentModification: true,
                }),
                ...getReactiveLimitsFormData({
                    reactiveCapabilityCurveChoice: editData?.reactiveCapabilityCurve?.value ? 'CURVE' : 'MINMAX',
                    maximumReactivePower: editData?.maxQ?.value ?? null,
                    minimumReactivePower: editData?.minQ?.value ?? null,
                    reactiveCapabilityCurvePoints: editData?.reactiveCapabilityCurvePoints ?? null,
                }),
                ...getRegulatingTerminalFormData({
                    equipmentId: editData?.regulatingTerminalId?.value,
                    equipmentType: editData?.regulatingTerminalType?.value,
                    voltageLevelId: editData?.regulatingTerminalVlId?.value,
                }),
                ...getPropertiesFromModification(editData?.properties ?? undefined),
            });
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
            reset({ ...emptyFormData, ...customData }, { keepDefaultValues: keepDefaultValues });
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
        (generator: GeneratorModificationDialogSchemaForm) => {
            const reactiveLimits = generator[FieldConstants.REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn =
                toReactiveCapabilityCurveChoiceForGeneratorModification(
                    reactiveLimits,
                    editData,
                    generatorToModify?.reactiveCapabilityCurvePoints
                ) === 'CURVE';

            const generatorModificationInfos = {
                type: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
                uuid: editData?.uuid ?? null,
                equipmentId: selectedId,
                equipmentName: toModificationOperation(sanitizeString(generator[EQUIPMENT_NAME])),
                energySource: toModificationOperation(generator[ENERGY_SOURCE]),
                minP: toModificationOperation(generator[FieldConstants.MINIMUM_ACTIVE_POWER]),
                maxP: toModificationOperation(generator[FieldConstants.MAXIMUM_ACTIVE_POWER]),
                ratedS: toModificationOperation(generator[FieldConstants.RATED_NOMINAL_POWER]),
                targetP: toModificationOperation(generator[ACTIVE_POWER_SET_POINT]),
                targetQ: toModificationOperation(generator[REACTIVE_POWER_SET_POINT]),
                voltageRegulationOn: toModificationOperation(generator[VOLTAGE_REGULATION]),
                targetV: toModificationOperation(generator[FieldConstants.VOLTAGE_SET_POINT]),
                voltageLevelId: toModificationOperation(generator[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID]),
                busOrBusbarSectionId: toModificationOperation(generator[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID]),
                connectionName: toModificationOperation(sanitizeString(generator[CONNECTIVITY]?.[CONNECTION_NAME])),
                connectionDirection: toModificationOperation(generator[CONNECTIVITY]?.[CONNECTION_DIRECTION]),
                connectionPosition: toModificationOperation(generator[CONNECTIVITY]?.[CONNECTION_POSITION]),
                terminalConnected: toModificationOperation(generator[CONNECTIVITY]?.[CONNECTED]),
                qPercent: toModificationOperation(generator[FieldConstants.Q_PERCENT]),
                plannedActivePowerSetPoint: toModificationOperation(
                    generator[FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]
                ),
                marginalCost: toModificationOperation(generator[FieldConstants.MARGINAL_COST]),
                plannedOutageRate: toModificationOperation(generator[FieldConstants.PLANNED_OUTAGE_RATE]),
                forcedOutageRate: toModificationOperation(generator[FieldConstants.FORCED_OUTAGE_RATE]),
                directTransX: toModificationOperation(generator[FieldConstants.TRANSIENT_REACTANCE]),
                stepUpTransformerX: toModificationOperation(generator[FieldConstants.TRANSFORMER_REACTANCE]),
                voltageRegulationType: toModificationOperation(generator[FieldConstants.VOLTAGE_REGULATION_TYPE]),
                regulatingTerminalId: toModificationOperation(generator[FieldConstants.EQUIPMENT]?.id),
                regulatingTerminalType: toModificationOperation(generator[FieldConstants.EQUIPMENT]?.type),
                regulatingTerminalVlId: toModificationOperation(generator[VOLTAGE_LEVEL]?.id),
                reactiveCapabilityCurve: toModificationOperation(isReactiveCapabilityCurveOn),
                participate: toModificationOperation(generator[FieldConstants.FREQUENCY_REGULATION]),
                droop: toModificationOperation(generator[FieldConstants.DROOP]),
                maxQ: toModificationOperation(
                    isReactiveCapabilityCurveOn ? null : reactiveLimits?.[FieldConstants.MAXIMUM_REACTIVE_POWER]
                ),
                minQ: toModificationOperation(
                    isReactiveCapabilityCurveOn ? null : reactiveLimits?.[FieldConstants.MINIMUM_REACTIVE_POWER]
                ),
                reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
                    ? (reactiveLimits?.[FieldConstants.REACTIVE_CAPABILITY_CURVE_TABLE] ?? null)
                    : null,
                properties: toModificationProperties(generator) ?? null,
            } satisfies GeneratorModificationDto;

            modifyGenerator({
                dto: generatorModificationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? null,
                isUpdate: !!editData,
            }).catch((error) => {
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
            validationSchema={formSchema}
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
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        equipmentId={selectedId}
                        generatorToModify={generatorToModify}
                        updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
