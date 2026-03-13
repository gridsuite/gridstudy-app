/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

import { MeasurementInfo } from './measurement.type';
import { FunctionComponent } from 'react';
import { MEASUREMENT_Q, MEASUREMENT_Q1, MEASUREMENT_Q2, STATE_ESTIMATION } from '../../../../utils/field-constants';
import { Grid } from '@mui/material';
import { PowerWithValidityForm } from './power-with-validity-form';
import { FieldType } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';

interface ReactivePowerMeasurementFormProps {
    side?: 1 | 2;
    reactivePowerMeasurement?: MeasurementInfo;
}

export const ReactivePowerMeasurementForm: FunctionComponent<ReactivePowerMeasurementFormProps> = ({
    side,
    reactivePowerMeasurement,
}) => {
    const getReactiveMeasurementType = (side: number | null | undefined) => {
        if (!side) {
            return MEASUREMENT_Q;
        }
        return side === 1 ? MEASUREMENT_Q1 : MEASUREMENT_Q2;
    };

    const reactivePowerId = `${STATE_ESTIMATION}.${getReactiveMeasurementType(side)}`;

    return (
        <Grid container spacing={2}>
            <GridItem size={12}>
                <PowerWithValidityForm
                    id={reactivePowerId}
                    field={FieldType.REACTIVE_POWER}
                    measurement={reactivePowerMeasurement}
                />
            </GridItem>
        </Grid>
    );
};
