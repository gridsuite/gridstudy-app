import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    ID,
    NAME,
    OPERATOR,
    REFERENCE_FIELD_OR_VALUE_1,
    REFERENCE_FIELD_OR_VALUE_2,
    SPECIFIC_METADATA,
    TYPE,
} from '../../../../utils/field-constants';
import yup from 'components/utils/yup-config';
import { AnyObject, TestFunction } from 'yup';

export const EQUIPMENTS_FIELDS = {
    [EQUIPMENT_TYPES.GENERATOR]: [
        { id: 'RATED_NOMINAL_POWER', label: 'RatedNominalPowerText' },
        { id: 'MINIMUM_ACTIVE_POWER', label: 'MinimumActivePowerText' },
        { id: 'MAXIMUM_ACTIVE_POWER', label: 'MaximumActivePowerText' },
        { id: 'ACTIVE_POWER_SET_POINT', label: 'ActivePowerText' },
        { id: 'REACTIVE_POWER_SET_POINT', label: 'ReactivePowerText' },
        { id: 'VOLTAGE_SET_POINT', label: 'VoltageText' },
        {
            id: 'PLANNED_ACTIVE_POWER_SET_POINT',
            label: 'PlannedActivePowerSetPointForm',
        },
        { id: 'MARGINAL_COST', label: 'MarginalCost' },
        { id: 'PLANNED_OUTAGE_RATE', label: 'PlannedOutageRate' },
        { id: 'FORCED_OUTAGE_RATE', label: 'ForcedOutageRate' },
        { id: 'DROOP', label: 'Droop' },
        { id: 'TRANSIENT_REACTANCE', label: 'TransientReactanceForm' },
        {
            id: 'STEP_UP_TRANSFORMER_REACTANCE',
            label: 'TransformerReactanceForm',
        },
        { id: 'Q_PERCENT', label: 'QPercentText' },
    ],
    [EQUIPMENT_TYPES.BATTERY]: [
        { id: 'MINIMUM_ACTIVE_POWER', label: 'MinimumActivePowerText' },
        { id: 'MAXIMUM_ACTIVE_POWER', label: 'MaximumActivePowerText' },
        { id: 'ACTIVE_POWER_SET_POINT', label: 'ActivePowerText' },
        { id: 'REACTIVE_POWER_SET_POINT', label: 'ReactivePowerText' },
        { id: 'DROOP', label: 'Droop' },
    ],
};

export const checkValueInEquipmentFields: TestFunction<any, AnyObject> = (
    value,
    context
) => {
    if (!isNaN(parseFloat(value))) {
        return true;
    }

    // this will return the highest level parent, so we can get the equipment type
    const parent = context.from?.[context.from.length - 1];
    const equipmentType = parent?.value?.[EQUIPMENT_TYPE_FIELD];
    return parent
        ? EQUIPMENTS_FIELDS[equipmentType]?.some(
              (field: { id: string; label: string }) => field.id === value
          )
        : false;
};

export const getFormulaInitialValue = () => ({
    [FILTERS]: [],
    [EDITED_FIELD]: null,
    [REFERENCE_FIELD_OR_VALUE_1]: null,
    [OPERATOR]: null,
    [REFERENCE_FIELD_OR_VALUE_2]: null,
});

export function getFormulaSchema(id: string) {
    return {
        [id]: yup.array().of(
            yup.object().shape({
                [FILTERS]: yup
                    .array()
                    .of(
                        yup.object().shape({
                            [ID]: yup.string().required(),
                            [NAME]: yup.string().required(),
                            [SPECIFIC_METADATA]: yup.object().shape({
                                [TYPE]: yup.string(),
                            }),
                        })
                    )
                    .required()
                    .min(1, 'FieldIsRequired'),
                [EDITED_FIELD]: yup.string().required(),
                [REFERENCE_FIELD_OR_VALUE_1]: yup
                    .mixed()
                    .required()
                    .test(
                        'checkRefOrValue',
                        'WrongRefOrValueError',
                        checkValueInEquipmentFields
                    ),
                [REFERENCE_FIELD_OR_VALUE_2]: yup
                    .mixed()
                    .required()
                    .test(
                        'checkRefOrValue',
                        'WrongRefOrValueError',
                        checkValueInEquipmentFields
                    ),
                [OPERATOR]: yup.string().required(),
            })
        ),
    };
}
