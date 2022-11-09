/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDoubleValue, useTextValue } from "./inputs/input-hooks";
import {
    ActivePowerAdornment,
    gridItem,
    ReactivePowerAdornment,
} from './dialogUtils';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export const ReactiveCapabilityCurveTable = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    isFieldRequired,
    disabled = false,
    pError = undefined,
    pErrorMsgId = undefined,
    qminPError = undefined,
    qminPErrorMsgId = undefined,
    qmaxPError = undefined,
    qmaxPErrorMsgId = undefined,
}) => {
    const [p, pField] = useDoubleValue({
        label: 'P',
        id: 'P' + index,
        validation: {
            isFieldRequired: isFieldRequired,
            customValidation: {
                error: !!pError,
                errorMsgId: pErrorMsgId,
            },
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.p ?? '',
        formProps: { disabled: disabled },
    });
    const [qminP, qminPField] = useDoubleValue({
        label: 'QminP',
        id: 'QminP' + index,
        validation: {
            isFieldRequired: isFieldRequired,
            customValidation: {
                error: !!qminPError,
                errorMsgId: qminPErrorMsgId,
            },
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.qminP ?? '',
        formProps: { disabled: disabled },
    });

    const [qmaxP, qmaxPField] = useDoubleValue({
        label: 'QmaxP',
        id: 'QmaxP' + index,
        validation: {
            isFieldRequired: isFieldRequired,
            customValidation: {
                error: !!qmaxPError,
                errorMsgId: qmaxPErrorMsgId,
            }
        },
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

ReactiveCapabilityCurveTable.prototype = {
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultValue: PropTypes.object,
    isFieldRequired: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default ReactiveCapabilityCurveTable;
