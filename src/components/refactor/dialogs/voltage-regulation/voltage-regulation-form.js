import SelectInput from '../../rhf-inputs/select-input';
import { REGULATION_TYPES } from '../../../network/constants';
import {
    Q_PERCENT,
    REGULATING_TERMINAL,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../utils/field-constants';
import React from 'react';
import FloatInput from '../../rhf-inputs/float-input';
import {
    gridItem,
    percentageTextField,
    VoltageAdornment,
} from '../../../dialogs/dialogUtils';
import RegulatingTerminalForm from '../regulating-terminal/regulating-terminal-form';
import { Box } from '@mui/system';
import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';
import { useWatch } from 'react-hook-form';

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const VoltageRegulationForm = ({
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
}) => {
    const voltageRegulationType = useWatch({
        name: VOLTAGE_REGULATION_TYPE,
    });

    const isDistantRegulation =
        voltageRegulationType === REGULATION_TYPES.DISTANT.id;

    const voltageRegulationTypeField = (
        <SelectInput
            options={Object.values(REGULATION_TYPES)}
            name={VOLTAGE_REGULATION_TYPE}
            label={'RegulationTypeText'}
            size={'small'}
        />
    );

    const voltageSetPointField = (
        <FloatInput
            name={VOLTAGE_SET_POINT}
            label={'VoltageText'}
            adornment={VoltageAdornment}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={REGULATING_TERMINAL}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            voltageLevelsEquipmentsOptionsPromise={
                voltageLevelsEquipmentsOptionsPromise
            }
            equipmentSectionTypeDefaultValue={''}
        />
    );

    const qPercentField = (
        <FloatInput
            name={Q_PERCENT}
            label={'QPercentText'}
            adornment={percentageTextField}
        />
    );

    return (
        <>
            {gridItem(voltageRegulationTypeField, 4)}
            <Box sx={{ width: '100%' }} />
            <Grid item xs={4} justifySelf={'end'} />
            {gridItem(voltageSetPointField, 4)}
            <Box sx={{ width: '100%' }} />
            {isDistantRegulation && (
                <>
                    <Grid item xs={4} justifySelf={'end'}>
                        <FormattedMessage id="RegulatingTerminalGenerator" />
                    </Grid>
                    {gridItem(regulatingTerminalField, 8)}
                    <Grid item xs={4} justifySelf={'end'} />
                    {gridItem(qPercentField, 4)}
                </>
            )}
        </>
    );
};

export default VoltageRegulationForm;
