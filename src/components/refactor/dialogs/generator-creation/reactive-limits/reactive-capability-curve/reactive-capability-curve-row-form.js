/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FloatInput from '../../../../rhf-inputs/float-input';
import {
    P,
    Q_MAX_P,
    Q_MIN_P,
} from '../../../../utils/field-constants';
import {
    ActivePowerAdornment,
    gridItem,
    ReactivePowerAdornment,
} from '../../../../../dialogs/dialogUtils';
import React from 'react';
import yup from "../../../../utils/yup-config";

export const ROW_SCHEMA = yup.object().shape({
    [Q_MAX_P]: yup.number().nullable().required(),
    [Q_MIN_P]: yup
        .number()
        .nullable()
        .required()
        .max(
            yup.ref(Q_MAX_P),
            'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'
        ),
    [P]: yup
        .number()
        .nullable()
        .required()
        .min(
            yup.ref(Q_MIN_P),
            'ReactiveCapabilityCurveCreationErrorPOutOfRange'
        )
        .max(
            yup.ref(Q_MAX_P),
            'ReactiveCapabilityCurveCreationErrorPOutOfRange'
        ),
})

export const ROW_EMPTY_FORM_DATA = {
    [P]: null,
    [Q_MAX_P]: null,
    [Q_MIN_P]: null,
};

const ReactiveCapabilityCurveRowForm = ({ id, index, labelSuffix }) => {
    const pField = (
        <FloatInput
            name={`${id}.${index}.${P}`}
            label={'P'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ActivePowerAdornment}
        />
    );

    const qminPField = (
        <FloatInput
            name={`${id}.${index}.${Q_MIN_P}`}
            label={'QminP'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ReactivePowerAdornment}
        />
    );

    const qmaxPField = (
        <FloatInput
            name={`${id}.${index}.${Q_MAX_P}`}
            label={'QmaxP'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ReactivePowerAdornment}
        />
    );

    return (
        <>
            {gridItem(pField, 3)}
            {gridItem(qminPField, 3)}
            {gridItem(qmaxPField, 3)}
        </>
    );
};

export default ReactiveCapabilityCurveRowForm;
