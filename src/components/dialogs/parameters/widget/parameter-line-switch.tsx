/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Grid, Switch } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { UseParameterStateParamName, useParameterState } from '../use-parameters-state';
import { styles } from '../parameters-style';

type SwitchParameterLineProps = {
    readonly paramNameId: UseParameterStateParamName;
    disabled?: boolean;
    label?: string;
};
const ParameterLineSwitch = ({ paramNameId, label, disabled = false }: SwitchParameterLineProps) => {
    const [parameterValue, handleChangeParameterValue] = useParameterState(paramNameId);

    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Switch
                    checked={parameterValue}
                    onChange={(_event, isChecked) => {
                        handleChangeParameterValue(isChecked);
                    }}
                    value={parameterValue}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                    disabled={disabled}
                />
            </Grid>
        </>
    );
};

export default ParameterLineSwitch;
