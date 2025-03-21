/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ActivePowerAdornment, ReactivePowerAdornment } from '../dialog-utils';
import { Grid } from '@mui/material';
import { FloatInput } from '@gridsuite/commons-ui';
import { ACTIVE_POWER_SET_POINT, REACTIVE_POWER_SET_POINT } from 'components/utils/field-constants';
import GridItem from '../commons/grid-item';
import GridSection from '../commons/grid-section';

interface SetPointsFormProps {
    previousValues?: { activePower?: number | null; reactivePower?: number | null };
}
export function SetPointsForm({ previousValues }: Readonly<SetPointsFormProps>) {
    const activePowerSetPointField = (
        <FloatInput
            name={ACTIVE_POWER_SET_POINT}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={previousValues?.activePower ?? undefined}
            clearable={true}
        />
    );

    const reactivePowerSetPointField = (
        <FloatInput
            name={REACTIVE_POWER_SET_POINT}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
            previousValue={previousValues?.reactivePower ?? undefined}
            clearable={true}
        />
    );

    return (
        <>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                <GridItem size={4}>{activePowerSetPointField}</GridItem>
                <GridItem size={4}>{reactivePowerSetPointField}</GridItem>
            </Grid>
        </>
    );
}
