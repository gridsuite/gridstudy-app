/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Switch, SwitchProps, Theme } from '@mui/material';
import { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';

export const styles = {
    parameterName: (theme: Theme) => ({
        fontWeight: 'bold',
        marginTop: theme.spacing(1),
    }),
    controlItem: {
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
};

interface SwitchWithLabelProps extends Pick<SwitchProps, 'onChange'> {
    value: boolean;
    label: string;
}

export const SwitchWithLabel: FunctionComponent<SwitchWithLabelProps> = ({
    value,
    label,
    onChange: callback,
}) => {
    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Switch
                    checked={value}
                    onChange={callback}
                    value={value}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </Grid>
        </>
    );
};
