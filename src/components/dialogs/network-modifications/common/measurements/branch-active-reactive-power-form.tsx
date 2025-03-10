/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    STATE_ESTIMATION,
    MEASUREMENT_P1,
    MEASUREMENT_P2,
    MEASUREMENT_Q1,
    MEASUREMENT_Q2,
} from 'components/utils/field-constants';
import { FunctionComponent } from 'react';
import GridSection from '../../../commons/grid-section';
import GridItem from '../../../commons/grid-item';
import { BranchActiveReactivePowerMeasurementsFormProps } from './measurement.type';
import { PowerWithValidityForm } from './power-with-validity-form';
import { FieldType } from '@gridsuite/commons-ui';

const styles = {
    h3: {
        marginTop: 0,
        marginBottom: 0,
    },
};

const BranchActiveReactivePowerMeasurementsForm: FunctionComponent<BranchActiveReactivePowerMeasurementsFormProps> = ({
    equipmentToModify,
}) => {
    const activePower1 = `${STATE_ESTIMATION}.${MEASUREMENT_P1}`;
    const reactivePower1 = `${STATE_ESTIMATION}.${MEASUREMENT_Q1}`;
    const activePower2 = `${STATE_ESTIMATION}.${MEASUREMENT_P2}`;
    const reactivePower2 = `${STATE_ESTIMATION}.${MEASUREMENT_Q2}`;

    const activePower1Field = (
        <PowerWithValidityForm
            id={activePower1}
            field={FieldType.ACTIVE_POWER}
            measurement={equipmentToModify?.measurementP1}
        />
    );

    const reactivePower1Field = (
        <PowerWithValidityForm
            id={reactivePower1}
            field={FieldType.REACTIVE_POWER}
            measurement={equipmentToModify?.measurementQ1}
        />
    );

    const activePower2Field = (
        <PowerWithValidityForm
            id={activePower2}
            field={FieldType.ACTIVE_POWER}
            measurement={equipmentToModify?.measurementP2}
        />
    );

    const reactivePower2Field = (
        <PowerWithValidityForm
            id={reactivePower2}
            field={FieldType.REACTIVE_POWER}
            measurement={equipmentToModify?.measurementQ2}
        />
    );

    return (
        <>
            <GridSection title="MeasurementsSection" customStyle={styles.h3} />
            <GridSection title="Side1" heading={4} />
            <Grid container spacing={2}>
                <GridItem size={12}>{activePower1Field}</GridItem>
                <GridItem size={12}>{reactivePower1Field}</GridItem>
            </Grid>
            <GridSection title="Side2" heading={4} />
            <Grid container spacing={2}>
                <GridItem size={12}>{activePower2Field}</GridItem>
                <GridItem size={12}>{reactivePower2Field}</GridItem>
            </Grid>
        </>
    );
};

export default BranchActiveReactivePowerMeasurementsForm;
