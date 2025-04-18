/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LEFT_SIDE_PERCENTAGE, RIGHT_SIDE_PERCENTAGE, SLIDER_PERCENTAGE } from 'components/utils/field-constants';
import yup from '../../utils/yup-config';
import { Input } from '@gridsuite/commons-ui';

const percentageAreaValidationSchema = () => ({
    [SLIDER_PERCENTAGE]: yup.number(),
    [LEFT_SIDE_PERCENTAGE]: yup.number().min(0.1, 'OutOfBoundsPercentage').max(99.9, 'OutOfBoundsPercentage'),
    [RIGHT_SIDE_PERCENTAGE]: yup.number().min(0.1, 'OutOfBoundsPercentage').max(99.9, 'OutOfBoundsPercentage'),
});
export const getPercentageAreaValidationSchema = () => {
    return percentageAreaValidationSchema();
};

const percentageAreaEmptyFormData = () => ({
    [SLIDER_PERCENTAGE]: 50,
    [LEFT_SIDE_PERCENTAGE]: 50,
    [RIGHT_SIDE_PERCENTAGE]: 50,
});

export const getPercentageAreaEmptyFormData = () => {
    return percentageAreaEmptyFormData();
};

export const getPercentageAreaData = ({ percent }: { percent: number }) => {
    return {
        [SLIDER_PERCENTAGE]: percent,
        [LEFT_SIDE_PERCENTAGE]: percent,
        [RIGHT_SIDE_PERCENTAGE]: sanitizePercentageValue(100 - percent),
    };
};

export const isValidPercentage = (val: string) => {
    return /^\d*[.,]?\d?$/.test(val);
};

//used to format substaction of two percentages (avoid having more than one decimal)
export function sanitizePercentageValue(value: number) {
    return Math.round(value * 10) / 10;
}

export function formatPercentageValue(value: string): Input {
    // @ts-ignore
    if (!value || value < 0) {
        return 0;
    }
    // @ts-ignore
    if (value > 100) {
        return 100;
    }
    const tmp = value?.replace(',', '.');
    if (tmp.endsWith('.')) {
        return tmp;
    }
    return parseFloat(value);
}
