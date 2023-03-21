import {
    ACTIVE_POWER_SET_POINT,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT,
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
    RATED_NOMINAL_POWER,
    REACTIVE_POWER_SET_POINT,
    STARTUP_COST,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/refactor/utils/field-constants';
import { getPreviousValueFieldName } from 'components/refactor/utils/utils';

export const PREVIOUS_EQUIPMENT_NAME =
    getPreviousValueFieldName(EQUIPMENT_NAME);
export const PREVIOUS_ENERGY_SOURCE = getPreviousValueFieldName(ENERGY_SOURCE);
export const PREVIOUS_MAXIMUM_ACTIVE_POWER =
    getPreviousValueFieldName(MAXIMUM_ACTIVE_POWER);
export const PREVIOUS_MINIMUM_ACTIVE_POWER =
    getPreviousValueFieldName(MINIMUM_ACTIVE_POWER);
export const PREVIOUS_MAXIMUM_REACTIVE_POWER = getPreviousValueFieldName(MAXIMUM_REACTIVE_POWER);
export const PREVIOUS_MINIMUM_REACTIVE_POWER = getPreviousValueFieldName(MINIMUM_REACTIVE_POWER);    
export const PREVIOUS_RATED_NOMINAL_POWER = getPreviousValueFieldName(
    RATED_NOMINAL_POWER
)
export const PREVIOUS_TRANSIENT_REACTANCE= getPreviousValueFieldName(
    TRANSIENT_REACTANCE
)

export const PREVIOUS_TRANSFORMER_REACTANCE= getPreviousValueFieldName(
    TRANSFORMER_REACTANCE
)

export const PREVIOUS_PLANNED_ACTIVE_POWER_SET_POINT = getPreviousValueFieldName(
    PLANNED_ACTIVE_POWER_SET_POINT
)

export const PREVIOUS_STARTUP_COST = getPreviousValueFieldName(STARTUP_COST)
export const PREVIOUS_MARGINAL_COST = getPreviousValueFieldName(MARGINAL_COST)
export const PREVIOUS_PLANNED_OUTAGE_RATE = getPreviousValueFieldName(
    PLANNED_OUTAGE_RATE
)
export const PREVIOUS_FORCED_OUTAGE_RATE = getPreviousValueFieldName(
    FORCED_OUTAGE_RATE
)
export const PREVIOUS_ACTIVE_POWER_SET_POINT= getPreviousValueFieldName(
    ACTIVE_POWER_SET_POINT
)
export const PREVIOUS_VOLTAGE_REGULATION = getPreviousValueFieldName(
    VOLTAGE_REGULATION
)

export const PREVIOUS_REACTIVE_POWER_SET_POINT = getPreviousValueFieldName(
    REACTIVE_POWER_SET_POINT
)

export const PREVIOUS_VOLTAGE_REGULATION_TYPE = getPreviousValueFieldName(
    VOLTAGE_REGULATION_TYPE
)

export const PREVIOUS_P = getPreviousValueFieldName(P);
export const PREVIOUS_Q_MIN_P = getPreviousValueFieldName(Q_MIN_P);
export const PREVIOUS_Q_MAX_P = getPreviousValueFieldName(Q_MAX_P);
export const PREVIOUS_FREQUENCY_REGULATION = getPreviousValueFieldName(FREQUENCY_REGULATION);
export const PREVIOUS_VOLTAGE_LEVEL = getPreviousValueFieldName(VOLTAGE_LEVEL)
export const PREVIOUS_EQUIPMENT = getPreviousValueFieldName(EQUIPMENT)
export const PREVIOUS_DROOP = getPreviousValueFieldName(DROOP);
export const PREVIOUS_VOLTAGE_SET_POINT = getPreviousValueFieldName(VOLTAGE_SET_POINT)