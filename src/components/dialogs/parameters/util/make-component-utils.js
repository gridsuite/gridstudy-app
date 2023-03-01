/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { LabelledSilder, LineSeparator } from '../../dialogUtils';
import { SwitchWithLabel } from '../common/switch-with-label';
import { DropDown } from '../common/drop-down';
import { CountrySelector } from '../common/country-selector';
import IntegerInput from '../common/integer-input';
import DoubleInput from '../common/double-input';
import StringInput from '../common/string-input';

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
            />
        );
    };
export const makeRenderLabelledSlider =
    () => (defParam, key, params, setter, value) => {
        return (
            <LabelledSilder
                value={Number(value)}
                label={defParam.description}
                onCommitCallback={(event, currentValue) => {
                    setter({ ...params, [key]: currentValue });
                }}
                marks={[
                    { value: Number(0), label: '0' },
                    { value: Number(100), label: '100' },
                ]}
            />
        );
    };
export const makeRenderCountrySelector =
    () => (defParam, key, params, setter, value) => {
        return (
            <CountrySelector
                value={value || []}
                label={defParam.description}
                callback={(newValues) => {
                    setter({ ...params, [key]: [...newValues] });
                }}
            />
        );
    };
export const makeRenderIntegerField =
    () => (defParam, key, params, setter, value) => {
        return (
            <IntegerInput
                value={value}
                label={defParam.description}
                callback={(ev) =>
                    setter({ ...params, [key]: +ev.target.value })
                }
            />
        );
    };
export const makeRenderDoubleField =
    () => (defParam, key, params, setter, value) => {
        return (
            <DoubleInput
                value={value}
                label={defParam.description}
                callback={(ev) =>
                    setter({ ...params, [key]: +ev.target.value })
                }
            />
        );
    };

export const makeRenderStringField =
    () => (defParam, key, params, setter, value) => {
        return (
            <StringInput
                value={value}
                label={defParam.description}
                callback={(ev) => setter({ ...params, [key]: ev.target.value })}
            />
        );
    };

// --- define data types --- //
export const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    slider: 'Slider',
    countries: 'Countries',
    integer: 'Integer',
    double: 'Double',
    string: 'String',
};

// --- define default render for each data types
const DEFAULT_RENDER = {
    [TYPES.bool]: makeRenderSwitchWithLabel(),
    [TYPES.enum]: makeRenderDropDown(),
    [TYPES.slider]: makeRenderLabelledSlider(),
    [TYPES.countries]: makeRenderCountrySelector(),
    [TYPES.integer]: makeRenderIntegerField(),
    [TYPES.double]: makeRenderDoubleField(),
    [TYPES.string]: makeRenderStringField(),
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
