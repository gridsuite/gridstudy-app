/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../commons/modificationDialog';
import { useCallback, useEffect, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import {
    ACTIVE_POWER_CONTROL_ON,
    ACTIVE_POWER_SET_POINT,
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
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_POWER_SET_POINT,
    STARTUP_COST,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_ON,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../utils/field-constants';

import { modifyGenerator } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import { REGULATION_TYPES } from '../../../network/constants';
import GeneratorModificationForm from './generator-modification-form';
import {
    getSetPointsEmptyFormData,
    getSetPointsSchema,
} from '../generator-creation/set-points/set-points-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsSchema,
} from '../generator-creation/reactive-limits/reactive-limits-utils';
import { getRegulatingTerminalFormData } from '../regulating-terminal/regulating-terminal-form-utils';
const emptyFormData = {
    [EQUIPMENT_ID]: null,
    [EQUIPMENT_NAME]: '',
    [ENERGY_SOURCE]: null,
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [RATED_NOMINAL_POWER]: null,
    [TRANSIENT_REACTANCE]: null,
    [TRANSFORMER_REACTANCE]: null,
    [PLANNED_ACTIVE_POWER_SET_POINT]: null,
    [STARTUP_COST]: null,
    [MARGINAL_COST]: null,
    [PLANNED_OUTAGE_RATE]: null,
    [FORCED_OUTAGE_RATE]: null,
    ...getSetPointsEmptyFormData(true),
    ...getReactiveLimitsEmptyFormData(),
};

const GeneratorModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [clearOnlyId, setClearOnlyId] = useState(false);
    const schema = yup
        .object()
        .shape(
            {
                [EQUIPMENT_ID]: yup.string().required(),
                [EQUIPMENT_NAME]: yup.string(),
                [ENERGY_SOURCE]: yup.string().nullable(),
                [MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
                [MINIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
                [RATED_NOMINAL_POWER]: yup.number().nullable(),
                [TRANSIENT_REACTANCE]: yup.number().nullable(),
                [TRANSFORMER_REACTANCE]: yup.number().nullable(),
                [PLANNED_ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
                [STARTUP_COST]: yup.number().nullable(),
                [MARGINAL_COST]: yup.number().nullable(),
                [PLANNED_OUTAGE_RATE]: yup
                    .number()
                    .nullable()
                    .min(0, 'RealPercentage')
                    .max(1, 'RealPercentage'),
                [FORCED_OUTAGE_RATE]: yup
                    .number()
                    .nullable()
                    .min(0, 'RealPercentage')
                    .max(1, 'RealPercentage'),
                ...getSetPointsSchema(true),
                ...getReactiveLimitsSchema(editData ? false : true),
            },
            [MAXIMUM_REACTIVE_POWER, MINIMUM_REACTIVE_POWER]
        )
        .required();
    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });
    const { reset, getValues } = methods;

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    useEffect(() => {
        if (editData) {
            setClearOnlyId(true);
            reset({
                [EQUIPMENT_ID]: editData?.equipmentId,
                [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                [ENERGY_SOURCE]: editData?.energySource?.value,
                [MAXIMUM_ACTIVE_POWER]: editData?.maxActivePower?.value,
                [MINIMUM_ACTIVE_POWER]: editData?.minActivePower?.value,
                [RATED_NOMINAL_POWER]: editData?.ratedNominalPower?.value,
                [ACTIVE_POWER_SET_POINT]: editData?.activePowerSetpoint?.value,
                [VOLTAGE_REGULATION]:
                    editData?.voltageRegulationOn?.value ?? null,
                [VOLTAGE_SET_POINT]: editData?.voltageSetpoint?.value,
                [REACTIVE_POWER_SET_POINT]:
                    editData?.reactivePowerSetpoint?.value,
                [PLANNED_ACTIVE_POWER_SET_POINT]:
                    editData?.plannedActivePowerSetPoint?.value,
                [STARTUP_COST]: editData?.startupCost?.value,
                [MARGINAL_COST]: editData?.marginalCost?.value,
                [PLANNED_OUTAGE_RATE]: editData?.plannedOutageRate?.value,
                [FORCED_OUTAGE_RATE]: editData?.forcedOutageRate?.value,
                [FREQUENCY_REGULATION]: editData?.participate?.value ?? null,
                [DROOP]: editData?.droop?.value,
                [TRANSIENT_REACTANCE]: editData?.transientReactance?.value,
                [TRANSFORMER_REACTANCE]:
                    editData?.stepUpTransformerReactance?.value,
                [VOLTAGE_REGULATION_TYPE]: editData?.regulatingTerminalId
                    ? REGULATION_TYPES.DISTANT.id
                    : REGULATION_TYPES.LOCAL.id,
                [MINIMUM_REACTIVE_POWER]: editData?.minimumReactivePower?.value,
                [MAXIMUM_REACTIVE_POWER]: editData?.maximumReactivePower?.value,
                [Q_PERCENT]: editData?.qPercent?.value,
                [REACTIVE_CAPABILITY_CURVE_CHOICE]:
                    editData?.minimumReactivePower ||
                    editData?.maximumReactivePower
                        ? 'MINMAX'
                        : 'CURVE',
                [REACTIVE_CAPABILITY_CURVE_TABLE]:
                    editData?.reactiveCapabilityCurvePoints ?? [{}, {}],
                ...getRegulatingTerminalFormData({
                    equipmentId: editData?.regulatingTerminalId?.value,
                    equipmentType: editData?.regulatingTerminalType?.value,
                    voltageLevelId: editData?.regulatingTerminalVlId?.value,
                }),
            });
        }
    }, [editData, reset]);

    const calculateCurvePointsToStore = useCallback(() => {
        const rows = getValues([REACTIVE_CAPABILITY_CURVE_TABLE]);
        const displayedPreviousValues = editData?.reactiveCapabilityCurvePoints;
        if (
            displayedPreviousValues &&
            rows?.length === displayedPreviousValues.length &&
            rows[0].filter(
                (point, index) =>
                    point[index].p !== '' ||
                    point[index].qminP !== '' ||
                    point[index].qmaxP !== ''
            ).length === 0
        ) {
            return null;
        } else {
            const pointsToStore = [];
            rows[0].forEach((point, index) => {
                if (point) {
                    let pointToStore = {
                        p: point.p,
                        oldP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.oldP
                                : null,
                        qminP: point.qminP,
                        oldQminP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.oldQminP
                                : null,
                        qmaxP: point.qmaxP,
                        oldQmaxP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.oldQmaxP
                                : null,
                    };

                    pointsToStore.push(pointToStore);
                }
            });
            return pointsToStore;
        }
    }, [editData?.reactiveCapabilityCurvePoints, getValues]);

    const onSubmit = useCallback(
        (generator) => {
            const buildCurvePointsToStore = calculateCurvePointsToStore();

            const isFrequencyRegulationOn =
                generator[FREQUENCY_REGULATION] === true ||
                (generator[FREQUENCY_REGULATION] === null &&
                    generator[ACTIVE_POWER_CONTROL_ON] === true);

            const isVoltageRegulationOn =
                generator[VOLTAGE_REGULATION] === true ||
                (generator[VOLTAGE_REGULATION] === null &&
                    generator[VOLTAGE_REGULATION_ON] === true);

            const isReactiveCapabilityCurveOn =
                generator[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';

            const isDistantRegulation =
                generator[VOLTAGE_REGULATION] &&
                generator[VOLTAGE_REGULATION_TYPE] ===
                    REGULATION_TYPES.DISTANT.id;

            modifyGenerator(
                studyUuid,
                currentNodeUuid,
                generator[EQUIPMENT_ID],
                sanitizeString(generator[EQUIPMENT_NAME]),
                generator[ENERGY_SOURCE],
                generator[MINIMUM_ACTIVE_POWER],
                generator[MAXIMUM_ACTIVE_POWER],
                generator[RATED_NOMINAL_POWER],
                generator[ACTIVE_POWER_SET_POINT],
                !isVoltageRegulationOn
                    ? generator[REACTIVE_POWER_SET_POINT]
                    : null,
                generator[VOLTAGE_REGULATION],

                isVoltageRegulationOn ? generator[VOLTAGE_SET_POINT] : null,
                undefined,
                undefined,
                editData?.uuid,
                isVoltageRegulationOn && isDistantRegulation
                    ? generator[Q_PERCENT]
                    : null,
                generator[PLANNED_ACTIVE_POWER_SET_POINT] ?? null,
                generator[STARTUP_COST] ?? null,
                generator[MARGINAL_COST] ?? null,
                generator[PLANNED_OUTAGE_RATE] ?? null,
                generator[FORCED_OUTAGE_RATE] ?? null,
                generator[TRANSIENT_REACTANCE] ?? null,
                generator[TRANSFORMER_REACTANCE] ?? null,
                generator[VOLTAGE_REGULATION_TYPE],
                isVoltageRegulationOn && isDistantRegulation
                    ? generator[EQUIPMENT]?.id
                    : null,
                isVoltageRegulationOn && isDistantRegulation
                    ? generator[EQUIPMENT]?.type
                    : null,
                isVoltageRegulationOn && isDistantRegulation
                    ? generator[VOLTAGE_LEVEL]?.id
                    : null,
                isReactiveCapabilityCurveOn,
                generator[FREQUENCY_REGULATION],
                isFrequencyRegulationOn ? generator[DROOP] : null,
                isReactiveCapabilityCurveOn
                    ? null
                    : generator[MAXIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? null
                    : generator[MINIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn ? buildCurvePointsToStore : null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GeneratorModificationError',
                });
            });
        },
        [
            calculateCurvePointsToStore,
            studyUuid,
            currentNodeUuid,
            editData?.uuid,
            snackError,
        ]
    );

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modification-generator"
                maxWidth={'md'}
                titleId="ModifyGenerator"
                {...dialogProps}
            >
                <GeneratorModificationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    defaultIdValue={defaultIdValue}
                    clearOnlyId={clearOnlyId}
                    editData={editData}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorModificationDialog;
