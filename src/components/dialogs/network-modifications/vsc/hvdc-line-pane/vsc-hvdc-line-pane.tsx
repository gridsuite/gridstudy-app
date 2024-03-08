/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, SelectInput, SwitchInput } from '@gridsuite/commons-ui';
import {
    ACTIVE_POWER,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTERS_MODE,
    DC_NOMINAL_VOLTAGE,
    DC_RESISTANCE,
    DROOP,
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
import React, { FunctionComponent, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { useFormContext, useWatch } from 'react-hook-form';
import { VscModificationInfo } from 'services/network-modification-types';
import CheckboxNullableInput from '../../../../utils/rhf-inputs/boolean-nullable-input';
import { useIntl } from 'react-intl';

interface VscHvdcLinePaneProps {
    id: string;
    isEquipementModification?: boolean;
    previousValues?: VscModificationInfo | null;
}

const VscHvdcLinePane: FunctionComponent<VscHvdcLinePaneProps> = ({
    id,
    isEquipementModification = false,
    previousValues,
}) => {
    const intl = useIntl();
    const { trigger } = useFormContext();

    const angleDroopWatch = useWatch({
        name: `${id}.${ANGLE_DROOP_ACTIVE_POWER_CONTROL}`,
    });

    useEffect(() => {
        if (!angleDroopWatch) {
            trigger(`${id}.${P0}`);
            trigger(`${id}.${DROOP}`);
        }
    }, [angleDroopWatch, trigger, id]);

    const dcNominalVoltageField = (
        <FloatInput
            name={`${id}.${DC_NOMINAL_VOLTAGE}`}
            adornment={VoltageAdornment}
            label={'dcNominalVoltageLabel'}
            previousValue={previousValues?.dcNominalVoltage}
        />
    );

    const dcResistanceField = (
        <FloatInput
            name={`${id}.${DC_RESISTANCE}`}
            adornment={OhmAdornment}
            label={'dcResistanceLabel'}
            previousValue={previousValues?.dcResistance}
        />
    );

    const maximumActivePowerField = (
        <FloatInput
            name={`${id}.${MAXIMUM_ACTIVE_POWER}`}
            adornment={ActivePowerAdornment}
            label={'MaximumActivePowerText'}
            previousValue={previousValues?.maximumActivePower}
        />
    );

    const operatorActivePowerLimitSide1Field = (
        <FloatInput
            name={`${id}.${OPERATOR_ACTIVE_POWER_LIMIT_SIDE1}`}
            adornment={ActivePowerAdornment}
            label={'operatorActivePowerLimitSide1Label'}
            previousValue={
                previousValues?.hvdcOperatorActivePowerRange?.oprFromCS1toCS2
            }
        />
    );

    const operatorActivePowerLimitSide2Field = (
        <FloatInput
            name={`${id}.${OPERATOR_ACTIVE_POWER_LIMIT_SIDE2}`}
            adornment={ActivePowerAdornment}
            label={'operatorActivePowerLimitSide2Label'}
            previousValue={
                previousValues?.hvdcOperatorActivePowerRange?.oprFromCS2toCS1
            }
        />
    );

    const previousConverterMode = () => {
        if (
            previousValues?.convertersMode ===
            VSC_CONVERTER_MODE.SIDE_1_INVERTER_SIDE_2_RECTIFIER.id
        ) {
            return intl.formatMessage({
                id: VSC_CONVERTER_MODE.SIDE_1_INVERTER_SIDE_2_RECTIFIER.label,
            });
        } else if (
            previousValues?.convertersMode ===
            VSC_CONVERTER_MODE.SIDE_1_RECTIFIER_SIDE_2_INVERTER.id
        ) {
            return intl.formatMessage({
                id: VSC_CONVERTER_MODE.SIDE_1_RECTIFIER_SIDE_2_INVERTER.label,
            });
        }
    };

    const converterModeField = (
        <SelectInput
            name={`${id}.${CONVERTERS_MODE}`}
            label={'converterModeLabel'}
            options={Object.values(VSC_CONVERTER_MODE)}
            size={'small'}
            disableClearable
            previousValue={previousConverterMode()}
        />
    );

    const activePowerField = (
        <FloatInput
            name={`${id}.${ACTIVE_POWER}`}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={previousValues?.activePower}
        />
    );

    const previousAngleDropPowerControl = () => {
        if (
            previousValues?.hvdcAngleDroopActivePowerControl?.isEnabled === true
        ) {
            return intl.formatMessage({ id: 'On' });
        }

        return intl.formatMessage({ id: 'Off' });
    };

    function getAngleDroopActivePowerControlField() {
        if (isEquipementModification) {
            return (
                <CheckboxNullableInput
                    name={`${id}.${ANGLE_DROOP_ACTIVE_POWER_CONTROL}`}
                    label={'angleDroopActivePowerControlLabel'}
                    previousValue={previousAngleDropPowerControl()}
                    id={undefined}
                    formProps={undefined}
                />
            );
        } else {
            return (
                <SwitchInput
                    name={`${id}.${ANGLE_DROOP_ACTIVE_POWER_CONTROL}`}
                    label={'angleDroopActivePowerControlLabel'}
                />
            );
        }
    }

    const AngleDroopActivePowerControl = getAngleDroopActivePowerControlField();

    const p0Field = (
        <FloatInput
            name={`${id}.${P0}`}
            label={'p0Label'}
            adornment={ActivePowerAdornment}
            previousValue={previousValues?.hvdcAngleDroopActivePowerControl?.p0}
        />
    );

    const droopField = (
        <FloatInput
            name={`${id}.${DROOP}`}
            label={'droopLabel'}
            previousValue={
                previousValues?.hvdcAngleDroopActivePowerControl?.droop
            }
        />
    );

    return (
        <Grid container spacing={2}>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {gridItem(dcNominalVoltageField, 6)}
                {gridItem(dcResistanceField, 6)}
                {gridItem(maximumActivePowerField, 6)}
            </Grid>

            <GridSection title={'Limits'} />
            <Grid container spacing={2}>
                {gridItem(operatorActivePowerLimitSide1Field, 6)}
                {gridItem(operatorActivePowerLimitSide2Field, 6)}
            </Grid>

            <GridSection title={'Setpoints'} />
            <Grid container spacing={2}>
                {gridItem(converterModeField, 6)}
                {gridItem(activePowerField, 6)}
                {gridItem(AngleDroopActivePowerControl, 12)}
                {gridItem(droopField, 6)}
                {gridItem(p0Field, 6)}
            </Grid>
        </Grid>
    );
};

export default VscHvdcLinePane;
