/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, SwitchProps } from '@mui/material';
import SwitchWithLabel from './switch-with-label';

export type ParameterSwitchProps = {
    label: string;
    value: boolean;
    key?: string;
    onChange: NonNullable<SwitchProps['onChange']>;
};

export const ParameterSwitch = ({ label, value, onChange, key }: ParameterSwitchProps) => {
    return (
        <Grid container spacing={1} paddingTop={1} key={key} justifyContent={'space-between'}>
            <SwitchWithLabel value={value} label={label} callback={onChange} />
        </Grid>
    );
};
