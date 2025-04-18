/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput } from '@gridsuite/commons-ui';
import { MAX_Q, MIN_Q, P } from 'components/utils/field-constants';
import { ActivePowerAdornment, ReactivePowerAdornment } from '../../dialog-utils';
import GridItem from '../../commons/grid-item';

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
            name={`${id}.${index}.${MIN_Q}`}
            label={'QminP'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ReactivePowerAdornment}
        />
    );

    const qmaxPField = (
        <FloatInput
            name={`${id}.${index}.${MAX_Q}`}
            label={'QmaxP'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ReactivePowerAdornment}
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
