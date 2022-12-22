import * as yup from 'yup';

const connectivityValidationSchema = {
    connectivity: yup.object().shape({
        voltageLevel: yup.object().nullable().required().shape({
            id: yup.string(),
            name: yup.string(),
            substationId: yup.string(),
            nominalVoltage: yup.string(),
            topologyKind: yup.string(),
        }),
        busOrBusbarSection: yup.object().nullable().required().shape({
            id: yup.string(),
            name: yup.string(),
        }),
        connectionDirection: yup.string(),
        connectionName: yup.string(),
        connectionPosition: yup.string(),
    }),
};

export const getConnectivityFormValidationSchema = () => {
    return connectivityValidationSchema;
};

const connectivityValidation = yup.object().shape(connectivityValidationSchema);

export const getConnectivityFormValidation = () => {
    return connectivityValidation;
};

const connectivityEmptyFormData = {
    connectivity: {
        voltageLevel: null,
        busOrBusbarSection: null,
        connectionDirection: '',
        connectionName: '',
        connectionPosition: '',
    },
};

export const getConnectivityEmptyFormData = () => {
    return connectivityEmptyFormData;
};

const getConnectivityVoltageLevelData = (
    voltageLevelId,
    voltageLevelName,
    voltageLevelSubstationId,
    voltageLevelNominalVoltage,
    voltageLevelTopologyKind
) => {
    if (!voltageLevelId) {
        return null;
    }

    return {
        id: voltageLevelId,
        name: voltageLevelName,
        substationId: voltageLevelSubstationId,
        nominalVoltage: voltageLevelNominalVoltage,
        topologyKind: voltageLevelTopologyKind,
    };
};

const getConnectivityBusBarSectionData = (
    busbarSectionId,
    busbarSectionName
) => {
    if (!busbarSectionId) {
        return null;
    }

    return {
        id: busbarSectionId,
        name: busbarSectionName,
    };
};

export const getConnectivityFormData = ({
    voltageLevelId,
    voltageLevelName,
    voltageLevelSubstationId,
    voltageLevelNominalVoltage,
    voltageLevelTopologyKind,
    busbarSectionId,
    busbarSectionName,
    connectionDirection = '',
    connectionName = '',
    connectionPosition = '',
}) => {
    return {
        connectivity: {
            voltageLevel: getConnectivityVoltageLevelData(
                voltageLevelId,
                voltageLevelName,
                voltageLevelSubstationId,
                voltageLevelNominalVoltage,
                voltageLevelTopologyKind
            ),
            busOrBusbarSection: getConnectivityBusBarSectionData(
                busbarSectionId,
                busbarSectionName
            ),
            connectionDirection,
            connectionName,
            connectionPosition,
        },
    };
};
