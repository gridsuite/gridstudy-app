/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactHookFormFloatNumberTextField from '../../inputs/text-field/react-hook-form-float-number-text-field';
import { getAdornmentInputProps } from '../../inputs/utils';
import {
    ActivePowerAdornment,
    gridItem,
    ReactivePowerAdornment,
} from '../../../dialogs/dialogUtils';
import { useFormContext } from 'react-hook-form';

export const ReactiveCapabilityCurveReactiveRange = ({
    index,
    disabled = false,
    labelSuffix = '',
}) => {
    const { control } = useFormContext();
    const pField = (
        <ReactHookFormFloatNumberTextField
            name={`reactiveCapabilityCurvePoints[${index}].p`}
            control={control}
            label={'P' + labelSuffix}
            adornmentCallback={getAdornmentInputProps(ActivePowerAdornment)}
        />
    );

    const qminPField = (
        <ReactHookFormFloatNumberTextField
            name={`reactiveCapabilityCurvePoints[${index}].qminP`}
            control={control}
            label={'QminP' + labelSuffix}
            adornmentCallback={getAdornmentInputProps(ReactivePowerAdornment)}
        />
    );

    const qmaxPField = (
        <ReactHookFormFloatNumberTextField
            name={`reactiveCapabilityCurvePoints[${index}].qmaxP`}
            control={control}
            label={'QmaxP' + labelSuffix}
            adornmentCallback={getAdornmentInputProps(ReactivePowerAdornment)}
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

ReactiveCapabilityCurveReactiveRange.prototype = {
    index: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
};

export default ReactiveCapabilityCurveReactiveRange;
