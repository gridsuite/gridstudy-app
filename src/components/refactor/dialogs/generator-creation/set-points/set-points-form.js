/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ActivePowerAdornment,
    gridItem,
    gridItemWithTooltip,
    GridSection,
    ReactivePowerAdornment,
} from '../../../../dialogs/dialogUtils';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import React from 'react';
import FloatInput from '../../../rhf-inputs/float-input';
import {
    ACTIVE_POWER_SET_POINT,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_REGULATION,
} from '../../../utils/field-constants';
import { useWatch } from 'react-hook-form';
import FrequencyRegulation from './frequency-regulation';
import VoltageRegulation from './voltage-regulation';
import SwitchInput from '../../../rhf-inputs/booleans/switch-input';
import CheckboxInput from 'components/refactor/rhf-inputs/booleans/checkbox-input';
import { FormattedMessage } from 'react-intl';

const SetPointsForm = ({
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions,
    isGeneratorModification,
}) => {
    const isVoltageRegulationOn = useWatch({
        name: VOLTAGE_REGULATION,
    });

    const activePowerSetPointField = (
        <FloatInput
            name={ACTIVE_POWER_SET_POINT}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
        />
    );

    const voltageRegulationField = isGeneratorModification ? (
        <CheckboxInput
            name={VOLTAGE_REGULATION}
            label={'VoltageRegulationText'}
        />
    ) : (
        <SwitchInput
            name={VOLTAGE_REGULATION}
            label={'VoltageRegulationText'}
        />
    );

    const reactivePowerSetPointField = (
        <FloatInput
            name={REACTIVE_POWER_SET_POINT}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
        />
    );

    const voltageRegulationFields = (
        <VoltageRegulation
            voltageLevelOptions={voltageLevelOptions}
            currentNodeUuid={currentNodeUuid}
            studyUuid={studyUuid}
        />
    );

    return (
        <>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerSetPointField, 4)}
                <Box sx={{ width: '100%' }} />
                {isGeneratorModification
                    ? gridItemWithTooltip(
                          voltageRegulationField,
                          <FormattedMessage id={'NoModification'} />
                      )
                    : gridItem(voltageRegulationField, 4)}
                {!isVoltageRegulationOn &&
                    gridItem(reactivePowerSetPointField, 4)}
                {isVoltageRegulationOn && voltageRegulationFields}
                <Box sx={{ width: '100%' }} />
                <FrequencyRegulation />
            </Grid>
        </>
    );
};

export default SetPointsForm;
