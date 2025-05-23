/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PHASE_REGULATION_MODES, RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from '../../../../network/constants';
import { IntlShape } from 'react-intl';

export const getRegulationTypeLabel = (twt: any, tap: any, intl: IntlShape) => {
    if (tap?.regulatingTerminalConnectableId != null) {
        return tap?.regulatingTerminalConnectableId === twt?.id
            ? intl.formatMessage({ id: REGULATION_TYPES.LOCAL.label })
            : intl.formatMessage({ id: REGULATION_TYPES.DISTANT.label });
    } else {
        return null;
    }
};

export const getTapSideLabel = (twt: any, tap: any, intl: IntlShape) => {
    if (!tap || !twt) {
        return null;
    }
    if (tap?.regulatingTerminalConnectableId === twt?.id) {
        return tap?.regulatingTerminalVlId === twt?.voltageLevelId1
            ? intl.formatMessage({ id: SIDE.SIDE1.label })
            : intl.formatMessage({ id: SIDE.SIDE2.label });
    } else {
        return null;
    }
};

export const isVoltageRegulationEnabled = (
    enabled: boolean,
    hasLoadTapChangingCapabilities: boolean,
    regulationMode: string
) => enabled && hasLoadTapChangingCapabilities && regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id;

export const isDistantRegulationForRatio = (
    enabled: boolean,
    hasLoadTapChangingCapabilities: boolean,
    regulationMode: string,
    regulationType: string
) =>
    isVoltageRegulationEnabled(enabled, hasLoadTapChangingCapabilities, regulationMode) &&
    regulationType === REGULATION_TYPES.DISTANT.id;

export const isDistantRegulationForPhase = (enabled: boolean, regulationMode: string, regulationType: string) =>
    enabled && regulationMode !== PHASE_REGULATION_MODES.FIXED_TAP.id && regulationType === REGULATION_TYPES.DISTANT.id;

export const isLocalRegulation = (
    enabled: boolean,
    hasLoadTapChangingCapabilities: boolean,
    regulationMode: string,
    regulationType: string
) =>
    isVoltageRegulationEnabled(enabled, hasLoadTapChangingCapabilities, regulationMode) &&
    regulationType === REGULATION_TYPES.LOCAL.id;
