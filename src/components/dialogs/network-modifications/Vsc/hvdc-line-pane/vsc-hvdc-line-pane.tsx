import { FloatInput, SelectInput, SwitchInput } from '@gridsuite/commons-ui';
import {
    ACTIVE_POWER,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTERS_MODE,
    DC_NOMINAL_VOLTAGE,
    DC_RESISTANCE,
    DROOP,
    ID,
    MAXIMUM_ACTIVE_POWER,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE1,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE2,
    P0,
} from '../../../../utils/field-constants';
import {
    ActivePowerAdornment,
    gridItem,
    GridSection,
    OhmAdornment,
    VoltageAdornment,
} from '../../../dialogUtils';
import { VSC_CONVERTER_MODE } from 'components/network/constants';
import React, { FunctionComponent } from 'react';
import Grid from '@mui/material/Grid';
import yup from 'components/utils/yup-config';

interface VscHvdcLinePaneProps {
    id: string;
}

export function getVscHvdcLinePaneSchema(id: string) {
    return {
        [id]: yup.object().shape({
            [DC_NOMINAL_VOLTAGE]: yup.number().nullable(),
            [DC_RESISTANCE]: yup.number().nullable(),
            [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: yup.number().nullable(),
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: yup.number().nullable(),
            [CONVERTERS_MODE]: yup.object().shape({
                [ID]: yup.string(),
                label: yup.string(),
            }),
            [ACTIVE_POWER]: yup.number().nullable(),
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: yup.boolean(),
            [P0]: yup.number().nullable(),
            [DROOP]: yup.number().nullable(),
        }),
    };
}

export function getVscHvdcLinePaneEmptyFormData(id: string) {
    return {
        [id]: {
            [DC_NOMINAL_VOLTAGE]: null,
            [DC_RESISTANCE]: null,
            [MAXIMUM_ACTIVE_POWER]: null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: null,
            [CONVERTERS_MODE]:
                VSC_CONVERTER_MODE.SIDE_1_INVERTER_SIDE_2_RECTIFIER.id,
            [ACTIVE_POWER]: null,
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: null,
            [P0]: null,
            [DROOP]: null,
        },
    };
}

const VscHvdcLinePane: FunctionComponent<VscHvdcLinePaneProps> = ({ id }) => {
    const dcNominalVoltageField = (
        <FloatInput
            name={`${id}.${DC_NOMINAL_VOLTAGE}`}
            adornment={VoltageAdornment}
            label={'dcNominalVoltageLabel'}
        />
    );

    const dcResistanceField = (
        <FloatInput
            name={`${id}.${DC_RESISTANCE}`}
            adornment={OhmAdornment}
            label={'dcResistanceLabel'}
        />
    );

    const maximumActivePowerField = (
        <FloatInput
            name={`${id}.${MAXIMUM_ACTIVE_POWER}`}
            adornment={ActivePowerAdornment}
            label={'MinimumActivePowerText'}
        />
    );

    const operatorActivePowerLimitSide1Field = (
        <FloatInput
            name={`${id}.${OPERATOR_ACTIVE_POWER_LIMIT_SIDE1}`}
            adornment={ActivePowerAdornment}
            label={'operatorActivePowerLimitSide1Text'}
        />
    );

    const operatorActivePowerLimitSide2Field = (
        <FloatInput
            name={`${id}.${OPERATOR_ACTIVE_POWER_LIMIT_SIDE2}`}
            adornment={ActivePowerAdornment}
            label={'operatorActivePowerLimitSide2Text'}
        />
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
            name={`${id}.${ACTIVE_POWER}`}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
        />
    );

    const AngleDroopActivePowerControl = (
        <SwitchInput
            name={`${id}.${ANGLE_DROOP_ACTIVE_POWER_CONTROL}`}
            label={'angleDroopActivePowerControlText'}
        />
    );

    const p0Field = (
        <FloatInput
            name={`${id}.${P0}`}
            label={'p0Text'}
            adornment={ActivePowerAdornment}
        />
    );

    const droopField = (
        <FloatInput name={`${id}.${DROOP}`} label={'droopText'} />
    );

    return (
        <Grid container spacing={2}>
            <GridSection title="Characteristics" />
            <Grid container item spacing={2}>
                {gridItem(dcNominalVoltageField, 6)}
                {gridItem(dcResistanceField, 6)}
            </Grid>
            <Grid container item spacing={2}>
                {gridItem(maximumActivePowerField, 6)}
            </Grid>

            <GridSection title={'Limits'} />
            <Grid container item spacing={2}>
                {gridItem(operatorActivePowerLimitSide1Field, 6)}
                {gridItem(operatorActivePowerLimitSide2Field, 6)}
            </Grid>

            <GridSection title={'Setpoints'} />
            <Grid container item spacing={2}>
                {gridItem(converterModeField, 6)}
                {gridItem(activePowerField, 6)}
            </Grid>
            <Grid container item spacing={2}>
                {gridItem(AngleDroopActivePowerControl, 6)}
            </Grid>
            <Grid container item spacing={2}>
                {gridItem(droopField, 6)}
                {gridItem(p0Field, 6)}
            </Grid>
        </Grid>
    );
};

export default VscHvdcLinePane;
