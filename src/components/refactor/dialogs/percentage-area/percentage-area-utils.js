/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    LEFT_SIDE_PERCENTAGE,
    RIGHT_SIDE_PERCENTAGE,
    SLIDER_PERCENTAGE,
} from 'components/refactor/utils/field-constants';
import yup from '../../utils/yup-config';

const percentageAreaValidationSchema = () => ({
    [SLIDER_PERCENTAGE]: yup.string(),
    [LEFT_SIDE_PERCENTAGE]: yup.string(),
    [RIGHT_SIDE_PERCENTAGE]: yup.string(),
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

export const getPercentageAreaData = ({ percent }) => {
    return {
        [SLIDER_PERCENTAGE]: percent,
        [LEFT_SIDE_PERCENTAGE]: leftSideValue(percent),
        [RIGHT_SIDE_PERCENTAGE]: rightSideValue(percent),
    };
};

const maxDecimals = 1;
export function asMostlyPercentStr(value) {
    if (value < 0) return '0';
    if (value > 100) return '100';
    if (typeof value === 'number') return value.toFixed(maxDecimals);
    if (typeof value !== 'string') return '';
    const rgxra = /^(\d*)([.,]*)(\d*)/.exec(value);
    if (!rgxra) return '';
    return (
        rgxra[1] + rgxra[2].substring(0, 1) + rgxra[3].substring(0, maxDecimals)
    );
}

export function slideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-') {
        const rest = str.substring(4);
        if (isNaN(rest)) return 100;
        return str.substring(0, 3) - rest;
    }
    return parseFloat(str);
}

export function leftSideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-')
        return str.substring(0, 3) - str.substring(4);
    return str;
}

export function rightSideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-')
        return str.substring(4);
    const diff = 100 - str;
    return isNaN(diff) || diff === 100.0 ? '100' : diff.toFixed(maxDecimals);
}
