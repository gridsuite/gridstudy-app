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
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
} from '../../../utils/field-constants';
import { useWatch } from 'react-hook-form';
import FrequencyRegulation from './frequency-regulation';
import VoltageRegulation from './voltage-regulation';
import SwitchInput from '../../../rhf-inputs/booleans/switch-input';
import { FormattedMessage, useIntl } from 'react-intl';
import CheckboxNullableInput from 'components/refactor/rhf-inputs/boolean-nullable-input';
import { getPreviousValueFieldName } from 'components/refactor/utils/utils';

const SetPointsForm = ({
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions,
    isGeneratorModification = false,
    //previousValues,
}) => {
    const intl = useIntl();
    const watchVoltageRegulation = useWatch({
        name: VOLTAGE_REGULATION,
    });

    const isVoltageRegulationOn =
        watchVoltageRegulation ||
        (watchVoltageRegulation === null &&
            getPreviousValueFieldName(VOLTAGE_REGULATION) === true);

    const previousRegulation = () => {
        if (getPreviousValueFieldName(VOLTAGE_REGULATION))
            return intl.formatMessage({ id: 'On' });
        else if (getPreviousValueFieldName(VOLTAGE_REGULATION) === false)
            return intl.formatMessage({ id: 'Off' });
        else return null;
    };

    const activePowerSetPointField = (
        <FloatInput
            name={ACTIVE_POWER_SET_POINT}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            //previousValue={previousValues?.targetP}
            clearable={true}
        />
    );

    const voltageRegulationField = isGeneratorModification ? (
        <Box>
            <CheckboxNullableInput
                name={VOLTAGE_REGULATION}
                label={'VoltageRegulationText'}
                //previousValue={previousRegulation()}
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

    const reactivePowerSetPointField = (
        <FloatInput
            name={REACTIVE_POWER_SET_POINT}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
           // previousValue={previousValues?.targetQ}
            clearable={true}
        />
    );

    const voltageRegulationFields = (
        <VoltageRegulation
            voltageLevelOptions={voltageLevelOptions}
            currentNodeUuid={currentNodeUuid}
            studyUuid={studyUuid}
            //previousValues={previousValues}
        />
    );

    return (
        <>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerSetPointField, 4)}
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

                {isVoltageRegulationOn
                    ? voltageRegulationFields
                    : gridItem(reactivePowerSetPointField, 4)}

                <Box sx={{ width: '100%' }} />
                <FrequencyRegulation
                    isGeneratorModification={isGeneratorModification}
                    //previousValues={previousValues}
                />
            </Grid>
        </>
    );
};

export default SetPointsForm;
