/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDoubleValue } from './inputs/input-hooks';
import {
    ActivePowerAdornment,
    gridItem,
    ReactivePowerAdornment,
} from './dialogUtils';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export const ReactiveCapabilityCurveReactiveRange = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    isFieldRequired,
    disabled = false,
    customPLabel = undefined,
}) => {
    const [p, pField] = useDoubleValue({
        label: customPLabel !== undefined ? customPLabel : 'P',
        id: 'P' + index,
        validation: { isFieldRequired: isFieldRequired },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.p ?? '',
        formProps: { disabled: disabled },
    });
    const [qminP, qminPField] = useDoubleValue({
        label: 'QminP',
        id: 'QminP' + index,
        validation: { isFieldRequired: isFieldRequired },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.qminP ?? '',
        formProps: { disabled: disabled },
    });

    const [qmaxP, qmaxPField] = useDoubleValue({
        label: 'QmaxP',
        id: 'QmaxP' + index,
        validation: { isFieldRequired: isFieldRequired },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.qmaxP ?? '',
        formProps: { disabled: disabled },
    });

    useEffect(() => {
        onChange(index, { p: p, qminP: qminP, qmaxP: qmaxP });
    }, [index, onChange, p, qminP, qmaxP]);

    return (
        <>
            {gridItem(pField, 3)}
            {gridItem(qminPField, 3)}
            {gridItem(qmaxPField, 3)}
        </>
    );
};

ReactiveCapabilityCurveReactiveRange.prototype = {
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultValue: PropTypes.object,
    isFieldRequired: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default ReactiveCapabilityCurveReactiveRange;
