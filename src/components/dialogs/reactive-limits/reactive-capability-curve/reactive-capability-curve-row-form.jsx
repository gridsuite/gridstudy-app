/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput } from '@gridsuite/commons-ui';
import { P, MAX_Q, MIN_Q } from 'components/utils/field-constants';
import { ActivePowerAdornment, ReactivePowerAdornment } from '../../dialog-utils';
import GridItem from '../../commons/grid-item';

const ReactiveCapabilityCurveRowForm = ({ id, index, labelSuffix, previousValues }) => {
    const pField = (
        <FloatInput
            name={`${id}.${index}.${P}`}
            label={'P'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ActivePowerAdornment}
            previousValue={previousValues?.p}
            clearable={true}
        />
    );

    const qminPField = (
        <FloatInput
            name={`${id}.${index}.${MIN_Q}`}
            label={'QminP'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ReactivePowerAdornment}
            previousValue={previousValues?.minQ}
            clearable={true}
        />
    );

    const qmaxPField = (
        <FloatInput
            name={`${id}.${index}.${MAX_Q}`}
            label={'QmaxP'}
            labelValues={{ labelSuffix: labelSuffix }}
            adornment={ReactivePowerAdornment}
            previousValue={previousValues?.maxQ}
            clearable={true}
        />
    );

    return (
        <>
            <GridItem size={3}>{pField}</GridItem>
            <GridItem size={3}>{qminPField}</GridItem>
            <GridItem size={3}>{qmaxPField}</GridItem>
        </>
    );
};

export default ReactiveCapabilityCurveRowForm;
