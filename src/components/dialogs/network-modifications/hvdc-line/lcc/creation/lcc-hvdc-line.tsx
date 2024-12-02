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
import yup from '../../../../../utils/yup-config';
import { LccCreationInfos, LccFormInfos } from './lcc-creation.type';

export const getLccHvdcLineSchema = () =>
    yup.object().shape({
        [NOMINAL_V]: yup.number().nullable().required(),
        [R]: yup.number().nullable().required(),
        [MAX_P]: yup.number().nullable().required(),
        [CONVERTERS_MODE]: yup.string().required(),
        [ACTIVE_POWER_SETPOINT]: yup.number().nullable().required(),
    });

export function getLccHvdcLineEmptyFormData() {
    return {
        [NOMINAL_V]: null,
        [R]: null,
        [MAX_P]: null,
        [CONVERTERS_MODE]: null,
        [ACTIVE_POWER_SETPOINT]: null,
    };
}

export function getLccHvdcLineFromSearchCopy(hvdcLine: LccFormInfos) {
    return {
        [NOMINAL_V]: hvdcLine.nominalV,
        [R]: hvdcLine.r,
        [MAX_P]: hvdcLine.maxP,
        [CONVERTERS_MODE]: hvdcLine.convertersMode,
        [ACTIVE_POWER_SETPOINT]: hvdcLine.activePowerSetpoint,
    };
}

export function getLccHvdcLineFromEditData(hvdcLine: LccCreationInfos) {
    return {
        [NOMINAL_V]: hvdcLine.nominalV,
        [R]: hvdcLine.r,
        [MAX_P]: hvdcLine.maxP,
        [CONVERTERS_MODE]: hvdcLine.convertersMode,
        [ACTIVE_POWER_SETPOINT]: hvdcLine.activePowerSetpoint,
    };
}
interface LccHvdcLinePaneProps {
    id: string;
}

export default function LccHvdcLinePane({ id }: Readonly<LccHvdcLinePaneProps>) {
    const dcNominalVoltageField = (
        <FloatInput name={`${id}.${NOMINAL_V}`} adornment={VoltageAdornment} label={'dcNominalVoltageLabel'} />
    );

    const dcResistanceField = <FloatInput name={`${id}.${R}`} adornment={OhmAdornment} label={'dcResistanceLabel'} />;

    const maximumActivePowerField = (
        <FloatInput name={`${id}.${MAX_P}`} adornment={ActivePowerAdornment} label={'MaximumActivePowerText'} />
    );

    const converterModeField = (
        <SelectInput
            name={`${id}.${CONVERTERS_MODE}`}
            label={'converterModeLabel'}
            options={Object.values(VSC_CONVERTER_MODE)}
            size={'small'}
            disableClearable
        />
    );

    const activePowerField = (
        <FloatInput
            name={`${id}.${ACTIVE_POWER_SETPOINT}`}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
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

            <PropertiesForm />
        </Grid>
    );
}
