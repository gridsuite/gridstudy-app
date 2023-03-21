import {
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
    P,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_MAX_P,
    Q_MIN_P,
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
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/refactor/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { getPreviousValueFieldName } from 'components/refactor/utils/utils';
import {
    getEnergySourceLabel,
    REGULATION_TYPES,
} from '../../../../network/constants';
import { getModificationRowEmptyFormData } from '../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import yup from '../../../utils/yup-config';
import { getSetPointsSchema } from '../set-points/set-points-utils';
import { getReactiveLimitsSchema } from '../reactive-limits/reactive-limits-utils';
import { getRegulatingTerminalFormData } from '../../regulating-terminal/regulating-terminal-form-utils';

export const PREVIOUS_EQUIPMENT_NAME =
    getPreviousValueFieldName(EQUIPMENT_NAME);
export const PREVIOUS_ENERGY_SOURCE = getPreviousValueFieldName(ENERGY_SOURCE);
export const PREVIOUS_MAXIMUM_ACTIVE_POWER =
    getPreviousValueFieldName(MAXIMUM_ACTIVE_POWER);
export const PREVIOUS_MINIMUM_ACTIVE_POWER =
    getPreviousValueFieldName(MINIMUM_ACTIVE_POWER);
export const PREVIOUS_MAXIMUM_REACTIVE_POWER = getPreviousValueFieldName(
    MAXIMUM_REACTIVE_POWER
);
export const PREVIOUS_MINIMUM_REACTIVE_POWER = getPreviousValueFieldName(
    MINIMUM_REACTIVE_POWER
);
export const PREVIOUS_RATED_NOMINAL_POWER =
    getPreviousValueFieldName(RATED_NOMINAL_POWER);
export const PREVIOUS_TRANSIENT_REACTANCE =
    getPreviousValueFieldName(TRANSIENT_REACTANCE);

export const PREVIOUS_TRANSFORMER_REACTANCE = getPreviousValueFieldName(
    TRANSFORMER_REACTANCE
);

export const PREVIOUS_PLANNED_ACTIVE_POWER_SET_POINT =
    getPreviousValueFieldName(PLANNED_ACTIVE_POWER_SET_POINT);

export const PREVIOUS_STARTUP_COST = getPreviousValueFieldName(STARTUP_COST);
export const PREVIOUS_MARGINAL_COST = getPreviousValueFieldName(MARGINAL_COST);
export const PREVIOUS_PLANNED_OUTAGE_RATE =
    getPreviousValueFieldName(PLANNED_OUTAGE_RATE);
export const PREVIOUS_FORCED_OUTAGE_RATE =
    getPreviousValueFieldName(FORCED_OUTAGE_RATE);
export const PREVIOUS_ACTIVE_POWER_SET_POINT = getPreviousValueFieldName(
    ACTIVE_POWER_SET_POINT
);
export const PREVIOUS_VOLTAGE_REGULATION =
    getPreviousValueFieldName(VOLTAGE_REGULATION);

export const PREVIOUS_REACTIVE_POWER_SET_POINT = getPreviousValueFieldName(
    REACTIVE_POWER_SET_POINT
);

export const PREVIOUS_VOLTAGE_REGULATION_TYPE = getPreviousValueFieldName(
    VOLTAGE_REGULATION_TYPE
);

export const PREVIOUS_P = getPreviousValueFieldName(P);
export const PREVIOUS_Q_MIN_P = getPreviousValueFieldName(Q_MIN_P);
export const PREVIOUS_Q_MAX_P = getPreviousValueFieldName(Q_MAX_P);
export const PREVIOUS_FREQUENCY_REGULATION =
    getPreviousValueFieldName(FREQUENCY_REGULATION);
export const PREVIOUS_VOLTAGE_LEVEL = getPreviousValueFieldName(VOLTAGE_LEVEL);
export const PREVIOUS_EQUIPMENT = getPreviousValueFieldName(EQUIPMENT);
export const PREVIOUS_DROOP = getPreviousValueFieldName(DROOP);
export const PREVIOUS_VOLTAGE_SET_POINT =
    getPreviousValueFieldName(VOLTAGE_SET_POINT);

export const getPreviousBooleanValue = (isPreviousValueOn) => {
    return <FormattedMessage id={isPreviousValueOn ? 'On' : 'Off'} />;
};

export const getGeneratorEditDataForm = (
    editData,
    isSelectedGeneratorUndefined
) => {
    return {
        [EQUIPMENT_ID]: yup.string().nullable().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [ENERGY_SOURCE]: yup.string().nullable(),
        [MAXIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([], {
                is: () =>
                    isSelectedGeneratorUndefined && editData === undefined,
                then: (schema) => schema.required(),
            }),
        [MINIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([], {
                is: () =>
                    isSelectedGeneratorUndefined && editData === undefined,
                then: (schema) => schema.required(),
            }),
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
        ...getReactiveLimitsSchema(true),
    };
};

const completeReactiveCapabilityCurvePointsData = (
    reactiveCapabilityCurvePoints
) => {
    reactiveCapabilityCurvePoints.map((rcc) => {
        if (!(P in rcc)) {
            rcc[P] = null;
        }
        if (!(Q_MAX_P in rcc)) {
            rcc[Q_MAX_P] = null;
        }
        if (!(Q_MIN_P in rcc)) {
            rcc[Q_MIN_P] = null;
        }
        return rcc;
    });
    return reactiveCapabilityCurvePoints;
};

export function assignValuesToForm(editData) {
    console.log('testing editData assign : ', editData);
    console.log(
        'testing editData assign boolean',
        !!editData?.regulatingTerminalId?.value ||
            !!editData?.regulatingTerminalVlId?.value
    );
    const rcc =
        completeReactiveCapabilityCurvePointsData(
            editData?.reactiveCapabilityCurvePoints
        ) &&
        completeReactiveCapabilityCurvePointsData(
            editData?.reactiveCapabilityCurvePoints
        ).length > 0
            ? completeReactiveCapabilityCurvePointsData(
                  editData?.reactiveCapabilityCurvePoints
              )
            : [{}, {}];
    return {
        [EQUIPMENT_ID]: editData?.equipmentId,
        [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
        [ENERGY_SOURCE]: editData?.energySource?.value ?? null,
        [MAXIMUM_ACTIVE_POWER]: editData?.maxActivePower?.value ?? null,
        [MINIMUM_ACTIVE_POWER]: editData?.minActivePower?.value ?? null,
        [RATED_NOMINAL_POWER]: editData?.ratedNominalPower?.value ?? null,
        [ACTIVE_POWER_SET_POINT]: editData?.activePowerSetpoint?.value ?? null,
        [VOLTAGE_REGULATION]: editData?.voltageRegulationOn ?? null,
        [VOLTAGE_SET_POINT]: editData?.voltageSetpoint?.value ?? null,
        [REACTIVE_POWER_SET_POINT]:
            editData?.reactivePowerSetpoint?.value ?? null,
        [PLANNED_ACTIVE_POWER_SET_POINT]:
            editData?.plannedActivePowerSetPoint?.value ?? null,
        [STARTUP_COST]: editData?.startupCost?.value ?? null,
        [MARGINAL_COST]: editData?.marginalCost?.value ?? null,
        [PLANNED_OUTAGE_RATE]: editData?.plannedOutageRate?.value ?? null,
        [FORCED_OUTAGE_RATE]: editData?.forcedOutageRate?.value ?? null,
        [FREQUENCY_REGULATION]: editData?.participate?.value ?? null,
        [DROOP]: editData?.droop?.value ?? null,
        [TRANSIENT_REACTANCE]: editData?.transientReactance?.value ?? null,
        [TRANSFORMER_REACTANCE]:
            editData?.stepUpTransformerReactance?.value ?? null,
        [VOLTAGE_REGULATION_TYPE]:
            editData?.voltageRegulationType?.value ?? null,
        [MINIMUM_REACTIVE_POWER]: editData?.minimumReactivePower?.value ?? null,
        [MAXIMUM_REACTIVE_POWER]: editData?.maximumReactivePower?.value ?? null,
        [Q_PERCENT]: editData?.qPercent?.value ?? null,
        [REACTIVE_CAPABILITY_CURVE_CHOICE]:
            !editData?.reactiveCapabilityCurve?.value ||
            editData?.minimumReactivePower ||
            editData?.maximumReactivePower
                ? 'MINMAX'
                : 'CURVE',
        [REACTIVE_CAPABILITY_CURVE_TABLE]:
            rcc,
        ...getRegulatingTerminalFormData({
            equipmentId: editData?.regulatingTerminalId?.value,
            equipmentType: editData?.regulatingTerminalType?.value,
            voltageLevelId: editData?.regulatingTerminalVlId?.value,
        }),
    };
}

export const assignPreviousValuesToForm = (
    generator,
    watchEquipmentId,
    intl
) => {
    console.log('testing generator :', generator);
    // when editing modification form, first render should not trigger this reset
    // which would empty the form instead of displaying data of existing form
    //if (shouldEmptyFormOnGeneratorIdChangeRef?.current) {
    //creating empty table depending on existing generator
    let reactiveCapabilityCurvePoints = [
        getModificationRowEmptyFormData(),
        getModificationRowEmptyFormData(),
    ];
    if (generator?.reactiveCapabilityCurvePoints) {
        reactiveCapabilityCurvePoints = [];
    }
    generator?.reactiveCapabilityCurvePoints?.forEach((element) => {
        reactiveCapabilityCurvePoints.push({
            [P]: null,
            [Q_MIN_P]: null,
            [Q_MAX_P]: null,
            [PREVIOUS_P]: element.p ?? null,
            [PREVIOUS_Q_MIN_P]: element.qminP ?? null,
            [PREVIOUS_Q_MAX_P]: element.qmaxP ?? null,
        });
    });
    const energySourceLabelId = getEnergySourceLabel(generator?.energySource);
    const previousEnergySourceLabel = energySourceLabelId
        ? intl.formatMessage({
              id: energySourceLabelId,
          })
        : undefined;
    const previousVoltageRegulationType = generator?.voltageRegulatorOn
        ? generator?.regulatingTerminalVlId ||
          generator?.regulatingTerminalConnectableId
            ? intl.formatMessage({
                  id: REGULATION_TYPES.DISTANT.label,
              })
            : intl.formatMessage({ id: REGULATION_TYPES.LOCAL.label })
        : null;

    const previousFrequencyRegulationState = getPreviousBooleanValue(
        generator?.activePowerControlOn
    );

    return {
        [EQUIPMENT_ID]: watchEquipmentId,
        [REACTIVE_CAPABILITY_CURVE_TABLE]: reactiveCapabilityCurvePoints,
        [REACTIVE_CAPABILITY_CURVE_CHOICE]:
            generator?.minMaxReactiveLimits != null ? 'MINMAX' : 'CURVE',
        [VOLTAGE_REGULATION]: generator?.voltageRegulatorOn,
        [FREQUENCY_REGULATION]: generator?.activePowerControlOn,
        [VOLTAGE_REGULATION_TYPE]:
            generator?.regulatingTerminalVlId ||
            generator?.regulatingTerminalConnectableId
                ? REGULATION_TYPES.DISTANT.id
                : REGULATION_TYPES.LOCAL.id,
        [PREVIOUS_VOLTAGE_LEVEL]: generator?.regulatingTerminalVlId ?? null,
        [PREVIOUS_EQUIPMENT]:
            generator?.regulatingTerminalConnectableType +
                ':' +
                generator?.regulatingTerminalConnectableId ?? null,
        [PREVIOUS_EQUIPMENT_NAME]: generator?.name,
        [PREVIOUS_ENERGY_SOURCE]: previousEnergySourceLabel,
        [PREVIOUS_MAXIMUM_ACTIVE_POWER]: generator?.maxP,
        [PREVIOUS_MINIMUM_ACTIVE_POWER]: generator?.minP,
        [PREVIOUS_MAXIMUM_REACTIVE_POWER]:
            generator?.minMaxReactiveLimits?.maximumReactivePower,
        [PREVIOUS_MINIMUM_REACTIVE_POWER]:
            generator?.minMaxReactiveLimits?.minimumReactivePower,
        [PREVIOUS_RATED_NOMINAL_POWER]: generator?.ratedS,
        [PREVIOUS_TRANSIENT_REACTANCE]: generator?.transientReactance,
        [PREVIOUS_TRANSFORMER_REACTANCE]: generator?.stepUpTransformerReactance,
        [PREVIOUS_PLANNED_ACTIVE_POWER_SET_POINT]:
            generator?.plannedActivePowerSetPoint,
        [PREVIOUS_STARTUP_COST]: generator?.startupCost,
        [PREVIOUS_MARGINAL_COST]: generator?.marginalCost,
        [PREVIOUS_PLANNED_OUTAGE_RATE]: generator?.plannedOutageRate,
        [PREVIOUS_FORCED_OUTAGE_RATE]: generator?.forcedOutageRate,
        [PREVIOUS_ACTIVE_POWER_SET_POINT]: generator.targetP,
        [PREVIOUS_VOLTAGE_REGULATION]: generator?.voltageRegulatorOn,
        [PREVIOUS_REACTIVE_POWER_SET_POINT]: generator.targetQ,
        [PREVIOUS_VOLTAGE_SET_POINT]: generator?.targetV,
        [PREVIOUS_VOLTAGE_REGULATION_TYPE]: previousVoltageRegulationType,
        [PREVIOUS_FREQUENCY_REGULATION]: previousFrequencyRegulationState,
        [PREVIOUS_DROOP]: generator?.droop,
    };
};
