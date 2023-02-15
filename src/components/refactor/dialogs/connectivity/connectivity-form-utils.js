/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    BUS_OR_BUSBAR_SECTION,
    DIRECTION,
    LABEL,
    ORDER,
    CONNECTIVITY,
    ID,
    NAME,
    NOMINAL_VOLTAGE,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    VOLTAGE_LEVEL,
    POSITION,
} from 'components/refactor/utils/field-constants';
import yup from '../../utils/yup-config';

const connectivityValidationSchema = (id) => ({
    [id]: yup.object().shape({
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
        [POSITION]: yup.object().shape({
            [DIRECTION]: yup.string().nullable(),
            [LABEL]: yup.string(),
            [ORDER]: yup.number().nullable(),
        }),
    }),
});

export const getConnectivityFormValidationSchema = (id = CONNECTIVITY) => {
    return connectivityValidationSchema(id);
};

const connectivityEmptyFormData = (id) => ({
    [id]: {
        [VOLTAGE_LEVEL]: null,
        [BUS_OR_BUSBAR_SECTION]: null,
        [POSITION]: {
            [DIRECTION]: null,
            [LABEL]: '',
            [ORDER]: null,
        },
    },
});

export const getConnectivityEmptyFormData = (id = CONNECTIVITY) => {
    return connectivityEmptyFormData(id);
};

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
            [POSITION]: {
                [DIRECTION]: connectionDirection,
                [LABEL]: connectionName,
                [ORDER]: connectionPosition,
            },
        },
    };
};
