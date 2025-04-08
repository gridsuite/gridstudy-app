/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { REGULATION_TYPES, SIDE } from '../../../../network/constants';

export const getRegulationTypeLabel = (equipmentId?: string, regulatingTerminalConnectableId?: string) => {
    if (regulatingTerminalConnectableId != null) {
        return regulatingTerminalConnectableId === equipmentId
            ? REGULATION_TYPES.LOCAL.label
            : REGULATION_TYPES.DISTANT.label;
    }
};

export const getTapSideLabel = (
    equipmentId?: string,
    voltageLevelId1?: string,
    regulatingTerminalVlId?: string,
    regulatingTerminalConnectableId?: string
) => {
    if (regulatingTerminalConnectableId === equipmentId) {
        return regulatingTerminalVlId === voltageLevelId1 ? SIDE.SIDE1.label : SIDE.SIDE2.label;
    }
};
