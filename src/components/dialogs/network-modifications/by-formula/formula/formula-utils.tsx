import { EQUIPMENT_TYPES } from "../../../../utils/equipment-types";

export const EQUIPMENTS_FIELDS = {
  [EQUIPMENT_TYPES.GENERATOR]: ['field1', 'field2', 'activePower'],
  [EQUIPMENT_TYPES.BATTERY]: ['activePower', 'minReactivePower', 'maxReactivePower']
}