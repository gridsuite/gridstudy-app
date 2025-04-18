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
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TYPE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';

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
}: {
    voltageLevelId?: string | null;
    voltageLevelName?: string;
    voltageLevelSubstationId?: string;
    voltageLevelNominalVoltage?: string;
    voltageLevelTopologyKind?: string;
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
}: {
    equipmentId?: string | null;
    equipmentName?: string | null;
    equipmentType?: string | null;
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
}: {
    voltageLevelId?: string | null;
    voltageLevelName?: string;
    voltageLevelSubstationId?: string;
    voltageLevelNominalVoltage?: string;
    voltageLevelTopologyKind?: string;
    equipmentId?: string | null;
    equipmentName?: string | null;
    equipmentType?: string | null;
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
