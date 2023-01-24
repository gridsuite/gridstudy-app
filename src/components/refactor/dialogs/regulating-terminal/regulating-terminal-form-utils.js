import yup from '../../utils/yup-config';

export const VOLTAGE_LEVEL = 'voltageLevel';
export const VOLTAGE_LEVEL_ID = 'id';
export const VOLTAGE_LEVEL_NAME = 'name';
export const VOLTAGE_LEVEL_SUBSTATION_ID = 'substationId';
export const VOLTAGE_LEVEL_NOMINAL_VOLTAGE = 'nominalVoltage';
export const VOLTAGE_LEVEL_TOPOLOGY_KIND = 'topologyKind';
export const EQUIPMENT = 'equipment';
export const EQUIPMENT_TYPE = 'type';
export const EQUIPMENT_ID = 'id';
export const EQUIPMENT_NAME = 'name';

const regulatingTerminalValidationSchema = () => ({
    [VOLTAGE_LEVEL]: yup
        .object()
        .nullable()
        .shape({
            [VOLTAGE_LEVEL_ID]: yup.string(),
            [VOLTAGE_LEVEL_NAME]: yup.string(),
            [VOLTAGE_LEVEL_SUBSTATION_ID]: yup.string(),
            [VOLTAGE_LEVEL_NOMINAL_VOLTAGE]: yup.string(),
            [VOLTAGE_LEVEL_TOPOLOGY_KIND]: yup.string().nullable(),
        }),
    [EQUIPMENT]: yup
        .object()
        .nullable()
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

export const getRegulatingTerminalVoltageLevelData = ({
    voltageLevelId,
    voltageLevelName = '',
    voltageLevelSubstationId = '',
    voltageLevelNominalVoltage = '',
    voltageLevelTopologyKind = '',
}) => {
    if (!voltageLevelId) {
        return null;
    }

    return {
        [VOLTAGE_LEVEL_ID]: voltageLevelId,
        [VOLTAGE_LEVEL_NAME]: voltageLevelName,
        [VOLTAGE_LEVEL_SUBSTATION_ID]: voltageLevelSubstationId,
        [VOLTAGE_LEVEL_NOMINAL_VOLTAGE]: voltageLevelNominalVoltage,
        [VOLTAGE_LEVEL_TOPOLOGY_KIND]: voltageLevelTopologyKind,
    };
};

export const getRegulatingTerminalEquipmentData = ({
    equipmentId,
    equipmentName = '',
    equipmentType = '',
}) => {
    if (!equipmentId) {
        return null;
    }

    return {
        [EQUIPMENT_ID]: equipmentId,
        [EQUIPMENT_NAME]: equipmentName,
        [EQUIPMENT_TYPE]: equipmentType,
    };
};

export const getRegulatingTerminalFormData = ({
    voltageLevelId = null,
    voltageLevelName,
    voltageLevelNominalVoltage,
    voltageLevelSubstationId,
    voltageLevelTopologyKind,
    equipmentId = null,
    equipmentName,
    equipmentType,
}) => {
    console.log('TEST', equipmentId, voltageLevelId, equipmentType);
    return {
        [VOLTAGE_LEVEL]: getRegulatingTerminalVoltageLevelData({
            voltageLevelId,
            voltageLevelName,
            voltageLevelNominalVoltage,
            voltageLevelSubstationId,
            voltageLevelTopologyKind,
        }),
        [EQUIPMENT]: getRegulatingTerminalEquipmentData({
            equipmentId,
            equipmentName,
            equipmentType,
        }),
    };
};
