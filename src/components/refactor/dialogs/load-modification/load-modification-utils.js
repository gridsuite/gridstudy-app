import {
    ACTIVE_POWER,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER,
} from '../../utils/field-constants';
import { getPreviousValueFieldName } from '../../utils/utils';

const NAME_PREVIOUS_VALUE = getPreviousValueFieldName(EQUIPMENT_NAME);
const TYPE_PREVIOUS_VALUE = getPreviousValueFieldName(LOAD_TYPE);
const ACTIVE_POWER_PREVIOUS_VALUE = getPreviousValueFieldName(ACTIVE_POWER);
const REACTIVE_POWER_PREVIOUS_VALUE = getPreviousValueFieldName(REACTIVE_POWER);

export const getPreviousValues = ({
    id = null,
    name = '',
    type = null,
    activePower = null,
    reactivePower = null,
}) => {
    return {
        [EQUIPMENT_ID]: id,
        [NAME_PREVIOUS_VALUE]: name,
        [TYPE_PREVIOUS_VALUE]: type,
        [ACTIVE_POWER_PREVIOUS_VALUE]: activePower,
        [REACTIVE_POWER_PREVIOUS_VALUE]: reactivePower,
    };
};
