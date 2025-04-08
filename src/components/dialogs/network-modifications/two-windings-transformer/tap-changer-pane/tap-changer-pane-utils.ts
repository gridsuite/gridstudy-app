/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PHASE_REGULATION_MODES, REGULATION_TYPES } from '../../../../network/constants';
import { IntlShape } from 'react-intl';
import {
    ENABLED,
    ID,
    NAME,
    NOMINAL_VOLTAGE,
    REGULATION_MODE,
    REGULATION_TYPE,
    STEPS_ALPHA,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TYPE,
} from '../../../../utils/field-constants';
import { parseFloatData, parseIntData } from '../../../dialog-utils';
import yup from '../../../../utils/yup-config';
import { areArrayElementsUnique, areNumbersOrdered } from 'components/utils/utils';
import { Schema } from 'yup';

export const getVoltageLevelValidationSchema = () => {
    return yup
        .object()
        .nullable()
        .shape({
            [ID]: yup.string(),
            [NAME]: yup.string(),
            [SUBSTATION_ID]: yup.string(),
            [NOMINAL_VOLTAGE]: yup.string(),
            [TOPOLOGY_KIND]: yup.string().nullable(),
        });
};

export const getEquipmentValidationSchema = () => {
    return yup
        .object()
        .nullable()
        .shape({
            [ID]: yup.string(),
            [NAME]: yup.string().nullable(),
            [TYPE]: yup.string(),
        });
};

export const getRegulatedTerminalValidationSchema = (schema: Schema) => {
    return schema.when([ENABLED, REGULATION_MODE, REGULATION_TYPE], {
        is: (enabled: boolean, regulationMode: string, regulationType: string) =>
            enabled &&
            regulationMode !== PHASE_REGULATION_MODES.FIXED_TAP.id &&
            regulationType === REGULATION_TYPES.DISTANT.id,
        then: (schema: Schema) => schema.required(),
    });
};

export const getPhaseTapChangerStepsValidationSchema = () => {
    return yup
        .array()
        .of(
            yup.object().shape({
                [STEPS_TAP]: yup.number().required(),
                [STEPS_RESISTANCE]: yup.number(),
                [STEPS_REACTANCE]: yup.number(),
                [STEPS_CONDUCTANCE]: yup.number(),
                [STEPS_SUSCEPTANCE]: yup.number(),
                [STEPS_RATIO]: yup.number(),
                [STEPS_ALPHA]: yup.number(),
            })
        )
        .test('distinctOrderedAlpha', 'PhaseShiftValuesError', (array) => {
            const alphaArray = array?.map((step) => step[STEPS_ALPHA]);
            return areNumbersOrdered(alphaArray) && alphaArray && areArrayElementsUnique(alphaArray);
        });
};

export const getRatioTapChangerStepsValidationSchema = () => {
    return yup
        .array()
        .of(
            yup.object().shape({
                [STEPS_TAP]: yup.number().required(),
                [STEPS_RESISTANCE]: yup.number(),
                [STEPS_REACTANCE]: yup.number(),
                [STEPS_CONDUCTANCE]: yup.number(),
                [STEPS_SUSCEPTANCE]: yup.number(),
                [STEPS_RATIO]: yup.number(),
            })
        )
        .test('distinctOrderedRatio', 'RatioValuesError', (array) => {
            const ratioArray = array?.map((step) => step[STEPS_RATIO]);
            return areNumbersOrdered(ratioArray) && ratioArray && areArrayElementsUnique(ratioArray);
        });
};

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
