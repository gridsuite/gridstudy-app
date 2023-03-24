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

export function assignValuesToForm(editData) {
    // the reactive capability table values are assigned when retrieving previous values

    const customEditData = {
        [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
        [ENERGY_SOURCE]: editData?.energySource?.value ?? null,
        [MAXIMUM_ACTIVE_POWER]: editData?.maxActivePower?.value ?? null,
        [MINIMUM_ACTIVE_POWER]: editData?.minActivePower?.value ?? null,
        [RATED_NOMINAL_POWER]: editData?.ratedNominalPower?.value ?? null,
        [ACTIVE_POWER_SET_POINT]: editData?.activePowerSetpoint?.value ?? null,
        [VOLTAGE_REGULATION]: editData?.voltageRegulationOn?.value ?? null,
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
        [VOLTAGE_LEVEL]: editData?.regulatingTerminalVlId?.value
            ? {
                  id: editData?.regulatingTerminalVlId?.value,
              }
            : null,
        [EQUIPMENT]: editData?.regulatingTerminalId?.value
            ? {
                  id: editData?.regulatingTerminalId?.value ?? null,
                  type: editData?.regulatingTerminalType?.value ?? null,
              }
            : null,
    };

    if (editData?.reactiveCapabilityCurvePoints?.length > 0) {
        const rcc = editData.reactiveCapabilityCurvePoints.map((point) => {
            return {
                [P]: point.p,
                [Q_MAX_P]: point.qmaxP,
                [Q_MIN_P]: point.qminP,
                [PREVIOUS_Q_MAX_P]: point.oldQmaxP ?? point.qmaxP,
                [PREVIOUS_Q_MIN_P]: point.oldQminP ?? point.qminP,
                [PREVIOUS_P]: point.oldP ?? point.p,
            };
        });
        const tableData = { [REACTIVE_CAPABILITY_CURVE_TABLE]: rcc };
        return {
            ...customEditData,
            ...tableData,
        };
    }

    return {
        ...customEditData,
    };
}

export const assignPreviousValuesToForm = (
    generator,
    watchEquipmentId,
    intl
) => {
    // when editing modification form, first render should not trigger this reset
    // which would empty the form instead of displaying data of existing form
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

    const previousEquipment =
        generator?.regulatingTerminalConnectableId &&
        generator?.regulatingTerminalConnectableType
            ? generator?.regulatingTerminalConnectableType +
              ':' +
              generator?.regulatingTerminalConnectableId
            : null;
    return {
        [EQUIPMENT_ID]: watchEquipmentId,
        [REACTIVE_CAPABILITY_CURVE_TABLE]: reactiveCapabilityCurvePoints,
        [REACTIVE_CAPABILITY_CURVE_CHOICE]:
            generator?.minMaxReactiveLimits != null ? 'MINMAX' : 'CURVE',
        [VOLTAGE_REGULATION]: generator?.voltageRegulatorOn
            ? generator?.voltageRegulatorOn
            : null,
        [FREQUENCY_REGULATION]: generator?.activePowerControlOn,
        [PREVIOUS_VOLTAGE_LEVEL]: generator?.regulatingTerminalVlId ?? null,
        [PREVIOUS_EQUIPMENT]: previousEquipment,
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
        [PREVIOUS_VOLTAGE_REGULATION]: getPreviousBooleanValue(
            generator?.voltageRegulatorOn
        ),
        [PREVIOUS_REACTIVE_POWER_SET_POINT]: generator.targetQ,
        [PREVIOUS_VOLTAGE_SET_POINT]: generator?.targetV,
        [PREVIOUS_VOLTAGE_REGULATION_TYPE]: previousVoltageRegulationType,
        [PREVIOUS_FREQUENCY_REGULATION]: previousFrequencyRegulationState,
        [PREVIOUS_DROOP]: generator?.droop,
    };
};

export const getPreviousValuesEmptyForm = () => {
    return {
        [PREVIOUS_VOLTAGE_LEVEL]: null,
        [PREVIOUS_EQUIPMENT]: null,
        [PREVIOUS_EQUIPMENT_NAME]: null,
        [PREVIOUS_ENERGY_SOURCE]: null,
        [PREVIOUS_MAXIMUM_ACTIVE_POWER]: null,
        [PREVIOUS_MINIMUM_ACTIVE_POWER]: null,
        [PREVIOUS_MAXIMUM_REACTIVE_POWER]: null,
        [PREVIOUS_MINIMUM_REACTIVE_POWER]: null,
        [PREVIOUS_RATED_NOMINAL_POWER]: null,
        [PREVIOUS_TRANSIENT_REACTANCE]: null,
        [PREVIOUS_TRANSFORMER_REACTANCE]: null,
        [PREVIOUS_PLANNED_ACTIVE_POWER_SET_POINT]: null,
        [PREVIOUS_STARTUP_COST]: null,
        [PREVIOUS_MARGINAL_COST]: null,
        [PREVIOUS_PLANNED_OUTAGE_RATE]: null,
        [PREVIOUS_FORCED_OUTAGE_RATE]: null,
        [PREVIOUS_ACTIVE_POWER_SET_POINT]: null,
        [PREVIOUS_VOLTAGE_REGULATION]: null,
        [PREVIOUS_REACTIVE_POWER_SET_POINT]: null,
        [PREVIOUS_VOLTAGE_SET_POINT]: null,
        [PREVIOUS_VOLTAGE_REGULATION_TYPE]: null,
        [PREVIOUS_FREQUENCY_REGULATION]: null,
        [PREVIOUS_DROOP]: null,
    };
};
