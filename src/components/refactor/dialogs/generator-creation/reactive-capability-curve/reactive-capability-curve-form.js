import FloatInput from '../../../rhf-inputs/float-input';
import {
    P,
    Q_MAX_P,
    Q_MIN_P,
    REACTIVE_CAPABILITY_CURVE_TABLE,
} from '../../../utils/field-constants';
import {
    ActivePowerAdornment,
    gridItem,
    ReactivePowerAdornment,
} from '../../../../dialogs/dialogUtils';
import React from 'react';

const ReactiveCapabilityCurveForm = ({ index, labelSuffix }) => {
    const id = REACTIVE_CAPABILITY_CURVE_TABLE;
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
            adornment={ActivePowerAdornment}
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

export default ReactiveCapabilityCurveForm;
