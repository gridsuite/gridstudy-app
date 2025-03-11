/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { FloatInput, IntegerInput, Option, SelectInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import LineSeparator from '../../commons/line-separator';
import { ReactElement } from 'react';
import { styles } from '../parameters-style';

// --- define data types --- //
export enum TYPES {
    ENUM = 'ENUM',
    BOOL = 'BOOL',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    STRING = 'STRING',
}

export type DefParam = {
    type: TYPES;
    label: string;
    options?: Option[];
    render?: (defParam: DefParam, path: string, key: string) => ReactElement;
};

const defaultParamRender = (defParam: DefParam, path: string, key: string) => {
    switch (defParam.type) {
        case TYPES.ENUM:
            return (
                <SelectInput
                    name={`${path}.${key}`}
                    label={''}
                    options={defParam?.options ?? []}
                    fullWidth
                    size={'small'}
                />
            );
        case TYPES.BOOL:
            return <SwitchInput name={`${path}.${key}`} label={''} />;
        case TYPES.INTEGER:
            return <IntegerInput name={`${path}.${key}`} label={''} />;
        case TYPES.FLOAT:
            return <FloatInput name={`${path}.${key}`} label={''} />;
        case TYPES.STRING:
            return <TextInput name={`${path}.${key}`} label={''} />;
        default:
            return <></>;
    }
};

export const makeComponents = (defParams: Record<string, DefParam>, path: string) => {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            {makeComponent(defParams[key], path, key)}
            <LineSeparator />
        </Grid>
    ));
};

export const makeComponent = (defParam: DefParam, path: string, key: string) => {
    const render = defParam?.render ?? defaultParamRender;
    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={defParam.label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                {render(defParam, path, key)}
            </Grid>
        </>
    );
};
