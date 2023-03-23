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
import { FormattedMessage } from 'react-intl';
import CheckboxNullableInput from 'components/refactor/rhf-inputs/boolean-nullable-input';
import { PREVIOUS_VOLTAGE_REGULATION_TYPE } from '../modification/generator-modification-utils';

const SetPointsForm = ({
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions,
    isGeneratorModification = false,
}) => {
    const watchVoltageRegulation = useWatch({
        name: VOLTAGE_REGULATION,
    });

    const watchVoltageRegulationPreviousValue = useWatch({
        name: PREVIOUS_VOLTAGE_REGULATION_TYPE,
    });

    const isVoltageRegulationOn =
        watchVoltageRegulation ||
        (watchVoltageRegulation === null &&
            watchVoltageRegulationPreviousValue);

    const activePowerSetPointField = (
        <FloatInput
            name={ACTIVE_POWER_SET_POINT}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            clearable={true}
        />
    );

    const voltageRegulationField = isGeneratorModification ? (
        <Box>
            <CheckboxNullableInput
                name={VOLTAGE_REGULATION}
                label={'VoltageRegulationText'}
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
            clearable={true}
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
                />
            </Grid>
        </>
    );
};

export default SetPointsForm;
