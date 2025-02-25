/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useFormContext, useWatch } from 'react-hook-form';
import { ChangeEvent, useCallback } from 'react';
import { ParameterSwitch, ParameterFloat } from '../widget';
import { GENERAL, GENERAL_APPLY_MODIFICATIONS } from './voltage-init-parameters-form';
import { FormattedMessage } from 'react-intl';
import { Box, Grid, Alert } from '@mui/material';
import { REACTIVE_SLACKS_THRESHOLD, SHUNT_COMPENSATOR_ACTIVATION_THRESHOLD } from './voltage-init-constants';
import { ReactivePowerAdornment } from '../../dialog-utils';
import { UPDATE_BUS_VOLTAGE } from 'components/utils/field-constants';
import LineSeparator from '../../commons/line-separator';
import { styles } from '../parameters-style';

export const GeneralParameters = () => {
    const { setValue } = useFormContext();

    const applyModificationsWatched = useWatch({
        name: `${GENERAL}.${GENERAL_APPLY_MODIFICATIONS}`,
    });

    const updateBusVoltageWatched = useWatch({
        name: `${GENERAL}.${UPDATE_BUS_VOLTAGE}`,
    });

    const setApplyModificationsValue = useCallback(
        (_: ChangeEvent, checked: boolean) => {
            setValue(`${GENERAL}.${GENERAL_APPLY_MODIFICATIONS}`, checked, {
                shouldDirty: true,
            });
        },
        [setValue]
    );

    const setUpdateBusVoltageValue = useCallback(
        (_: ChangeEvent, checked: boolean) => {
            setValue(`${GENERAL}.${UPDATE_BUS_VOLTAGE}`, checked, {
                shouldDirty: true,
            });
        },
        [setValue]
    );

    return (
        <Grid>
            <Alert sx={styles.adjustExistingLimitsInfo} severity="info" variant="outlined">
                <FormattedMessage id="VoltageInitParametersGeneralSaveInfo" />
            </Alert>
            <ParameterSwitch
                value={applyModificationsWatched}
                label={'VoltageInitParametersGeneralApplyModificationsLabel'}
                onChange={setApplyModificationsValue}
            />
            <Box my={2}>
                <LineSeparator />
            </Box>
            <ParameterSwitch
                value={updateBusVoltageWatched}
                label={'VoltageInitParametersGeneralUpdateBusVoltageLabel'}
                onChange={setUpdateBusVoltageValue}
            />
            <ParameterFloat
                name={`${GENERAL}.${REACTIVE_SLACKS_THRESHOLD}`}
                style={styles.parameterName}
                label={'ReactiveSlacksThreshold'}
                adornment={ReactivePowerAdornment}
                labelSize={8}
                inputSize={4}
            />
            <ParameterFloat
                name={`${GENERAL}.${SHUNT_COMPENSATOR_ACTIVATION_THRESHOLD}`}
                style={styles.parameterName}
                label={'ShuntCompensatorActivationThreshold'}
                adornment={ReactivePowerAdornment}
                tooltip={'ShuntCompensatorActivationThresholdDescription'}
                labelSize={8}
                inputSize={4}
            />
        </Grid>
    );
};
