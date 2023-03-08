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
    NOMINAL_VOLTAGE,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    VOLTAGE_LEVEL,
} from 'components/refactor/utils/field-constants';
import yup from '../../utils/yup-config';

export const getConnectivityPropertiesValidationSchema = () => {
    return {
        [VOLTAGE_LEVEL]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string(),
                [SUBSTATION_ID]: yup.string(),
                [NOMINAL_VOLTAGE]: yup.string(),
                [TOPOLOGY_KIND]: yup.string().nullable(),
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

export const getConnectivityValidationSchema = (id = CONNECTIVITY) => {
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

export const getConnectivityEmptyFormData = (id = CONNECTIVITY) => ({
    [id]: getConnectivityPropertiesEmptyFormData(),
});

export const getConnectivityVoltageLevelData = ({
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
        [ID]: voltageLevelId,
        [NAME]: voltageLevelName,
        [SUBSTATION_ID]: voltageLevelSubstationId,
        [NOMINAL_VOLTAGE]: voltageLevelNominalVoltage,
        [TOPOLOGY_KIND]: voltageLevelTopologyKind,
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

export const getConnectivityFormData = (
    {
        voltageLevelId,
        voltageLevelName,
        voltageLevelSubstationId,
        voltageLevelNominalVoltage,
        voltageLevelTopologyKind,
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
            [VOLTAGE_LEVEL]: getConnectivityVoltageLevelData({
                voltageLevelId,
                voltageLevelName,
                voltageLevelSubstationId,
                voltageLevelNominalVoltage,
                voltageLevelTopologyKind,
            }),
            [BUS_OR_BUSBAR_SECTION]: getConnectivityBusBarSectionData({
                busbarSectionId,
                busbarSectionName,
            }),
            [CONNECTION_DIRECTION]: connectionDirection,
            [CONNECTION_NAME]: connectionName,
            [CONNECTION_POSITION]: connectionPosition,
        },
    };
};
