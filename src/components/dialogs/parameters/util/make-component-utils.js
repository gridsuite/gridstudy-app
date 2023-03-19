/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import IntegerInput from '../common/integer-input';
import FloatInput from '../common/float-input';
import TextInput from '../common/text-input';
import { DropDown, SwitchWithLabel } from '../parameters';
import { LineSeparator } from '../../dialogUtils';

// --- define render makers --- //
export const makeRenderSwitchWithLabel =
    () => (defParam, key, params, setter, value) => {
        return (
            <SwitchWithLabel
                value={value}
                label={defParam.description}
                callback={(ev) =>
                    setter({ ...params, [key]: ev.target.checked })
                }
            />
        );
    };
export const makeRenderDropDown =
    () => (defParam, key, params, setter, value) => {
        return (
            <DropDown
                value={value}
                label={defParam.description}
                values={defParam.values}
                callback={(ev) => setter({ ...params, [key]: ev.target.value })}
                renderValue={defParam.renderValue}
            />
        );
    };

export const makeRenderIntegerField =
    () => (defParam, key, params, setter, value) => {
        return (
            <IntegerInput
                value={value}
                label={defParam.description}
                callback={({ value }) => setter({ ...params, [key]: value })}
            />
        );
    };
export const makeRenderFloatField =
    () => (defParam, key, params, setter, value) => {
        return (
            <FloatInput
                value={value}
                label={defParam.description}
                callback={({ value }) => setter({ ...params, [key]: value })}
            />
        );
    };

export const makeRenderTextField =
    () => (defParam, key, params, setter, value) => {
        return (
            <TextInput
                value={value}
                label={defParam.description}
                callback={({ value }) => setter({ ...params, [key]: value })}
            />
        );
    };

// --- define data types --- //
export const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    integer: 'Integer',
    float: 'Float',
    text: 'Text',
};

// --- define default render for each data types
const DEFAULT_RENDER = {
    [TYPES.bool]: makeRenderSwitchWithLabel(),
    [TYPES.enum]: makeRenderDropDown(),
    [TYPES.integer]: makeRenderIntegerField(),
    [TYPES.float]: makeRenderFloatField(),
    [TYPES.text]: makeRenderTextField(),
};

export const makeComponentsFor = (defParams, params, setter) => {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            {makeComponentFor(defParams[key], key, params, setter)}
            <LineSeparator />
        </Grid>
    ));
};

export const getValue = (param, key) => {
    if (!param || param[key] === undefined) return null;
    return param[key];
};

export const makeComponentFor = (defParam, key, params, setter) => {
    const value = getValue(params, key);
    const render = defParam.render ?? DEFAULT_RENDER[defParam.type];
    return render(defParam, key, params, setter, value);
};
