/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { NA_Value } from 'components/custom-aggrid/utils/format-values-utils';
import { IntlShape } from 'react-intl';

export const PERMANENT_LIMIT_NAME = 'permanent';

export const translateLimitNameBackToFront = (limitName: string | null | undefined, intl: IntlShape) => {
    switch (limitName) {
        case PERMANENT_LIMIT_NAME:
            return intl.formatMessage({ id: 'PermanentLimitName' });
        case NA_Value:
            return intl.formatMessage({ id: 'Undefined' });
        default:
            return limitName;
    }
};

export const translateLimitNameFrontToBack = (limitName: string, intl: IntlShape) => {
    switch (limitName) {
        case intl.formatMessage({ id: 'PermanentLimitName' }):
            return PERMANENT_LIMIT_NAME;
        case intl.formatMessage({ id: 'Undefined' }).toUpperCase(): // we need to upper if we want to match because we only store capslock values
            return NA_Value;
        default:
            return limitName;
    }
};

export enum FilterType {
    VOLTAGE_LEVEL = 'voltageLevel',
    VOLTAGE_LEVEL_1 = 'voltageLevel1',
    VOLTAGE_LEVEL_2 = 'voltageLevel2',
    COUNTRY = 'country',
    COUNTRY_1 = 'country1',
    COUNTRY_2 = 'country2',
    GENERIC_FILTER = 'genericFilter', // generic filters which uses the filter library
}
