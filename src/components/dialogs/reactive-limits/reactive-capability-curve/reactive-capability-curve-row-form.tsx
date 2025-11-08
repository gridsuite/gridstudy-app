/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput } from '@gridsuite/commons-ui';
import { MAX_Q, MIN_Q, P, REACTIVE_CAPABILITY_CURVE_TABLE, REACTIVE_LIMITS } from 'components/utils/field-constants';
import { ActivePowerAdornment, ReactivePowerAdornment } from '../../dialog-utils';
import GridItem from '../../commons/grid-item';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ReactiveCapabilityCurveRowFormProps {
    id: string;
    index: number;
    labelSuffix: string | number;
}

export function ReactiveCapabilityCurveRowForm({
    id,
    index,
    labelSuffix,
}: Readonly<ReactiveCapabilityCurveRowFormProps>) {
    const {
        trigger,
        formState: { isSubmitted },
    } = useFormContext();

    const triggerTableValidation = useCallback(() => {
        if (isSubmitted) {
            trigger(`${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`);
        }
    }, [isSubmitted, trigger]);

    const triggerTableAndSiblingsValidation = useCallback(() => {
        if (isSubmitted) {
            trigger([
                `${id}[${index}].${MIN_Q}`,
                `${id}[${index}].${MAX_Q}`,
                `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
            ]);
        }
    }, [isSubmitted, id, index, trigger]);

    const pField = (
        <FloatInput
            name={`${id}.${index}.${P}`}
            label={'P'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ActivePowerAdornment}
            onChange={triggerTableValidation}
        />
    );

    const qminPField = (
        <FloatInput
            name={`${id}.${index}.${MIN_Q}`}
            label={'QminP'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ReactivePowerAdornment}
            onChange={triggerTableAndSiblingsValidation}
        />
    );

    const qmaxPField = (
        <FloatInput
            name={`${id}.${index}.${MAX_Q}`}
            label={'QmaxP'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ReactivePowerAdornment}
            onChange={triggerTableAndSiblingsValidation}
        />
    );

    return (
        <>
            <GridItem size={3}>{pField}</GridItem>
            <GridItem size={3}>{qminPField}</GridItem>
            <GridItem size={3}>{qmaxPField}</GridItem>
        </>
    );
}
