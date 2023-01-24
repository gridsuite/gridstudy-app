/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../utils/yup-config';

export const CONNECTIVITY = 'connectivity';
export const VOLTAGE_LEVEL = 'voltageLevel';
export const VOLTAGE_LEVEL_ID = 'id';
export const VOLTAGE_LEVEL_NAME = 'name';
export const VOLTAGE_LEVEL_SUBSTATION_ID = 'substationId';
export const VOLTAGE_LEVEL_NOMINAL_VOLTAGE = 'nominalVoltage';
export const VOLTAGE_LEVEL_TOPOLOGY_KIND = 'topologyKind';
export const BUS_OR_BUSBAR_SECTION = 'busOrBusbarSection';
export const BUS_OR_BUSBAR_SECTION_ID = 'id';
export const BUS_OR_BUSBAR_SECTION_NAME = 'name';
export const CONNECTION_DIRECTION = 'connectionDirection';
export const CONNECTION_NAME = 'connectionName';
export const CONNECTION_POSITION = 'connectionPosition';

const connectivityValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [VOLTAGE_LEVEL]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [VOLTAGE_LEVEL_ID]: yup.string(),
                [VOLTAGE_LEVEL_NAME]: yup.string(),
                [VOLTAGE_LEVEL_SUBSTATION_ID]: yup.string(),
                [VOLTAGE_LEVEL_NOMINAL_VOLTAGE]: yup.string(),
                [VOLTAGE_LEVEL_TOPOLOGY_KIND]: yup.string().nullable(),
            }),
        [BUS_OR_BUSBAR_SECTION]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [BUS_OR_BUSBAR_SECTION_ID]: yup.string(),
                [BUS_OR_BUSBAR_SECTION_NAME]: yup.string(),
            }),
        [CONNECTION_DIRECTION]: yup.string().nullable(),
        [CONNECTION_NAME]: yup.string(),
        [CONNECTION_POSITION]: yup.number().nullable(),
    }),
});

export const getConnectivityFormValidationSchema = (id = CONNECTIVITY) => {
    return connectivityValidationSchema(id);
};

const connectivityEmptyFormData = (id) => ({
    [id]: {
        [VOLTAGE_LEVEL]: null,
        [BUS_OR_BUSBAR_SECTION]: null,
        [CONNECTION_DIRECTION]: null,
        [CONNECTION_NAME]: '',
        [CONNECTION_POSITION]: null,
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
        [VOLTAGE_LEVEL_ID]: voltageLevelId,
        [VOLTAGE_LEVEL_NAME]: voltageLevelName,
        [VOLTAGE_LEVEL_SUBSTATION_ID]: voltageLevelSubstationId,
        [VOLTAGE_LEVEL_NOMINAL_VOLTAGE]: voltageLevelNominalVoltage,
        [VOLTAGE_LEVEL_TOPOLOGY_KIND]: voltageLevelTopologyKind,
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
        [BUS_OR_BUSBAR_SECTION_ID]: busbarSectionId,
        [BUS_OR_BUSBAR_SECTION_NAME]: busbarSectionName,
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
    connectionDirection = null,
    connectionName = '',
    connectionPosition = null,
},
id = CONNECTIVITY) => {
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
