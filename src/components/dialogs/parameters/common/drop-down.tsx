/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, MenuItem, Select, SelectProps, Theme } from '@mui/material';
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

type DropDownProps = Omit<SelectProps<string>, 'label'> & {
    options: Record<string, string>;
    label: string;
};

export const DropDown: FunctionComponent<DropDownProps> = ({
    value,
    label,
    options,
    onChange,
}) => {
    return (
        <>
            <Grid item xs={5} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Select
                    labelId={label}
                    value={value}
                    onChange={onChange}
                    size="small"
                >
                    {Object.entries(options).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            <FormattedMessage id={value} />
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </>
    );
};
