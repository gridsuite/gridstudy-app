/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    CustomFormProvider,
    emptyProperties,
    EquipmentType,
    getPropertiesFromModification,
    MODIFICATION_TYPES,
    snackWithFallback,
    toModificationProperties,
    useSnackMessage,
    DeepNullable,
    sanitizeString,
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
    getSetPointsSchema,
    testValueWithinPowerInterval,
    getSetPointsEmptyFormData,
    UNDEFINED_CONNECTION_DIRECTION,
    FieldConstants,
    getActivePowerControlEmptyFormData,
    getActivePowerControlSchema,
    getShortCircuitEmptyFormData,
    getShortCircuitFormSchema,
    getShortCircuitFormData,
    GeneratorCreationDto,
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsValidationSchema,
    GeneratorCreationDialogSchemaForm,
    GeneratorFormInfos,
    getReactiveLimitsFormData,
    toReactiveCapabilityCurveChoiceForGeneratorCreation,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SET_POINT,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
} from 'components/utils/field-constants';
import GeneratorCreationForm from './generator-creation-form';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';
import { FORM_LOADING_DELAY, REGULATION_TYPES } from 'components/network/constants';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { createGenerator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils.type';
import {
    getVoltageRegulationEmptyFormData,
    getVoltageRegulationSchema,
} from '../../../voltage-regulation/voltage-regulation-utils';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { isNodeBuilt } from 'components/graph/util/model-functions';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [ENERGY_SOURCE]: 'OTHER',
    [FieldConstants.MAXIMUM_ACTIVE_POWER]: null,
    [FieldConstants.MINIMUM_ACTIVE_POWER]: null,
    [FieldConstants.RATED_NOMINAL_POWER]: null,
    ...getShortCircuitEmptyFormData(),
    [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]: null,
    [FieldConstants.MARGINAL_COST]: null,
    [FieldConstants.PLANNED_OUTAGE_RATE]: null,
    [FieldConstants.FORCED_OUTAGE_RATE]: null,
    ...getConnectivityWithPositionEmptyFormData(),
    ...getSetPointsEmptyFormData(),
    ...getReactiveLimitsEmptyFormData(),
    ...getVoltageRegulationEmptyFormData(),
    ...getActivePowerControlEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [ENERGY_SOURCE]: yup.string().nullable().required(),
        [FieldConstants.MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [FieldConstants.MINIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .max(yup.ref(FieldConstants.MAXIMUM_ACTIVE_POWER), 'generatorMinimumActivePowerMaxValueError')
            .required(),
        [FieldConstants.RATED_NOMINAL_POWER]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
        ...getShortCircuitFormSchema(),
        [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]: yup
            .number()
            .nullable()
            .default(null)
            .test(
                'activePowerSetPoint',
                'PlannedActivePowerSetPointMustBeBetweenMinAndMaxActivePower',
                testValueWithinPowerInterval
            ),
        [FieldConstants.MARGINAL_COST]: yup.number().nullable(),
        [FieldConstants.PLANNED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [FieldConstants.FORCED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(),
        ...getSetPointsSchema(),
        [FieldConstants.REACTIVE_LIMITS]: getReactiveLimitsValidationSchema(),
        ...getVoltageRegulationSchema(),
        ...getActivePowerControlSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

export type GeneratorCreationDialogProps = NetworkModificationDialogProps & {
    editData: GeneratorCreationDto;
};

export default function GeneratorCreationDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<GeneratorCreationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<GeneratorCreationDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<GeneratorCreationDialogSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;
    const fromSearchCopyToFormValues = (generator: GeneratorFormInfos) => {
        reset(
            {
                [EQUIPMENT_ID]: generator.id + '(1)',
                [EQUIPMENT_NAME]: generator.name ?? '',
                [ENERGY_SOURCE]: generator.energySource,
                [FieldConstants.MAXIMUM_ACTIVE_POWER]: generator.maxP,
                [FieldConstants.MINIMUM_ACTIVE_POWER]: generator.minP,
                [FieldConstants.RATED_NOMINAL_POWER]: generator.ratedS,
                [ACTIVE_POWER_SET_POINT]: generator.targetP,
                [VOLTAGE_REGULATION]: generator.voltageRegulatorOn,
                [FieldConstants.VOLTAGE_SET_POINT]: generator.targetV,
                [REACTIVE_POWER_SET_POINT]: generator.targetQ,
                [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]: generator.generatorStartup?.plannedActivePowerSetPoint,
                [FieldConstants.MARGINAL_COST]: generator.generatorStartup?.marginalCost,
                [FieldConstants.PLANNED_OUTAGE_RATE]: generator.generatorStartup?.plannedOutageRate,
                [FieldConstants.FORCED_OUTAGE_RATE]: generator.generatorStartup?.forcedOutageRate,
                [FieldConstants.FREQUENCY_REGULATION]: generator.activePowerControl?.participate,
                [FieldConstants.DROOP]: generator.activePowerControl?.droop,
                ...getShortCircuitFormData({
                    directTransX: generator.generatorShortCircuit?.directTransX,
                    stepUpTransformerX: generator.generatorShortCircuit?.stepUpTransformerX,
                }),
                [FieldConstants.VOLTAGE_REGULATION_TYPE]:
                    generator?.regulatingTerminalId || generator?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id,
                [FieldConstants.Q_PERCENT]: isNaN(Number(generator?.coordinatedReactiveControl?.qPercent))
                    ? null
                    : generator?.coordinatedReactiveControl?.qPercent,
                ...getReactiveLimitsFormData({
                    reactiveCapabilityCurveChoice: generator?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE',
                    minimumReactivePower: generator?.minMaxReactiveLimits?.minQ ?? null,
                    maximumReactivePower: generator?.minMaxReactiveLimits?.maxQ ?? null,
                    reactiveCapabilityCurvePoints: generator?.reactiveCapabilityCurvePoints ?? [{}, {}],
                }),
                ...getRegulatingTerminalFormData({
                    equipmentId: generator.regulatingTerminalConnectableId || generator.regulatingTerminalId,
                    equipmentType: generator.regulatingTerminalConnectableType,
                    voltageLevelId: generator.regulatingTerminalVlId,
                }),
                ...getConnectivityFormData({
                    voltageLevelId: generator.voltageLevelId,
                    busbarSectionId: generator.busOrBusbarSectionId,
                    connectionDirection: generator.connectablePosition.connectionDirection,
                    connectionName: generator.connectablePosition.connectionName,
                    // connected is not copied on purpose: we use the default value (true) in all cases
                }),
                ...copyEquipmentPropertiesForCreation(generator),
            },
            { keepDefaultValues: true }
        );
    };

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.GENERATOR);

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [ENERGY_SOURCE]: editData.energySource,
                [FieldConstants.MAXIMUM_ACTIVE_POWER]: editData.maxP,
                [FieldConstants.MINIMUM_ACTIVE_POWER]: editData.minP,
                [FieldConstants.RATED_NOMINAL_POWER]: editData.ratedS,
                [ACTIVE_POWER_SET_POINT]: editData.targetP,
                [VOLTAGE_REGULATION]: editData.voltageRegulationOn,
                [FieldConstants.VOLTAGE_SET_POINT]: editData.targetV,
                [REACTIVE_POWER_SET_POINT]: editData.targetQ,
                [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]: editData.plannedActivePowerSetPoint,
                [FieldConstants.MARGINAL_COST]: editData.marginalCost,
                [FieldConstants.PLANNED_OUTAGE_RATE]: editData.plannedOutageRate,
                [FieldConstants.FORCED_OUTAGE_RATE]: editData.forcedOutageRate,
                [FieldConstants.FREQUENCY_REGULATION]: editData.participate,
                [FieldConstants.DROOP]: editData.droop,
                ...getShortCircuitFormData({
                    directTransX: editData.directTransX,
                    stepUpTransformerX: editData.stepUpTransformerX,
                }),
                [FieldConstants.VOLTAGE_REGULATION_TYPE]: editData?.regulatingTerminalId
                    ? REGULATION_TYPES.DISTANT.id
                    : REGULATION_TYPES.LOCAL.id,
                [FieldConstants.Q_PERCENT]: editData.qPercent,
                ...getReactiveLimitsFormData({
                    reactiveCapabilityCurveChoice: editData?.reactiveCapabilityCurve ? 'CURVE' : 'MINMAX',
                    minimumReactivePower: editData?.minQ,
                    maximumReactivePower: editData?.maxQ,
                    reactiveCapabilityCurvePoints: editData?.reactiveCapabilityCurve
                        ? editData?.reactiveCapabilityCurvePoints
                        : [{}, {}],
                }),
                ...getRegulatingTerminalFormData({
                    equipmentId: editData.regulatingTerminalId,
                    equipmentType: editData.regulatingTerminalType,
                    voltageLevelId: editData.regulatingTerminalVlId,
                }),
                ...getConnectivityFormData({
                    voltageLevelId: editData.voltageLevelId,
                    busbarSectionId: editData.busOrBusbarSectionId,
                    connectionDirection: editData.connectionDirection,
                    connectionName: editData.connectionName,
                    connectionPosition: editData.connectionPosition,
                    terminalConnected: editData.terminalConnected,
                }),
                ...getPropertiesFromModification(editData?.properties ?? undefined),
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (generator: GeneratorCreationDialogSchemaForm) => {
            const reactiveLimits = generator[FieldConstants.REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn =
                toReactiveCapabilityCurveChoiceForGeneratorCreation(reactiveLimits, editData) === 'CURVE';
            const isDistantRegulation =
                generator[FieldConstants.VOLTAGE_REGULATION_TYPE] === REGULATION_TYPES.DISTANT.id;

            const generatorCreationInfos = {
                type: MODIFICATION_TYPES.GENERATOR_CREATION.type,
                equipmentId: generator[EQUIPMENT_ID],
                equipmentName: sanitizeString(generator[EQUIPMENT_NAME]) ?? null,
                energySource: generator[ENERGY_SOURCE],
                minP: generator[FieldConstants.MINIMUM_ACTIVE_POWER],
                maxP: generator[FieldConstants.MAXIMUM_ACTIVE_POWER],
                ratedS: generator[FieldConstants.RATED_NOMINAL_POWER] ?? null,
                targetP: generator[ACTIVE_POWER_SET_POINT] ?? null,
                targetQ: generator[REACTIVE_POWER_SET_POINT] ?? null,
                voltageRegulationOn: generator[VOLTAGE_REGULATION] ?? null,
                targetV: generator[FieldConstants.VOLTAGE_SET_POINT] ?? null,
                qPercent: generator[FieldConstants.Q_PERCENT] ?? null,
                voltageLevelId: generator.connectivity.voltageLevel.id ?? null,
                busOrBusbarSectionId: generator.connectivity.busOrBusbarSection.id ?? null,
                plannedActivePowerSetPoint: generator[FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT] ?? null,
                marginalCost: generator[FieldConstants.MARGINAL_COST] ?? null,
                plannedOutageRate: generator[FieldConstants.PLANNED_OUTAGE_RATE] ?? null,
                forcedOutageRate: generator[FieldConstants.FORCED_OUTAGE_RATE] ?? null,
                directTransX: generator[FieldConstants.TRANSIENT_REACTANCE] ?? null,
                stepUpTransformerX: generator[FieldConstants.TRANSFORMER_REACTANCE] ?? null,
                regulatingTerminalId: isDistantRegulation ? (generator[FieldConstants.EQUIPMENT]?.id ?? null) : null,
                regulatingTerminalType: isDistantRegulation
                    ? (generator[FieldConstants.EQUIPMENT]?.type ?? null)
                    : null,
                regulatingTerminalVlId: isDistantRegulation ? (generator[VOLTAGE_LEVEL]?.id ?? null) : null,
                reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
                participate: generator[FieldConstants.FREQUENCY_REGULATION] ?? null,
                droop: generator[FieldConstants.DROOP] ?? null,
                maxQ: isReactiveCapabilityCurveOn
                    ? null
                    : (reactiveLimits[FieldConstants.MAXIMUM_REACTIVE_POWER] ?? null),
                minQ: isReactiveCapabilityCurveOn
                    ? null
                    : (reactiveLimits[FieldConstants.MINIMUM_REACTIVE_POWER] ?? null),
                connectionDirection: generator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName: sanitizeString(generator[CONNECTIVITY]?.[CONNECTION_NAME]) ?? null,
                reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
                    ? (reactiveLimits[FieldConstants.REACTIVE_CAPABILITY_CURVE_TABLE] ?? null)
                    : null,
                connectionPosition: generator[CONNECTIVITY]?.[CONNECTION_POSITION] ?? null,
                terminalConnected: generator[CONNECTIVITY]?.[CONNECTED] ?? null,
                properties: toModificationProperties(generator) ?? null,
            } satisfies GeneratorCreationDto;

            createGenerator({
                dto: generatorCreationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'GeneratorCreationError' });
            });
        },
        [currentNodeUuid, editData, studyUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider isNodeBuilt={isNodeBuilt(currentNode)} validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="CreateGenerator"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <GeneratorCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.GENERATOR}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
