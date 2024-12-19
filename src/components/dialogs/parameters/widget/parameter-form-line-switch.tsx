/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { FieldLabel, SwitchInput } from '@gridsuite/commons-ui';

export type ParameterFormLineSwitchProps = {
    label: string;
    name: string;
};

export default function ParameterFormLineSwitch({ name, label }: Readonly<ParameterFormLineSwitchProps>) {
    return (
        <Grid container item alignItems="center" direction="row" columnSpacing={2}>
            <Grid item xs>
                <FieldLabel label={label} />
            </Grid>
            <Grid item xs="auto">
                <SwitchInput name={name} />
            </Grid>
        </Grid>
    );
}
