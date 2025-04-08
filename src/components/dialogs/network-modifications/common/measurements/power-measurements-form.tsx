/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { FunctionComponent } from 'react';
import GridItem from '../../../commons/grid-item';
import { PowerWithValidityForm } from './power-with-validity-form';
import { FieldType } from '@gridsuite/commons-ui';
import {
    STATE_ESTIMATION,
    MEASUREMENT_P1,
    MEASUREMENT_P2,
    MEASUREMENT_Q1,
    MEASUREMENT_Q2,
    MEASUREMENT_P,
    MEASUREMENT_Q,
} from 'components/utils/field-constants';
import { MeasurementInfo } from './measurement.type';

interface PowerMeasurementsFormProps {
    side?: 1 | 2;
    activePowerMeasurement?: MeasurementInfo;
    reactivePowerMeasurement?: MeasurementInfo;
}

export const PowerMeasurementsForm: FunctionComponent<PowerMeasurementsFormProps> = ({
    side,
    activePowerMeasurement,
    reactivePowerMeasurement,
}) => {
    const getActiveMeasurementType = (side: number | null | undefined) => {
        if (!side) {
            return MEASUREMENT_P;
        }
        return side === 1 ? MEASUREMENT_P1 : MEASUREMENT_P2;
    };

    const getReactiveMeasurementType = (side: number | null | undefined) => {
        if (!side) {
            return MEASUREMENT_Q;
        }
        return side === 1 ? MEASUREMENT_Q1 : MEASUREMENT_Q2;
    };

    const activePowerId = `${STATE_ESTIMATION}.${getActiveMeasurementType(side)}`;
    const reactivePowerId = `${STATE_ESTIMATION}.${getReactiveMeasurementType(side)}`;

    return (
        <Grid container spacing={2}>
            <GridItem size={12}>
                <PowerWithValidityForm
                    id={activePowerId}
                    field={FieldType.ACTIVE_POWER}
                    measurement={activePowerMeasurement}
                />
            </GridItem>
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
