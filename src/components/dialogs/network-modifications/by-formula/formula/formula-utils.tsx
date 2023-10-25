import { EQUIPMENT_TYPES } from "../../../../utils/equipment-types";

export const EQUIPMENTS_FIELDS = {
  [EQUIPMENT_TYPES.GENERATOR]: [
    {id: 'MINIMUM_ACTIVE_POWER', label: 'MinimumActivePowerText'},
    {id: 'MAXIMUM_ACTIVE_POWER', label: 'MaximumActivePowerText'},
    {id: 'RATED_NOMINAL_POWER', label: 'RatedNominalPowerText'},
    {id: 'ACTIVE_POWER_SET_POINT', label: 'ActivePowerText'},
    {id: 'REACTIVE_POWER_SET_POINT', label: 'ReactivePowerText'},
    {id: 'VOLTAGE_SET_POINT', label: 'VoltageText'},
    {id: 'PLANNED_ACTIVE_POWER_SET_POINT', label: 'PlannedActivePowerSetPointForm'},
    {id: 'MARGINAL_COST', label: 'MarginalCost'},
    {id: 'PLANNED_OUTAGE_RATE', label: 'PlannedOutageRate'},
    {id: 'FORCED_OUTAGE_RATE', label: 'ForcedOutageRate'},
    {id: 'DROOP', label: 'Droop'},
    {id: 'TRANSIENT_REACTANCE', label: 'TransientReactanceForm'},
    {id: 'STEP_UP_TRANSFORMER_REACTANCE', label: 'TransformerReactanceForm'},
    {id: 'Q_PERCENT', label: 'QPercentText'}
  ],
  [EQUIPMENT_TYPES.BATTERY]: [
    {id: 'MINIMUM_ACTIVE_POWER', label: 'MinimumActivePowerText'},
    {id: 'MAXIMUM_ACTIVE_POWER', label: 'MaximumActivePowerText'},
    {id: 'ACTIVE_POWER_SET_POINT', label: 'ActivePowerText'},
    {id: 'REACTIVE_POWER_SET_POINT', label: 'ReactivePowerText'},
    {id: 'DROOP', label: 'Droop'}
  ]
}