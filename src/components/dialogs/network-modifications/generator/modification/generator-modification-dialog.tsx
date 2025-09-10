/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useCallback, useEffect, useState } from 'react';
import { CustomFormProvider, EquipmentType, MODIFICATION_TYPES, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SET_POINT,
    ADDITIONAL_PROPERTIES,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    FREQUENCY_REGULATION,
    ID,
    MARGINAL_COST,
    MAX_Q,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MIN_Q,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    P,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
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
import { sanitizeString } from '../../../dialog-utils';
import GeneratorModificationForm from './generator-modification-form';
import { getSetPointsEmptyFormData, getSetPointsSchema } from '../../../set-points/set-points-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsValidationSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';
import {
    REMOVE,
    setCurrentReactiveCapabilityCurveChoice,
} from '../../../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyGenerator } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils.type';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import {
    getVoltageRegulationEmptyFormData,
    getVoltageRegulationSchema,
} from '../../../voltage-regulation/voltage-regulation-utils';
import {
    getActivePowerControlEmptyFormData,
    getActivePowerControlSchema,
} from '../../../active-power-control/active-power-control-utils';
import { GeneratorModificationInfos } from '../../../../../services/network-modification-types';
import { DeepNullable } from '../../../../utils/ts-utils';
import { GeneratorFormInfos, GeneratorModificationDialogSchemaForm } from '../generator-dialog.type';
import { toModificationOperation } from '../../../../utils/utils';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [ENERGY_SOURCE]: null,
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [RATED_NOMINAL_POWER]: null,
    [TRANSIENT_REACTANCE]: null,
    [TRANSFORMER_REACTANCE]: null,
    [PLANNED_ACTIVE_POWER_SET_POINT]: null,
    [MARGINAL_COST]: null,
    [PLANNED_OUTAGE_RATE]: null,
    [FORCED_OUTAGE_RATE]: null,
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
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
        [MINIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([MAXIMUM_ACTIVE_POWER], {
                is: (maximumActivePower: number) => maximumActivePower != null,
                then: (schema) =>
                    schema.max(yup.ref(MAXIMUM_ACTIVE_POWER), 'MinActivePowerMustBeLessOrEqualToMaxActivePower'),
            }),
        [RATED_NOMINAL_POWER]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
        [TRANSIENT_REACTANCE]: yup.number().nullable(),
        [TRANSFORMER_REACTANCE]: yup.number().nullable(),
        [PLANNED_ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
        [MARGINAL_COST]: yup.number().nullable(),

        [PLANNED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [FORCED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(true),
        [REACTIVE_LIMITS]: getReactiveLimitsValidationSchema(true),
        ...getSetPointsSchema(true),
        ...getVoltageRegulationSchema(true),
        ...getActivePowerControlSchema(true),
    })
    .concat(modificationPropertiesSchema)
    .required();

export type GeneratorModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: GeneratorModificationInfos;
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

    const formMethods = useForm<DeepNullable<GeneratorModificationDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<GeneratorModificationDialogSchemaForm>>(formSchema),
    });

    const {
        reset,
        getValues,
        setValue,
        formState: { isDirty },
    } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: GeneratorModificationInfos) => {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                [ENERGY_SOURCE]: editData?.energySource?.value ?? null,
                [MAXIMUM_ACTIVE_POWER]: editData?.maxP?.value ?? null,
                [MINIMUM_ACTIVE_POWER]: editData?.minP?.value ?? null,
                [RATED_NOMINAL_POWER]: editData?.ratedS?.value ?? null,
                [ACTIVE_POWER_SET_POINT]: editData?.targetP?.value ?? null,
                [VOLTAGE_REGULATION]: editData?.voltageRegulationOn?.value ?? null,
                [VOLTAGE_SET_POINT]: editData?.targetV?.value ?? null,
                [REACTIVE_POWER_SET_POINT]: editData?.targetQ?.value ?? null,
                [PLANNED_ACTIVE_POWER_SET_POINT]: editData?.plannedActivePowerSetPoint?.value ?? null,
                [MARGINAL_COST]: editData?.marginalCost?.value ?? null,
                [PLANNED_OUTAGE_RATE]: editData?.plannedOutageRate?.value ?? null,
                [FORCED_OUTAGE_RATE]: editData?.forcedOutageRate?.value ?? null,
                [FREQUENCY_REGULATION]: editData?.participate?.value ?? null,
                [DROOP]: editData?.droop?.value ?? null,
                [TRANSIENT_REACTANCE]: editData?.directTransX?.value ?? null,
                [TRANSFORMER_REACTANCE]: editData?.stepUpTransformerX?.value ?? null,
                [VOLTAGE_REGULATION_TYPE]: editData?.voltageRegulationType?.value ?? null,
                [Q_PERCENT]: editData?.qPercent?.value ?? null,
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
                    [P]: null,
                    [MIN_Q]: null,
                    [MAX_Q]: null,
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
                            if (previousReactiveCapabilityCurveTable) {
                                setValue(
                                    `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                    previousReactiveCapabilityCurveTable
                                );
                            } else {
                                setCurrentReactiveCapabilityCurveChoice(
                                    previousReactiveCapabilityCurveTable,
                                    `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                    setValue
                                );
                            }
                            setGeneratorToModify({
                                ...value,
                                reactiveCapabilityCurvePoints: previousReactiveCapabilityCurveTable,
                            });
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
                                }),
                                { keepDefaultValues: isDirty }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setGeneratorToModify(null);
                            reset(emptyFormData);
                        }
                    });
            } else {
                setValuesAndEmptyOthers();
                setGeneratorToModify(null);
            }
        },
        [
            studyUuid,
            currentNode.id,
            currentRootNetworkUuid,
            reset,
            isDirty,
            setValue,
            getValues,
            editData?.equipmentId,
            setValuesAndEmptyOthers,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (generator: GeneratorModificationDialogSchemaForm) => {
            const reactiveLimits = generator[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn = reactiveLimits?.[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';

            const generatorModificationInfos = {
                type: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
                uuid: editData?.uuid ?? null,
                equipmentId: selectedId,
                equipmentName: toModificationOperation(sanitizeString(generator[EQUIPMENT_NAME])),
                energySource: toModificationOperation(generator[ENERGY_SOURCE]),
                minP: toModificationOperation(generator[MINIMUM_ACTIVE_POWER]),
                maxP: toModificationOperation(generator[MAXIMUM_ACTIVE_POWER]),
                ratedS: toModificationOperation(generator[RATED_NOMINAL_POWER]),
                targetP: toModificationOperation(generator[ACTIVE_POWER_SET_POINT]),
                targetQ: toModificationOperation(generator[REACTIVE_POWER_SET_POINT]),
                voltageRegulationOn: toModificationOperation(generator[VOLTAGE_REGULATION]),
                targetV: toModificationOperation(generator[VOLTAGE_SET_POINT]),
                voltageLevelId: toModificationOperation(generator[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID]),
                busOrBusbarSectionId: toModificationOperation(generator[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID]),
                connectionName: toModificationOperation(sanitizeString(generator[CONNECTIVITY]?.[CONNECTION_NAME])),
                connectionDirection: toModificationOperation(generator[CONNECTIVITY]?.[CONNECTION_DIRECTION]),
                connectionPosition: toModificationOperation(generator[CONNECTIVITY]?.[CONNECTION_POSITION]),
                terminalConnected: toModificationOperation(generator[CONNECTIVITY]?.[CONNECTED]),
                qPercent: toModificationOperation(generator[Q_PERCENT]),
                plannedActivePowerSetPoint: toModificationOperation(generator[PLANNED_ACTIVE_POWER_SET_POINT]),
                marginalCost: toModificationOperation(generator[MARGINAL_COST]),
                plannedOutageRate: toModificationOperation(generator[PLANNED_OUTAGE_RATE]),
                forcedOutageRate: toModificationOperation(generator[FORCED_OUTAGE_RATE]),
                directTransX: toModificationOperation(generator[TRANSIENT_REACTANCE]),
                stepUpTransformerX: toModificationOperation(generator[TRANSFORMER_REACTANCE]),
                voltageRegulationType: toModificationOperation(generator[VOLTAGE_REGULATION_TYPE]),
                regulatingTerminalId: toModificationOperation(generator[EQUIPMENT]?.id),
                regulatingTerminalType: toModificationOperation(generator[EQUIPMENT]?.type),
                regulatingTerminalVlId: toModificationOperation(generator[VOLTAGE_LEVEL]?.id),
                reactiveCapabilityCurve: toModificationOperation(isReactiveCapabilityCurveOn),
                participate: toModificationOperation(generator[FREQUENCY_REGULATION]),
                droop: toModificationOperation(generator[DROOP]),
                maxQ: toModificationOperation(
                    isReactiveCapabilityCurveOn ? null : reactiveLimits?.[MAXIMUM_REACTIVE_POWER]
                ),
                minQ: toModificationOperation(
                    isReactiveCapabilityCurveOn ? null : reactiveLimits?.[MINIMUM_REACTIVE_POWER]
                ),
                reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
                    ? (reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE] ?? null)
                    : null,
                properties: toModificationProperties(generator) ?? null,
            } satisfies GeneratorModificationInfos;

            modifyGenerator({
                generatorModificationInfos: generatorModificationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? null,
                isUpdate: !!editData,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GeneratorModificationError',
                });
            });
        },
        [selectedId, studyUuid, currentNodeUuid, editData, snackError]
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
