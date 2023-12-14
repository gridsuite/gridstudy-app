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
import { AnyObject, TestContext, TestFunction } from 'yup';

export const EQUIPMENTS_FIELDS = {
    [EQUIPMENT_TYPES.GENERATOR]: [
        { id: 'RATED_NOMINAL_POWER', label: 'RatedNominalPowerText' },
        { id: 'MINIMUM_ACTIVE_POWER', label: 'MinimumActivePowerText' },
        { id: 'MAXIMUM_ACTIVE_POWER', label: 'MaximumActivePowerText' },
        { id: 'ACTIVE_POWER_SET_POINT', label: 'ActivePowerText' },
        { id: 'REACTIVE_POWER_SET_POINT', label: 'ReactivePowerText' },
        { id: 'VOLTAGE_SET_POINT', label: 'GeneratorTargetV' },
        {
            id: 'PLANNED_ACTIVE_POWER_SET_POINT',
            label: 'PlannedActivePowerSetPointForm',
        },
        { id: 'MARGINAL_COST', label: 'StartupCost' },
        { id: 'PLANNED_OUTAGE_RATE', label: 'PlannedOutageRate' },
        { id: 'FORCED_OUTAGE_RATE', label: 'ForcedOutageRate' },
        { id: 'DROOP', label: 'ActivePowerRegulationDroop' },
        { id: 'TRANSIENT_REACTANCE', label: 'TransientReactanceForm' },
        {
            id: 'STEP_UP_TRANSFORMER_REACTANCE',
            label: 'TransformerReactanceForm',
        },
        { id: 'Q_PERCENT', label: 'ReactivePercentageVoltageRegulation' },
    ],
    [EQUIPMENT_TYPES.BATTERY]: [
        { id: 'MINIMUM_ACTIVE_POWER', label: 'MinimumActivePowerText' },
        { id: 'MAXIMUM_ACTIVE_POWER', label: 'MaximumActivePowerText' },
        { id: 'ACTIVE_POWER_SET_POINT', label: 'ActivePowerText' },
        { id: 'REACTIVE_POWER_SET_POINT', label: 'ReactivePowerText' },
        { id: 'DROOP', label: 'Droop' },
    ],
    [EQUIPMENT_TYPES.SHUNT_COMPENSATOR]: [
        { id: 'MAXIMUM_SECTION_COUNT', label: 'MaximumSectionCount' },
        { id: 'SECTION_COUNT', label: 'ShuntSectionCount' },
        { id: 'MAXIMUM_SUSCEPTANCE', label: 'MaxShuntSusceptance' },
        { id: 'MAXIMUM_Q_AT_NOMINAL_VOLTAGE', label: 'maxQAtNominalV' },
    ],
    [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: [
        { id: 'NOMINAL_VOLTAGE', label: 'NominalVoltage' },
        { id: 'LOW_VOLTAGE_LIMIT', label: 'LowVoltageLimit' },
        { id: 'HIGH_VOLTAGE_LIMIT', label: 'HighVoltageLimit' },
        {
            id: 'LOW_SHORT_CIRCUIT_CURRENT_LIMIT',
            label: 'LowShortCircuitCurrentLimit',
        },
        {
            id: 'HIGH_SHORT_CIRCUIT_CURRENT_LIMIT',
            label: 'HighShortCircuitCurrentLimit',
        },
    ],
    [EQUIPMENT_TYPES.LOAD]: [
        { id: 'ACTIVE_POWER', label: 'ActivePowerText' },
        { id: 'REACTIVE_POWER', label: 'ReactivePowerText' },
    ],
    [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]: [
        { id: 'SERIES_RESISTANCE', label: 'SeriesResistanceText' },
        { id: 'SERIES_REACTANCE', label: 'SeriesReactanceText' },
        { id: 'MAGNETIZING_CONDUCTANCE', label: 'MagnetizingConductance' },
        { id: 'MAGNETIZING_SUSCEPTANCE', label: 'MagnetizingSusceptance' },
        { id: 'RATED_VOLTAGE_1', label: 'RatedVoltage1' },
        { id: 'RATED_VOLTAGE_2', label: 'RatedVoltage2' },
        { id: 'RATED_S', label: 'RatedNominalPowerText' },
        { id: 'TARGET_V', label: 'RatioTargetV' },
        { id: 'RATIO_LOW_TAP_POSITION', label: 'RatioLowTapPosition' },
        { id: 'RATIO_TAP_POSITION', label: 'RatioTapPosition' },
        { id: 'RATIO_TARGET_DEADBAND', label: 'RatioDeadBand' },
        { id: 'REGULATION_VALUE', label: 'PhaseRegulatingValue' },
        { id: 'PHASE_LOW_TAP_POSITION', label: 'PhaseLowTapPosition' },
        { id: 'PHASE_TAP_POSITION', label: 'PhaseTapPosition' },
        { id: 'PHASE_TARGET_DEADBAND', label: 'PhaseDeadBand' },
    ],
};

function isValueInEquipmentFields(context: TestContext<AnyObject>, value: any) {
    // this will return the highest level parent, so we can get the equipment type
    const parent = context.from?.[context.from.length - 1];
    const equipmentType = parent?.value?.[EQUIPMENT_TYPE_FIELD];
    return parent
        ? EQUIPMENTS_FIELDS[equipmentType]?.some(
              (field: { id: string; label: string }) => field.id === value
          )
        : false;
}

const checkValueInEquipmentFieldsOrNumeric: TestFunction<any, AnyObject> = (
    value,
    context
) => {
    const newValue = value.replace(',', '.');
    if (!isNaN(parseFloat(newValue))) {
        return true;
    }

    return isValueInEquipmentFields(context, value);
};

const checkValueInEquipmentFields: TestFunction<any, AnyObject> = (
    value,
    context
) => {
    return isValueInEquipmentFields(context, value);
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
                [OPERATOR]: yup.string().required(),
                [REFERENCE_FIELD_OR_VALUE_1]: yup
                    .mixed()
                    .required()
                    .test(
                        'checkRefOrValue',
                        'WrongRefOrValueError',
                        checkValueInEquipmentFieldsOrNumeric
                    )
                    .when([OPERATOR], {
                        is: 'PERCENTAGE',
                        then: (schema) =>
                            schema.test(
                                'checkValueIsReference',
                                'ValueMustBeNumericWhenPercentageError',
                                (value: any) =>
                                    !isNaN(parseFloat(value)) &&
                                    parseFloat(value) >= 0
                            ),
                    }),
                [REFERENCE_FIELD_OR_VALUE_2]: yup
                    .mixed()
                    .required()
                    .test(
                        'checkRefOrValue',
                        'WrongRefOrValueError',
                        checkValueInEquipmentFieldsOrNumeric
                    )
                    .when([OPERATOR], {
                        is: 'PERCENTAGE',
                        then: (schema) =>
                            schema.test(
                                'checkValueIsReference',
                                'ValueMustBeRefWhenPercentageError',
                                checkValueInEquipmentFields
                            ),
                    }),
            })
        ),
    };
}
