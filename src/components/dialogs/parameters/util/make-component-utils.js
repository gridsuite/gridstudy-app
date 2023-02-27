/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { LineSeparator } from '../../dialogUtils';
import React from 'react';
import { SwitchWithLabel } from '../common/switch-with-label';
import { DropDown } from '../common/drop-down';
import { CountrySelector } from '../common/country-selector';

export const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    countries: 'Countries',
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
export const makeComponentFor = (defParam, key, lfParams, setter) => {
    const value = getValue(lfParams, key);
    if (defParam.type === TYPES.bool) {
        return (
            <SwitchWithLabel
                value={value}
                label={defParam.description}
                callback={(ev) =>
                    setter({ ...lfParams, [key]: ev.target.checked })
                }
            />
        );
    } else if (defParam.type === TYPES.enum) {
        return (
            <DropDown
                value={value}
                label={defParam.description}
                values={defParam.values}
                callback={(ev) =>
                    setter({ ...lfParams, [key]: ev.target.value })
                }
            />
        );
    } else if (defParam.type === TYPES.countries) {
        return (
            <CountrySelector
                value={value || []}
                label={defParam.description}
                callback={(newValues) => {
                    setter({ ...lfParams, [key]: [...newValues] });
                }}
            />
        );
    }
};
