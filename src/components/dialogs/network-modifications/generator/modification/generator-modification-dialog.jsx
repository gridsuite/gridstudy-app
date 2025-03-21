/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import { useCallback, useEffect, useState } from 'react';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
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
import { REGULATION_TYPES } from 'components/network/constants';
import GeneratorModificationForm from './generator-modification-form';
import { getSetPointsEmptyFormData, getSetPointsSchema } from '../../../set-points/set-points-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';
import {
    REMOVE,
    setCurrentReactiveCapabilityCurveTable,
} from '../../../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyGenerator } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
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
    getConnectivityWithPositionValidationSchema,
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
        [EQUIPMENT_NAME]: yup.string(),
        [ENERGY_SOURCE]: yup.string().nullable(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
        [MINIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([MAXIMUM_ACTIVE_POWER], {
                is: (maximumActivePower) => maximumActivePower != null,
                then: (schema) =>
                    schema.max(yup.ref(MAXIMUM_ACTIVE_POWER), 'MinActivePowerMustBeLessOrEqualToMaxActivePower'),
            }),
        [RATED_NOMINAL_POWER]: yup.number().nullable(),
        [TRANSIENT_REACTANCE]: yup.number().nullable(),
        [TRANSFORMER_REACTANCE]: yup.number().nullable(),
        [PLANNED_ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
        [MARGINAL_COST]: yup.number().nullable(),

        [PLANNED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        [FORCED_OUTAGE_RATE]: yup.number().nullable().min(0, 'RealPercentage').max(1, 'RealPercentage'),
        ...getConnectivityWithPositionValidationSchema(true),
        ...getSetPointsSchema(true),
        ...getVoltageRegulationSchema(true),
        ...getActivePowerControlSchema(true),
        ...getReactiveLimitsSchema(true),
    })
    .concat(modificationPropertiesSchema)
    .required();

const GeneratorModificationDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [generatorToModify, setGeneratorToModify] = useState();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData) => {
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
                    reactiveCapabilityCurveTable: editData?.reactiveCapabilityCurvePoints ?? null,
                }),
                ...getRegulatingTerminalFormData({
                    equipmentId: editData?.regulatingTerminalId?.value,
                    equipmentType: editData?.regulatingTerminalType?.value,
                    voltageLevelId: editData?.regulatingTerminalVlId?.value,
                }),
                ...getPropertiesFromModification(editData.properties),
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

    const updatePreviousReactiveCapabilityCurveTable = (action, index) => {
        setGeneratorToModify((previousValue) => {
            const newRccValues = previousValue?.reactiveCapabilityCurvePoints;
            action === REMOVE
                ? newRccValues.splice(index, 1)
                : newRccValues.splice(index, 0, {
                      [P]: null,
                      [MIN_Q]: null,
                      [MAX_Q]: null,
                  });
            return {
                ...previousValue,
                reactiveCapabilityCurvePoints: newRccValues,
            };
        });
    };

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.GENERATOR,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value) => {
                        if (value) {
                            const previousReactiveCapabilityCurveTable = value?.reactiveCapabilityCurvePoints;
                            if (previousReactiveCapabilityCurveTable) {
                                setCurrentReactiveCapabilityCurveTable(
                                    previousReactiveCapabilityCurveTable,
                                    `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                    getValues,
                                    setValue,
                                    isNodeBuilt(currentNode)
                                );
                            }
                            setValue(`${CONNECTIVITY}.${VOLTAGE_LEVEL}.${ID}`, value?.voltageLevelId);
                            setValue(`${CONNECTIVITY}.${BUS_OR_BUSBAR_SECTION}.${ID}`, value?.busOrBusbarSectionId);
                            setGeneratorToModify({
                                ...value,
                                reactiveCapabilityCurveTable: previousReactiveCapabilityCurveTable,
                            });
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
                            }));
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
        [studyUuid, currentNode, currentRootNetworkUuid, reset, getValues, setValue, setValuesAndEmptyOthers, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const getPreviousRegulationType = useCallback(() => {
        if (generatorToModify?.voltageRegulatorOn) {
            return generatorToModify?.regulatingTerminalVlId || generatorToModify?.regulatingTerminalConnectableId
                ? REGULATION_TYPES.DISTANT.id
                : REGULATION_TYPES.LOCAL.id;
        } else {
            return null;
        }
    }, [generatorToModify]);

    const onSubmit = useCallback(
        (generator) => {
            const reactiveLimits = generator[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn = reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
            const isDistantRegulation =
                generator?.[VOLTAGE_REGULATION_TYPE] === REGULATION_TYPES.DISTANT.id ||
                (generator[VOLTAGE_REGULATION_TYPE] === null &&
                    getPreviousRegulationType() === REGULATION_TYPES.DISTANT.id);

            modifyGenerator({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                generatorId: selectedId,
                name: sanitizeString(generator[EQUIPMENT_NAME]),
                energySource: generator[ENERGY_SOURCE],
                minP: generator[MINIMUM_ACTIVE_POWER],
                maxP: generator[MAXIMUM_ACTIVE_POWER],
                ratedS: generator[RATED_NOMINAL_POWER],
                targetP: generator[ACTIVE_POWER_SET_POINT],
                targetQ: generator[REACTIVE_POWER_SET_POINT],
                voltageRegulation: generator[VOLTAGE_REGULATION],
                targetV: generator[VOLTAGE_SET_POINT],
                voltageLevelId: generator[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                busOrBusbarSectionId: generator[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                connectionName: sanitizeString(generator[CONNECTIVITY]?.[CONNECTION_NAME]),
                connectionDirection: generator[CONNECTIVITY]?.[CONNECTION_DIRECTION],
                connectionPosition: generator[CONNECTIVITY]?.[CONNECTION_POSITION],
                terminalConnected: generator[CONNECTIVITY]?.[CONNECTED],
                qPercent: generator[Q_PERCENT],
                plannedActivePowerSetPoint: generator[PLANNED_ACTIVE_POWER_SET_POINT],
                marginalCost: generator[MARGINAL_COST],
                plannedOutageRate: generator[PLANNED_OUTAGE_RATE],
                forcedOutageRate: generator[FORCED_OUTAGE_RATE],
                directTransX: generator[TRANSIENT_REACTANCE],
                stepUpTransformerX: generator[TRANSFORMER_REACTANCE],
                voltageRegulationType: generator[VOLTAGE_REGULATION_TYPE],
                regulatingTerminalId: isDistantRegulation ? generator[EQUIPMENT]?.id : null,
                regulatingTerminalType: isDistantRegulation ? generator[EQUIPMENT]?.type : null,
                regulatingTerminalVlId: isDistantRegulation ? generator[VOLTAGE_LEVEL]?.id : null,
                isReactiveCapabilityCurveOn: isReactiveCapabilityCurveOn,
                participate: generator[FREQUENCY_REGULATION],
                droop: generator[DROOP],
                maxQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MAXIMUM_REACTIVE_POWER],
                minQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MINIMUM_REACTIVE_POWER],
                reactiveCapabilityCurve: isReactiveCapabilityCurveOn
                    ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
                    : null,
                properties: toModificationProperties(generator),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GeneratorModificationError',
                });
            });
        },
        [selectedId, getPreviousRegulationType, studyUuid, currentNodeUuid, editData?.uuid, snackError]
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
                aria-labelledby="dialog-modification-generator"
                maxWidth={'md'}
                titleId="ModifyGenerator"
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.GENERATOR}
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
};

export default GeneratorModificationDialog;
