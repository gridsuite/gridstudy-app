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
    CustomFormProvider,
    EquipmentType,
    MODIFICATION_TYPES,
    snackWithFallback,
    useSnackMessage,
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
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    FREQUENCY_REGULATION,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER_SET_POINT,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import GeneratorCreationForm from './generator-creation-form';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';
import { sanitizeString } from '../../../dialog-utils';
import { FORM_LOADING_DELAY, REGULATION_TYPES, UNDEFINED_CONNECTION_DIRECTION } from 'components/network/constants';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsValidationSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { createGenerator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils.type';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';
import {
    getVoltageRegulationEmptyFormData,
    getVoltageRegulationSchema,
} from '../../../voltage-regulation/voltage-regulation-utils';
import {
    getActivePowerControlEmptyFormData,
    getActivePowerControlSchema,
} from '../../../active-power-control/active-power-control-utils';
import { GeneratorCreationInfos } from '../../../../../services/network-modification-types';
import { DeepNullable } from '../../../../utils/ts-utils';
import { GeneratorCreationDialogSchemaForm, GeneratorFormInfos } from '../generator-dialog.type';
import {
    getSetPointsEmptyFormData,
    getSetPointsSchema,
    testValueWithinPowerInterval,
} from '../../../set-points/set-points-utils';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import {
    getShortCircuitEmptyFormData,
    getShortCircuitFormData,
    getShortCircuitFormSchema,
} from '../../../short-circuit/short-circuit-utils';
import { toReactiveCapabilityCurveChoiceForGeneratorCreation } from '../../../reactive-limits/reactive-capability-curve/reactive-capability-utils';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [ENERGY_SOURCE]: 'OTHER',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [RATED_NOMINAL_POWER]: null,
    ...getShortCircuitEmptyFormData(),
    [PLANNED_ACTIVE_POWER_SET_POINT]: null,
    [MARGINAL_COST]: null,
    [PLANNED_OUTAGE_RATE]: null,
    [FORCED_OUTAGE_RATE]: null,
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
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [MINIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .max(yup.ref(MAXIMUM_ACTIVE_POWER), 'generatorMinimumActivePowerMaxValueError')
            .required(),
        [RATED_NOMINAL_POWER]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
        ...getShortCircuitFormSchema(),
        [PLANNED_ACTIVE_POWER_SET_POINT]: yup
            .number()
            .nullable()
            .test(
                'activePowerSetPoint',
                'PlannedActivePowerSetPointMustBeBetweenMinAndMaxActivePower',
                testValueWithinPowerInterval
            ),
        [MARGINAL_COST]: yup.number().nullable(),
        [PLANNED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [FORCED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(),
        ...getSetPointsSchema(),
        [REACTIVE_LIMITS]: getReactiveLimitsValidationSchema(),
        ...getVoltageRegulationSchema(),
        ...getActivePowerControlSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

export type GeneratorCreationDialogProps = NetworkModificationDialogProps & {
    editData: GeneratorCreationInfos;
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
                [MAXIMUM_ACTIVE_POWER]: generator.maxP,
                [MINIMUM_ACTIVE_POWER]: generator.minP,
                [RATED_NOMINAL_POWER]: generator.ratedS,
                [ACTIVE_POWER_SET_POINT]: generator.targetP,
                [VOLTAGE_REGULATION]: generator.voltageRegulatorOn,
                [VOLTAGE_SET_POINT]: generator.targetV,
                [REACTIVE_POWER_SET_POINT]: generator.targetQ,
                [PLANNED_ACTIVE_POWER_SET_POINT]: generator.generatorStartup?.plannedActivePowerSetPoint,
                [MARGINAL_COST]: generator.generatorStartup?.marginalCost,
                [PLANNED_OUTAGE_RATE]: generator.generatorStartup?.plannedOutageRate,
                [FORCED_OUTAGE_RATE]: generator.generatorStartup?.forcedOutageRate,
                [FREQUENCY_REGULATION]: generator.activePowerControl?.participate,
                [DROOP]: generator.activePowerControl?.droop,
                ...getShortCircuitFormData({
                    directTransX: generator.generatorShortCircuit?.directTransX,
                    stepUpTransformerX: generator.generatorShortCircuit?.stepUpTransformerX,
                }),
                [VOLTAGE_REGULATION_TYPE]:
                    generator?.regulatingTerminalId || generator?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id,
                [Q_PERCENT]: isNaN(Number(generator?.coordinatedReactiveControl?.qPercent))
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
                [MAXIMUM_ACTIVE_POWER]: editData.maxP,
                [MINIMUM_ACTIVE_POWER]: editData.minP,
                [RATED_NOMINAL_POWER]: editData.ratedS,
                [ACTIVE_POWER_SET_POINT]: editData.targetP,
                [VOLTAGE_REGULATION]: editData.voltageRegulationOn,
                [VOLTAGE_SET_POINT]: editData.targetV,
                [REACTIVE_POWER_SET_POINT]: editData.targetQ,
                [PLANNED_ACTIVE_POWER_SET_POINT]: editData.plannedActivePowerSetPoint,
                [MARGINAL_COST]: editData.marginalCost,
                [PLANNED_OUTAGE_RATE]: editData.plannedOutageRate,
                [FORCED_OUTAGE_RATE]: editData.forcedOutageRate,
                [FREQUENCY_REGULATION]: editData.participate,
                [DROOP]: editData.droop,
                ...getShortCircuitFormData({
                    directTransX: editData.directTransX,
                    stepUpTransformerX: editData.stepUpTransformerX,
                }),
                [VOLTAGE_REGULATION_TYPE]: editData?.regulatingTerminalId
                    ? REGULATION_TYPES.DISTANT.id
                    : REGULATION_TYPES.LOCAL.id,
                [Q_PERCENT]: editData.qPercent,
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
            const reactiveLimits = generator[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn =
                toReactiveCapabilityCurveChoiceForGeneratorCreation(reactiveLimits, editData) === 'CURVE';
            const isDistantRegulation = generator[VOLTAGE_REGULATION_TYPE] === REGULATION_TYPES.DISTANT.id;

            const generatorCreationInfos = {
                type: MODIFICATION_TYPES.GENERATOR_CREATION.type,
                equipmentId: generator[EQUIPMENT_ID],
                equipmentName: sanitizeString(generator[EQUIPMENT_NAME]) ?? null,
                energySource: generator[ENERGY_SOURCE],
                minP: generator[MINIMUM_ACTIVE_POWER],
                maxP: generator[MAXIMUM_ACTIVE_POWER],
                ratedS: generator[RATED_NOMINAL_POWER] ?? null,
                targetP: generator[ACTIVE_POWER_SET_POINT] ?? null,
                targetQ: generator[REACTIVE_POWER_SET_POINT] ?? null,
                voltageRegulationOn: generator[VOLTAGE_REGULATION] ?? null,
                targetV: generator[VOLTAGE_SET_POINT] ?? null,
                qPercent: generator[Q_PERCENT] ?? null,
                voltageLevelId: generator.connectivity.voltageLevel.id ?? null,
                busOrBusbarSectionId: generator.connectivity.busOrBusbarSection.id ?? null,
                plannedActivePowerSetPoint: generator[PLANNED_ACTIVE_POWER_SET_POINT] ?? null,
                marginalCost: generator[MARGINAL_COST] ?? null,
                plannedOutageRate: generator[PLANNED_OUTAGE_RATE] ?? null,
                forcedOutageRate: generator[FORCED_OUTAGE_RATE] ?? null,
                directTransX: generator[TRANSIENT_REACTANCE] ?? null,
                stepUpTransformerX: generator[TRANSFORMER_REACTANCE] ?? null,
                regulatingTerminalId: isDistantRegulation ? (generator[EQUIPMENT]?.id ?? null) : null,
                regulatingTerminalType: isDistantRegulation ? (generator[EQUIPMENT]?.type ?? null) : null,
                regulatingTerminalVlId: isDistantRegulation ? (generator[VOLTAGE_LEVEL]?.id ?? null) : null,
                reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
                participate: generator[FREQUENCY_REGULATION] ?? null,
                droop: generator[DROOP] ?? null,
                maxQ: isReactiveCapabilityCurveOn ? null : (reactiveLimits[MAXIMUM_REACTIVE_POWER] ?? null),
                minQ: isReactiveCapabilityCurveOn ? null : (reactiveLimits[MINIMUM_REACTIVE_POWER] ?? null),
                connectionDirection: generator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName: sanitizeString(generator[CONNECTIVITY]?.[CONNECTION_NAME]) ?? null,
                reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
                    ? (reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE] ?? null)
                    : null,
                connectionPosition: generator[CONNECTIVITY]?.[CONNECTION_POSITION] ?? null,
                terminalConnected: generator[CONNECTIVITY]?.[CONNECTED] ?? null,
                properties: toModificationProperties(generator) ?? null,
            } satisfies GeneratorCreationInfos;

            createGenerator({
                generatorCreationInfos: generatorCreationInfos,
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
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
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
