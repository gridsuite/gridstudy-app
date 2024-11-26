/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { styles } from '../parameters';
import { FormattedMessage } from 'react-intl';
import { FloatInput, IntegerInput, Option, SelectInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import LineSeparator from '../../commons/line-separator';
import { ReactElement } from 'react';

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
    render?: (props: ParamProps) => ReactElement;
};

export interface ParamProps {
    defParam: DefParam;
    path: string;
    name: string;
}

function InputRender({ defParam, path, name }: Readonly<ParamProps>) {
    switch (defParam.type) {
        case TYPES.ENUM:
            return (
                <SelectInput
                    name={`${path}.${name}`}
                    label={''}
                    options={defParam?.options ?? []}
                    fullWidth
                    disableClearable
                    size={'small'}
                />
            );
        case TYPES.BOOL:
            return <SwitchInput name={`${path}.${name}`} label={''} />;
        case TYPES.INTEGER:
            return <IntegerInput name={`${path}.${name}`} label={''} />;
        case TYPES.FLOAT:
            return <FloatInput name={`${path}.${name}`} label={''} />;
        case TYPES.STRING:
            return <TextInput name={`${path}.${name}`} label={''} />;
        default:
            return <></>;
    }
}

function Param({ defParam, path, name }: Readonly<ParamProps>) {
    const InputRenderCom = defParam?.render ?? InputRender;
    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={defParam.label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <InputRenderCom defParam={defParam} path={path} name={name} />
            </Grid>
        </>
    );
}

interface ParamListProps {
    defParams: Record<string, DefParam>;
    path: string;
}

export function ParamList({ defParams, path }: Readonly<ParamListProps>) {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            <Param defParam={defParams[key]} path={path} name={key} />
            <LineSeparator />
        </Grid>
    ));
}
