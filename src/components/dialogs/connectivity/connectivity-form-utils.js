/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    ID,
    NAME,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import yup from '../../utils/yup-config';

export const getConnectivityPropertiesValidationSchema = () => {
    return {
        [VOLTAGE_LEVEL]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [ID]: yup.string(),
            }),
        [BUS_OR_BUSBAR_SECTION]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string(),
            }),
    };
};

export const getConnectivityWithPositionValidationSchema = (
    id = CONNECTIVITY
) => ({
    [id]: yup.object().shape({
        [CONNECTION_DIRECTION]: yup.string().nullable(),
        [CONNECTION_NAME]: yup.string(),
        [CONNECTION_POSITION]: yup.number().nullable(),
        ...getConnectivityPropertiesValidationSchema(),
    }),
});

export const getConnectivityWithoutPositionValidationSchema = (
    id = CONNECTIVITY
) => {
    return {
        [id]: yup.object().shape(getConnectivityPropertiesValidationSchema()),
    };
};

export const getConnectivityPropertiesEmptyFormData = () => {
    return {
        [VOLTAGE_LEVEL]: null,
        [BUS_OR_BUSBAR_SECTION]: null,
    };
};

export const getConnectivityWithPositionEmptyFormData = (
    id = CONNECTIVITY
) => ({
    [id]: {
        ...getConnectivityPropertiesEmptyFormData(),
        [CONNECTION_DIRECTION]: null,
        [CONNECTION_NAME]: '',
        [CONNECTION_POSITION]: null,
    },
});

export const getConnectivityWithoutPositionEmptyFormData = (
    id = CONNECTIVITY
) => ({
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

export const getConnectivityBusBarSectionData = ({
    busbarSectionId,
    busbarSectionName = '',
}) => {
    if (!busbarSectionId) {
        return null;
    }

    return {
        [ID]: busbarSectionId,
        [NAME]: busbarSectionName,
    };
};

export const getConnectivityPropertiesData = ({
    voltageLevelId,
    busbarSectionId,
    busbarSectionName,
}) => {
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

export const getConnectivityData = (
    { voltageLevelId, busbarSectionId, busbarSectionName },
    id = CONNECTIVITY
) => {
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
        connectionDirection = null,
        connectionName = '',
        connectionPosition = null,
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
            [CONNECTION_DIRECTION]: connectionDirection,
            [CONNECTION_NAME]: connectionName,
            [CONNECTION_POSITION]: connectionPosition,
        },
    };
};
