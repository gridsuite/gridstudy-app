/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { REGULATION_TYPES, SIDE } from '../../../../network/constants';
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
