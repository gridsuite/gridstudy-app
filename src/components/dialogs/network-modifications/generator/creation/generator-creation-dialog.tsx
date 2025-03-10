/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { CustomFormProvider, EquipmentType, MODIFICATION_TYPES, useSnackMessage } from '@gridsuite/commons-ui';
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
    ID,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    NAME,
    NOMINAL_VOLTAGE,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER_SET_POINT,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    TYPE,
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
import { getActivePowerSetPointSchema, getReactivePowerSetPointSchema } from '../../../set-points/set-points-utils';
import {
    getReactiveCapabilityCurvePoints,
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsSchema,
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
import { DialogProps } from '@mui/material/Dialog/Dialog';
import { CurrentTreeNode } from '../../../../../redux/reducer';
import { UUID } from 'crypto';
import { DeepNullable } from '../../../../utils/ts-utils';
import { GeneratorDialogSchemaForm, GeneratorFormInfos } from '../generator-dialog.type';
import { GeneratorCreationInfos } from '../../../../../services/network-modification-types';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [ENERGY_SOURCE]: 'OTHER',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [RATED_NOMINAL_POWER]: null,
    [TRANSIENT_REACTANCE]: null,
    [TRANSFORMER_REACTANCE]: null,
    [PLANNED_ACTIVE_POWER_SET_POINT]: null,
    [MARGINAL_COST]: null,
    [PLANNED_OUTAGE_RATE]: null,
    [FORCED_OUTAGE_RATE]: null,
    ...getReactiveLimitsEmptyFormData(),
    ...getConnectivityWithPositionEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [ENERGY_SOURCE]: yup.string().nullable().required(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [MINIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [RATED_NOMINAL_POWER]: yup.number().nullable(),
        [TRANSFORMER_REACTANCE]: yup.number().nullable(),
        [TRANSIENT_REACTANCE]: yup
            .number()
            .nullable()
            .when([TRANSFORMER_REACTANCE], {
                is: (transformerReactance: number) => transformerReactance != null,
                then: (schema) => schema.required(),
            }),
        [PLANNED_ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
        [MARGINAL_COST]: yup.number().nullable(),
        [PLANNED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [FORCED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [VOLTAGE_REGULATION]: yup.bool().nullable().required(),
        [ACTIVE_POWER_SET_POINT]: getActivePowerSetPointSchema(),
        [REACTIVE_POWER_SET_POINT]: getReactivePowerSetPointSchema(),
        [VOLTAGE_REGULATION_TYPE]: yup.string().nullable(),

        [VOLTAGE_SET_POINT]: yup
            .number()
            .nullable()
            .when([VOLTAGE_REGULATION], {
                is: (value: boolean) => value,
                then: (schema) => schema.required(),
            }),
        [Q_PERCENT]: yup.number().nullable().max(100, 'NormalizedPercentage').min(0, 'NormalizedPercentage'),
        [VOLTAGE_LEVEL]: yup
            .object()
            .nullable()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string(),
                [SUBSTATION_ID]: yup.string(),
                [NOMINAL_VOLTAGE]: yup.string(),
                [TOPOLOGY_KIND]: yup.string().nullable(),
            })
            .when([VOLTAGE_REGULATION, VOLTAGE_REGULATION_TYPE], {
                is: (voltageRegulation: boolean, voltageRegulationType: string) =>
                    voltageRegulation && voltageRegulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }),
        [EQUIPMENT]: yup
            .object()
            .nullable()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string().nullable(),
                [TYPE]: yup.string(),
            })
            .when([VOLTAGE_REGULATION, VOLTAGE_REGULATION_TYPE], {
                is: (voltageRegulation: boolean, voltageRegulationType: string) =>
                    voltageRegulation && voltageRegulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }),
        [FREQUENCY_REGULATION]: yup.bool().nullable().required(),
        [DROOP]: yup.number().nullable().required(),
        [REACTIVE_LIMITS]: getReactiveLimitsSchema(),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(false),
    })
    .concat(creationPropertiesSchema)
    .required();

export interface GeneratorCreationDialogProps extends Partial<DialogProps> {
    editData: GeneratorCreationInfos;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatus;
    disabledSave: boolean;
}

export function GeneratorCreationDialog({
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

    const formMethods = useForm<DeepNullable<GeneratorDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<GeneratorDialogSchemaForm>>(formSchema),
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
                [TRANSIENT_REACTANCE]: generator.generatorShortCircuit?.directTransX,
                [TRANSFORMER_REACTANCE]: generator.generatorShortCircuit?.stepUpTransformerX,
                [VOLTAGE_REGULATION_TYPE]:
                    generator?.regulatingTerminalId || generator?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id,
                [Q_PERCENT]: isNaN(generator?.qPercent) ? null : generator?.qPercent,
                ...getReactiveLimitsFormData({
                    id: REACTIVE_LIMITS,
                    reactiveCapabilityCurveChoice: generator?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE',
                    minimumReactivePower: generator?.minMaxReactiveLimits?.minQ ?? null,
                    maximumReactivePower: generator?.minMaxReactiveLimits?.maxQ ?? null,
                }),
                ...getReactiveCapabilityCurvePoints({
                    id: REACTIVE_LIMITS,
                    reactiveCapabilityCurvePoints: generator?.reactiveCapabilityCurvePoints ?? [{}, {}],
                }),
                ...getRegulatingTerminalFormData({
                    voltageLevelId: generator.regulatingTerminalVlId,
                    voltageLevelName: undefined,
                    voltageLevelNominalVoltage: undefined,
                    voltageLevelSubstationId: undefined,
                    voltageLevelTopologyKind: undefined,
                    equipmentId: generator.regulatingTerminalConnectableId || generator.regulatingTerminalId,
                    equipmentName: undefined,
                    equipmentType: generator.regulatingTerminalConnectableType,
                }),
                ...getConnectivityFormData({
                    voltageLevelId: generator.voltageLevelId,
                    busbarSectionId: generator.busOrBusbarSectionId,
                    busbarSectionName: undefined,
                    connectionDirection: generator.connectablePosition.connectionDirection,
                    connectionName: generator.connectablePosition.connectionName,
                    connectionPosition: undefined,
                    terminalConnected: undefined,
                }),
                ...copyEquipmentPropertiesForCreation({ properties: generator.properties }),
            },
            { keepDefaultValues: true }
        );
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        toFormValues: fromSearchCopyToFormValues,
        setFormValues: (data: GeneratorDialogSchemaForm) => {
            reset(data, { keepDefaultValues: true });
        },
        elementType: EquipmentType.GENERATOR,
    });

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
                [TRANSIENT_REACTANCE]: editData.directTransX,
                [TRANSFORMER_REACTANCE]: editData.stepUpTransformerX,
                [VOLTAGE_REGULATION_TYPE]: editData?.regulatingTerminalId
                    ? REGULATION_TYPES.DISTANT.id
                    : REGULATION_TYPES.LOCAL.id,
                [Q_PERCENT]: editData.qPercent,
                ...getReactiveLimitsFormData({
                    id: REACTIVE_LIMITS,
                    reactiveCapabilityCurveChoice: editData?.reactiveCapabilityCurve ? 'CURVE' : 'MINMAX',
                    minimumReactivePower: editData?.minQ,
                    maximumReactivePower: editData?.maxQ,
                }),
                ...getReactiveCapabilityCurvePoints({
                    id: REACTIVE_LIMITS,
                    reactiveCapabilityCurvePoints: editData?.reactiveCapabilityCurve
                        ? editData?.reactiveCapabilityCurvePoints
                        : [{}, {}],
                }),
                ...getRegulatingTerminalFormData({
                    voltageLevelId: editData.regulatingTerminalVlId,
                    voltageLevelName: undefined,
                    voltageLevelNominalVoltage: undefined,
                    voltageLevelSubstationId: undefined,
                    voltageLevelTopologyKind: undefined,
                    equipmentId: editData.regulatingTerminalId,
                    equipmentName: undefined,
                    equipmentType: editData.regulatingTerminalType,
                }),
                ...getConnectivityFormData({
                    voltageLevelId: editData.voltageLevelId,
                    busbarSectionId: editData.busOrBusbarSectionId,
                    busbarSectionName: undefined,
                    connectionDirection: editData.connectionDirection,
                    connectionName: editData.connectionName,
                    connectionPosition: editData.connectionPosition,
                    terminalConnected: editData.terminalConnected,
                }),
                ...getPropertiesFromModification(editData.properties),
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (generator: GeneratorDialogSchemaForm) => {
            const reactiveLimits = generator[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn = reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
            const isDistantRegulation = generator[VOLTAGE_REGULATION_TYPE] === REGULATION_TYPES.DISTANT.id;
            const generatorCreationInfos = {
                type: MODIFICATION_TYPES.GENERATOR_CREATION.type,
                uuid: editData?.uuid,
                equipmentId: generator[EQUIPMENT_ID],
                equipmentName: sanitizeString(generator[EQUIPMENT_NAME]),
                energySource: generator[ENERGY_SOURCE],
                minP: generator[MINIMUM_ACTIVE_POWER],
                maxP: generator[MAXIMUM_ACTIVE_POWER],
                ratedS: generator[RATED_NOMINAL_POWER],
                targetP: generator[ACTIVE_POWER_SET_POINT],
                targetQ: generator[REACTIVE_POWER_SET_POINT],
                voltageRegulationOn: generator[VOLTAGE_REGULATION],
                targetV: generator[VOLTAGE_SET_POINT],
                qPercent: generator[Q_PERCENT],
                voltageLevelId: generator.connectivity.voltageLevel.id,
                busOrBusbarSectionId: generator.connectivity.busOrBusbarSection.id,
                plannedActivePowerSetPoint: generator[PLANNED_ACTIVE_POWER_SET_POINT],
                marginalCost: generator[MARGINAL_COST],
                plannedOutageRate: generator[PLANNED_OUTAGE_RATE],
                forcedOutageRate: generator[FORCED_OUTAGE_RATE],
                directTransX: generator[TRANSIENT_REACTANCE],
                stepUpTransformerX: generator[TRANSFORMER_REACTANCE],
                regulatingTerminalId: isDistantRegulation ? generator[EQUIPMENT]?.id : null,
                regulatingTerminalType: isDistantRegulation ? generator[EQUIPMENT]?.type : null,
                regulatingTerminalVlId: isDistantRegulation ? generator[VOLTAGE_LEVEL]?.id : null,
                reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
                participate: generator[FREQUENCY_REGULATION],
                droop: generator[DROOP] ?? null,
                maxQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MAXIMUM_REACTIVE_POWER],
                minQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MINIMUM_REACTIVE_POWER],
                connectionDirection: generator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName: sanitizeString(generator[CONNECTIVITY]?.[CONNECTION_NAME]),
                reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
                    ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
                    : null,
                connectionPosition: generator[CONNECTIVITY]?.[CONNECTION_POSITION],
                terminalConnected: generator[CONNECTIVITY]?.[CONNECTED],
                properties: toModificationProperties(generator),
            };

            createGenerator({
                generatorCreationInfos: generatorCreationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GeneratorCreationError',
                });
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
                onClose={clear}
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-generator"
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
