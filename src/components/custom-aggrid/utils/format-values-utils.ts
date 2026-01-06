/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';

export const NA_Value = 'N/A';

export const formatNAValue = (value: string, intl: IntlShape): string => {
    return value === NA_Value ? intl.formatMessage({ id: 'Undefined' }) : value;
};

export const convertDuration = (duration: number) => {
    if (!duration || isNaN(duration)) {
        return '';
    }

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    if (seconds === 0) {
        return minutes + ' min';
    }

    if (minutes === 0) {
        return seconds + ' s';
    }

    return `${minutes}' ${seconds}"`;
};
