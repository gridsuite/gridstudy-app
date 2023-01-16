import yup from '../../utils/yup-config';

export const VOLTAGE_LEVEL = 'voltageLevel';
export const VOLTAGE_LEVEL_ID = 'id';
export const VOLTAGE_LEVEL_NAME = 'name';
export const VOLTAGE_LEVEL_SUBSTATION_ID = 'substationId';
export const VOLTAGE_LEVEL_NOMINAL_VOLTAGE = 'nominalVoltage';
export const VOLTAGE_LEVEL_TOPOLOGY_KIND = 'topologyKind';
export const EQUIPMENT = 'equipment';
export const EQUIPMENT_TYPE = 'type';
export const EQUIPMENT_ID = 'equipmentId';
export const EQUIPMENT_NAME = 'equipmentName';

const regulatingTerminalValidationSchema = () => ({
    [VOLTAGE_LEVEL]: yup
        .object()
        .nullable()
        .required()
        .shape({
            [VOLTAGE_LEVEL_ID]: yup.string(),
            [VOLTAGE_LEVEL_NAME]: yup.string(),
            [VOLTAGE_LEVEL_SUBSTATION_ID]: yup.string(),
            [VOLTAGE_LEVEL_NOMINAL_VOLTAGE]: yup.string(),
            [VOLTAGE_LEVEL_TOPOLOGY_KIND]: yup.string().nullable(true),
        }),
    [EQUIPMENT]: yup
        .object()
        .nullable()
        .required()
        .shape({
            [EQUIPMENT_ID]: yup.string(),
            [EQUIPMENT_NAME]: yup.string(),
            [EQUIPMENT_TYPE]: yup.string(),
        }),
});

export const getRegulatingTerminalValidationSchema = () => {
    return regulatingTerminalValidationSchema();
};

const regulatingTerminalEmptyFormData = () => ({
    [VOLTAGE_LEVEL]: null,
    [EQUIPMENT]: null,
});

export const getRegulatingTerminalEmptyFormData = () => {
    return regulatingTerminalEmptyFormData();
};

export const getRegulatingTerminalFormData = ({
    voltageLevelId,
    equipmentId,
}) => ({
    [VOLTAGE_LEVEL]: voltageLevelId,
    [EQUIPMENT]: equipmentId,
});
