/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Switch, SwitchProps } from '@mui/material';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import styles from '../styles';

export type SwitchWithLabelProps = {
    value: boolean;
    label: NonNullable<MessageDescriptor['id']>;
    callback: NonNullable<SwitchProps['onChange']>;
};

export default function SwitchWithLabel({ value, label, callback }: Readonly<SwitchWithLabelProps>) {
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
}
