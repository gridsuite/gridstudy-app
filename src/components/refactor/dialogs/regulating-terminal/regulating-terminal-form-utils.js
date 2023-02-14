/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    EQUIPMENT,
    ID,
    NAME,
    NOMINAL_VOLTAGE,
    REGULATING_TERMINAL,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TYPE,
    VOLTAGE_LEVEL,
} from 'components/refactor/utils/field-constants';
import yup from '../../utils/yup-config';

const regulatingTerminalValidationSchema = (id) => ({
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
        [EQUIPMENT]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string().nullable(),
                [TYPE]: yup.string(),
            }),
    }),
});

export const getRegulatingTerminalValidationSchema = () => {
    return regulatingTerminalValidationSchema(REGULATING_TERMINAL);
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
        [ID]: voltageLevelId,
        [NAME]: voltageLevelName,
        [SUBSTATION_ID]: voltageLevelSubstationId,
        [NOMINAL_VOLTAGE]: voltageLevelNominalVoltage,
        [TOPOLOGY_KIND]: voltageLevelTopologyKind,
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
        [ID]: equipmentId,
        [NAME]: equipmentName,
        [TYPE]: equipmentType,
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
