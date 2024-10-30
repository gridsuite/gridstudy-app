/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, MenuItem, Select, SelectProps } from '@mui/material';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import styles from '../styles';

type DefaultValueType = NonNullable<MessageDescriptor['id']>;

export type DropDownProps<Value = DefaultValueType> = {
    value: SelectProps<Value>['value'];
    label: NonNullable<MessageDescriptor['id']>;
    values: Record<string, Value> | ArrayLike<Value>;
    callback: SelectProps<Value>['onChange'];
};

export default function DropDown<Value = DefaultValueType>({
    value,
    label,
    values,
    callback,
}: Readonly<DropDownProps<Value>>) {
    return (
        <>
            <Grid item xs={5} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Select labelId={label} value={value} onChange={callback} size="small">
                    {Object.entries(values).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            {/* @ts-expect-error TS2322: Type Value is unknown translation keys because we don't know in advance what the server will send us */}
                            <FormattedMessage id={value} />
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </>
    );
}
