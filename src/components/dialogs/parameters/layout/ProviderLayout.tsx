/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Grid } from '@mui/material';
import {
    CloseButton,
    DropDown,
    LabelledButton,
    useStyles,
} from '../parameters';
import { LineSeparator } from '../../dialogUtils';
import { SelectInputProps } from '@mui/material/Select/SelectInput';

type ProviderLayoutParams<P = unknown> = {
    provider: P | '';
    providers: P[];
    updateProviderCallback: SelectInputProps<P>['onChange'];
    keyContainer: string;
    resetCallbackParametersAndProvider: unknown;
    resetCallbackParameters: unknown;
    callbackHideParameters: unknown;
};

export const ProviderLayout: FunctionComponent<
    PropsWithChildren<ProviderLayoutParams>
> = (props, context) => {
    const classes = useStyles();

    // we must keep the line of the simulator selection visible during scrolling
    return (
        <>
            <Grid container spacing={1} sx={{ marginTop: 1 }}>
                <Grid
                    container
                    spacing={1}
                    sx={{ padding: 0, paddingBottom: 2 }}
                >
                    <DropDown
                        value={props.provider}
                        label="Provider"
                        values={props.providers}
                        callback={props.updateProviderCallback}
                    />
                </Grid>
                <Grid
                    container
                    key={props.keyContainer}
                    className={classes.scrollableGrid}
                >
                    {props.children}
                </Grid>
            </Grid>
            <LineSeparator />
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <LabelledButton
                    callback={props.resetCallbackParametersAndProvider}
                    label="resetToDefault"
                    name={undefined}
                />
                <LabelledButton
                    label="resetProviderValuesToDefault"
                    callback={props.resetCallbackParameters}
                    name={undefined}
                />
                <CloseButton
                    hideParameters={props.callbackHideParameters}
                    classeStyleName={undefined}
                />
            </Grid>
        </>
    );
};
