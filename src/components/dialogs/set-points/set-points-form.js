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
} from '../dialogUtils';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import React from 'react';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import {
    ACTIVE_POWER_SET_POINT,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_REGULATION,
} from 'components/utils/field-constants';
import { useWatch } from 'react-hook-form';
import FrequencyRegulation from './frequency-regulation';
import VoltageRegulation from './voltage-regulation';
import SwitchInput from 'components/utils/rhf-inputs/booleans/switch-input';
import { FormattedMessage, useIntl } from 'react-intl';
import CheckboxNullableInput from 'components/utils/rhf-inputs/boolean-nullable-input';

const SetPointsForm = ({
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions,
    isEquipmentModification = false,
    previousValues,
}) => {
    const intl = useIntl();
    const watchVoltageRegulation = useWatch({
        name: VOLTAGE_REGULATION,
    });

    const previousRegulation = () => {
        if (previousValues?.voltageRegulatorOn) {
            return intl.formatMessage({ id: 'On' });
        }
        if (previousValues?.voltageRegulatorOn === false) {
            return intl.formatMessage({ id: 'Off' });
        }
        return null;
    };

    const activePowerSetPointField = (
        <FloatInput
            name={ACTIVE_POWER_SET_POINT}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={previousValues?.targetP}
            clearable={true}
        />
    );

    const reactivePowerSetPointField = (
        <FloatInput
            name={REACTIVE_POWER_SET_POINT}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
            previousValue={previousValues?.targetQ}
            clearable={true}
        />
    );

    const voltageRegulationField = isEquipmentModification ? (
        <Box>
            <CheckboxNullableInput
                name={VOLTAGE_REGULATION}
                label={'VoltageRegulationText'}
                previousValue={previousRegulation()}
            />
        </Box>
    ) : (
        <Box>
            <SwitchInput
                name={VOLTAGE_REGULATION}
                label={'VoltageRegulationText'}
            />
        </Box>
    );

    const voltageRegulationFields = (
        <VoltageRegulation
            voltageLevelOptions={voltageLevelOptions}
            currentNodeUuid={currentNodeUuid}
            studyUuid={studyUuid}
            previousValues={previousValues}
            isEquipmentModification={isEquipmentModification}
        />
    );

    return (
        <>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerSetPointField, 4)}
                {gridItem(reactivePowerSetPointField, 4)}
            </Grid>
            <Grid container spacing={2} paddingTop={2}>
                <Box sx={{ width: '100%' }} />
                {gridItemWithTooltip(
                    voltageRegulationField,
                    watchVoltageRegulation !== null ? (
                        ''
                    ) : (
                        <FormattedMessage id={'NoModification'} />
                    ),
                    4
                )}

                {voltageRegulationFields}

                <Box sx={{ width: '100%' }} />
                <FrequencyRegulation
                    isEquipmentModification={isEquipmentModification}
                    previousValues={previousValues}
                />
            </Grid>
        </>
    );
};

export default SetPointsForm;
