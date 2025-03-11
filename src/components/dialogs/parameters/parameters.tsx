/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, PropsWithChildren } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Button, ButtonProps, Grid, Switch, Typography, TypographyProps } from '@mui/material';
import { styles } from './parameters-style';

interface LabelledButtonProps extends ButtonProps {
    callback: React.MouseEventHandler<HTMLButtonElement>;
    label: string;
}

export const LabelledButton: FunctionComponent<LabelledButtonProps> = ({ callback, label, ...props }) => {
    return (
        <Button onClick={callback} {...props}>
            <FormattedMessage id={label} />
        </Button>
    );
};

interface SwitchWithLabelProps {
    value: boolean;
    label: string;
    callback?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

export const SwitchWithLabel: FunctionComponent<SwitchWithLabelProps> = ({ value, label, callback }) => {
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

interface TabPanelProps<T> extends TypographyProps {
    value: T;
    index: T;
    keepState?: boolean;
}

export const TabPanel = <T,>(props: PropsWithChildren<TabPanelProps<T>>) => {
    const { children, value, index, keepState, ...other } = props;
    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{ flexGrow: 1 }}
            {...other}
        >
            {(value === index || keepState) && <Box sx={styles.panel}>{children}</Box>}
        </Typography>
    );
};
