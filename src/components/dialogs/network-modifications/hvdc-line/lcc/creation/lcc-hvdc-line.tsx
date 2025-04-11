/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, SelectInput } from '@gridsuite/commons-ui';
import { ACTIVE_POWER_SETPOINT, CONVERTERS_MODE, MAX_P, NOMINAL_V, R } from '../../../../../utils/field-constants';
import { ActivePowerAdornment, OhmAdornment, VoltageAdornment } from '../../../../dialog-utils';
import { VSC_CONVERTER_MODE } from 'components/network/constants';
import { Grid } from '@mui/material';
import PropertiesForm from 'components/dialogs/network-modifications/common/properties/properties-form';
import GridSection from '../../../../commons/grid-section';
import GridItem from '../../../../commons/grid-item';
import { LccModificationInfo } from '../../../../../../services/network-modification-types';

interface LccHvdcLineProps {
    id: string;
    previousValues?: LccModificationInfo | null;
}

export default function LccHvdcLine({ id, previousValues }: Readonly<LccHvdcLineProps>) {
    const dcNominalVoltageField = (
        <FloatInput
            name={`${id}.${NOMINAL_V}`}
            adornment={VoltageAdornment}
            label={'dcNominalVoltageLabel'}
            previousValue={previousValues?.nominalV}
        />
    );

    const dcResistanceField = (
        <FloatInput
            name={`${id}.${R}`}
            adornment={OhmAdornment}
            label={'dcResistanceLabel'}
            previousValue={previousValues?.r}
        />
    );

    const maximumActivePowerField = (
        <FloatInput
            name={`${id}.${MAX_P}`}
            adornment={ActivePowerAdornment}
            label={'MaximumActivePowerText'}
            previousValue={previousValues?.maxP}
        />
    );

    const converterModeField = (
        <SelectInput
            name={`${id}.${CONVERTERS_MODE}`}
            label={'converterModeLabel'}
            options={Object.values(VSC_CONVERTER_MODE)}
            size={'small'}
            disableClearable
            previousValue={previousValues?.convertersMode}
        />
    );

    const activePowerField = (
        <FloatInput
            name={`${id}.${ACTIVE_POWER_SETPOINT}`}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={previousValues?.activePowerSetpoint}
        />
    );

    return (
        <Grid container spacing={2}>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem>{dcNominalVoltageField}</GridItem>
                <GridItem>{dcResistanceField}</GridItem>
                <GridItem>{maximumActivePowerField}</GridItem>
            </Grid>
            <GridSection title={'Setpoints'} />
            <Grid container spacing={2}>
                <GridItem>{converterModeField}</GridItem>
                <GridItem>{activePowerField}</GridItem>
            </Grid>

            <PropertiesForm id={id} />
        </Grid>
    );
}
