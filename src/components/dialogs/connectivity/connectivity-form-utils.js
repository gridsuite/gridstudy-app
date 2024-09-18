/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    ID,
    NAME,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import yup from '../../utils/yup-config';

export const getConnectivityPropertiesValidationSchema = (isEquipmentModification = false) => {
    return {
        [VOLTAGE_LEVEL]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [ID]: yup.string().when([], {
                    is: () => isEquipmentModification,
                    then: (schema) => schema.nullable(),
                }),
            }),
        [BUS_OR_BUSBAR_SECTION]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [ID]: yup.string().when([], {
                    is: () => isEquipmentModification,
                    then: (schema) => schema.nullable(),
                }),
                [NAME]: yup.string(),
            }),
    };
};

export const getCon1andCon2WithPositionValidationSchema = (isEquipmentModification = false, id = CONNECTIVITY) => ({
    [id]: yup.object().shape({
        ...getConnectivityWithPositionValidationSchema(isEquipmentModification, CONNECTIVITY_1),
        ...getConnectivityWithPositionValidationSchema(isEquipmentModification, CONNECTIVITY_2),
    }),
});

export const getConnectivityWithPositionValidationSchema = (isEquipmentModification = false, id = CONNECTIVITY) => ({
    [id]: yup.object().shape({
        [CONNECTION_DIRECTION]: yup.string().nullable(),
        [CONNECTION_NAME]: yup.string(),
        [CONNECTION_POSITION]: yup.number().nullable(),
        [CONNECTED]: yup
            .bool()
            .nullable()
            .when([], {
                is: () => !isEquipmentModification,
                then: (schema) => schema.required(),
            }),
        ...getConnectivityPropertiesValidationSchema(isEquipmentModification),
    }),
});

export const getConnectivityWithoutPositionValidationSchema = (id = CONNECTIVITY) => {
    return {
        [id]: yup.object().shape(getConnectivityPropertiesValidationSchema()),
    };
};

export const getConnectivityPropertiesEmptyFormData = (isEquipmentModification = false) => {
    return {
        [VOLTAGE_LEVEL]: null,
        [BUS_OR_BUSBAR_SECTION]: null,
        [CONNECTED]: isEquipmentModification ? null : true,
    };
};

export const getCont1Cont2WithPositionEmptyFormData = (isEquipmentModification = false, id = CONNECTIVITY) => ({
    [id]: {
        ...getConnectivityWithPositionEmptyFormData(isEquipmentModification, CONNECTIVITY_1),
        ...getConnectivityWithPositionEmptyFormData(isEquipmentModification, CONNECTIVITY_2),
    },
});

export const getConnectivityWithPositionEmptyFormData = (isEquipmentModification = false, id = CONNECTIVITY) => ({
    [id]: {
        ...getConnectivityPropertiesEmptyFormData(isEquipmentModification),
        [CONNECTION_DIRECTION]: null,
        [CONNECTION_NAME]: '',
        [CONNECTION_POSITION]: null,
    },
});

export const getConnectivityWithoutPositionEmptyFormData = (id = CONNECTIVITY) => ({
    [id]: getConnectivityPropertiesEmptyFormData(),
});

export const getConnectivityVoltageLevelData = ({ voltageLevelId }) => {
    if (!voltageLevelId) {
        return null;
    }

    return {
        [ID]: voltageLevelId,
    };
};

export const getConnectivityBusBarSectionData = ({ busbarSectionId, busbarSectionName = '' }) => {
    if (!busbarSectionId) {
        return null;
    }

    return {
        [ID]: busbarSectionId,
        [NAME]: busbarSectionName,
    };
};

export const getConnectivityPropertiesData = ({ voltageLevelId, busbarSectionId, busbarSectionName }) => {
    return {
        [VOLTAGE_LEVEL]: getConnectivityVoltageLevelData({
            voltageLevelId,
        }),
        [BUS_OR_BUSBAR_SECTION]: getConnectivityBusBarSectionData({
            busbarSectionId,
            busbarSectionName,
        }),
    };
};

export const getNewVoltageLevelData = (newVoltageLevel) => ({
    id: newVoltageLevel.equipmentId,
    name: newVoltageLevel.equipmentName ?? '',
    substationId: newVoltageLevel.substationId,
    topologyKind: newVoltageLevel.topologyKind,
});

export const getConnectivityData = ({ voltageLevelId, busbarSectionId, busbarSectionName }, id = CONNECTIVITY) => {
    return {
        [id]: getConnectivityPropertiesData({
            voltageLevelId,
            busbarSectionId,
            busbarSectionName,
        }),
    };
};

export const getConnectivityFormData = (
    {
        voltageLevelId,
        busbarSectionId,
        busbarSectionName,
        connectionDirection,
        connectionName,
        connectionPosition,
        terminalConnected,
        isEquipmentModification = false,
    },
    id = CONNECTIVITY
) => {
    return {
        [id]: {
            ...getConnectivityPropertiesData({
                voltageLevelId,
                busbarSectionId,
                busbarSectionName,
            }),
            [CONNECTION_DIRECTION]: connectionDirection ?? null,
            [CONNECTION_NAME]: connectionName ?? '',
            [CONNECTION_POSITION]: connectionPosition ?? null,
            [CONNECTED]: isEquipmentModification ? terminalConnected : true,
        },
    };
};

export const createConnectivityData = (equipmentToModify, index) => ({
    busbarSectionId: equipmentToModify?.[`busOrBusbarSectionId${index}`]?.value ?? null,
    connectionDirection: equipmentToModify?.[`connectionDirection${index}`]?.value ?? null,
    connectionName: equipmentToModify?.[`connectionName${index}`]?.value ?? '',
    connectionPosition: equipmentToModify?.[`connectionPosition${index}`]?.value ?? null,
    voltageLevelId: equipmentToModify?.[`voltageLevelId${index}`]?.value ?? null,
    terminalConnected: equipmentToModify?.[`terminal${index}Connected`]?.value ?? null,
    isEquipmentModification: true,
});
