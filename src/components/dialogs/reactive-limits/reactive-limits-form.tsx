/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, RadioInput } from '@gridsuite/commons-ui';
import {
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
} from 'components/utils/field-constants';
import { REACTIVE_LIMIT_TYPES } from 'components/network/constants';
import { ReactivePowerAdornment } from '../dialog-utils';
import { useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import GridItem from '../commons/grid-item';
import { ReactiveCapabilityCurveTableForm } from './reactive-capability-curve/reactive-capability-curve-table';
import { MinMaxReactiveLimitsFormInfos, ReactiveCapabilityCurvePoints } from './reactive-limits.type';

const headerIds = ['ActivePowerText', 'MinimumReactivePower', 'MaximumReactivePower'];
export interface ReactiveLimitsFormProps {
    id?: string;
    previousReactiveCapabilityCurvePoints?: ReactiveCapabilityCurvePoints[] | null;
    previousMinMaxReactiveLimits?: MinMaxReactiveLimitsFormInfos | null;
    updatePreviousReactiveCapabilityCurveTable?: () => void;
}
export function ReactiveLimitsForm({
    id = REACTIVE_LIMITS,
    previousReactiveCapabilityCurvePoints = undefined,
    previousMinMaxReactiveLimits = undefined,
    updatePreviousReactiveCapabilityCurveTable = undefined,
}: Readonly<ReactiveLimitsFormProps>) {
    const reactiveCapabilityCurveChoice = useWatch({
        name: `${id}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`,
    });

    const isReactiveCapabilityCurveOn = reactiveCapabilityCurveChoice !== 'MINMAX';

    const reactiveCapabilityCurveChoiceRadioField = (
        <RadioInput
            name={`${id}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`}
            options={[...REACTIVE_LIMIT_TYPES]}
            formProps={{ style: { marginTop: '-12px' } }}
        />
    );

    const minimumReactivePowerField = (
        <FloatInput
            name={`${id}.${MINIMUM_REACTIVE_POWER}`}
            label={'MinimumReactivePower'}
            adornment={ReactivePowerAdornment}
            previousValue={previousMinMaxReactiveLimits?.minQ ?? undefined}
            clearable={true}
        />
    );

    const maximumReactivePowerField = (
        <FloatInput
            name={`${id}.${MAXIMUM_REACTIVE_POWER}`}
            label={'MaximumReactivePower'}
            adornment={ReactivePowerAdornment}
            previousValue={previousMinMaxReactiveLimits?.maxQ ?? undefined}
            clearable={true}
        />
    );

    const reactiveCapabilityCurveTableField = (
        <ReactiveCapabilityCurveTableForm
            id={`${id}.${REACTIVE_CAPABILITY_CURVE_TABLE}`}
            tableHeadersIds={headerIds}
            previousValues={previousReactiveCapabilityCurvePoints ?? undefined}
            updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
            disabled={!isReactiveCapabilityCurveOn}
        />
    );

    return (
        <Grid container spacing={2}>
            <GridItem size={12}>{reactiveCapabilityCurveChoiceRadioField}</GridItem>
            {!isReactiveCapabilityCurveOn && <GridItem size={4}>{minimumReactivePowerField}</GridItem>}
            {!isReactiveCapabilityCurveOn && <GridItem size={4}>{maximumReactivePowerField}</GridItem>}
            {!isReactiveCapabilityCurveOn && <GridItem size={'auto'}></GridItem>}
            {isReactiveCapabilityCurveOn && <GridItem size={12}>{reactiveCapabilityCurveTableField}</GridItem>}
        </Grid>
    );
}
