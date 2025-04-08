/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { REGULATION_TYPES, SIDE } from '../../../../network/constants';
import { IntlShape } from 'react-intl';
import {
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
} from '../../../../utils/field-constants';
import { parseFloatData, parseIntData } from '../../../dialog-utils';

export const getBaseCsvColumns = (intl: IntlShape) => [
    intl.formatMessage({ id: 'ImportFileResistance' }),
    intl.formatMessage({ id: 'ImportFileReactance' }),
    intl.formatMessage({ id: 'ImportFileConductance' }),
    intl.formatMessage({ id: 'ImportFileSusceptance' }),
    intl.formatMessage({ id: 'Ratio' }),
];

export const getBaseImportRowData = (val: any, intl: IntlShape) => ({
    [STEPS_RESISTANCE]: parseIntData(val[intl.formatMessage({ id: 'ImportFileResistance' })], 0),
    [STEPS_REACTANCE]: parseIntData(val[intl.formatMessage({ id: 'ImportFileReactance' })], 0),
    [STEPS_CONDUCTANCE]: parseIntData(val[intl.formatMessage({ id: 'ImportFileConductance' })], 0),
    [STEPS_SUSCEPTANCE]: parseIntData(val[intl.formatMessage({ id: 'ImportFileSusceptance' })], 0),
    [STEPS_RATIO]: parseFloatData(val[intl.formatMessage({ id: 'Ratio' })], 1),
});

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
