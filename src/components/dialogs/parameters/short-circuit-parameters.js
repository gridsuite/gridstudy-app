/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, MenuItem, Box, Select, Typography } from '@mui/material';
import {
    CloseButton,
    LabelledButton,
    SwitchWithLabel,
    useStyles,
} from './parameters';
import {
    getShortCircuitParameters,
    setShortCircuitParameters,
} from '../../../utils/rest-api';
import { useSnackMessage } from '../../../utils/messages';
import { useSelector } from 'react-redux';
import { LabelledSilder, LineSeparator } from '../dialogUtils';

function getValue(param, key) {
    if (!param || param[key] === undefined) return null;
    return param[key];
}

const DropDown = ({ value, label, values, callback }) => {
    const classes = useStyles();
    return (
        <>
            <Grid item xs={8}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id={label} />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Select
                    labelId={label}
                    value={value}
                    onChange={callback}
                    size="small"
                >
                    {Object.keys(values).map((key) => (
                        <MenuItem key={key} value={key}>
                            <FormattedMessage id={values[key]} />
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </>
    );
};

function makeComponentFor(defParam, key, scParams, setter) {
    const value = getValue(scParams, key);
    if (value != null) {
        if (defParam.type === TYPES.bool) {
            return (
                <SwitchWithLabel
                    value={value}
                    label={defParam.description}
                    callback={(ev) =>
                        setter({ ...scParams, [key]: ev.target.checked })
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
                        setter({ ...scParams, [key]: ev.target.value })
                    }
                />
            );
        } else if (defParam.type === TYPES.slider) {
            return (
                <LabelledSilder
                    value={Number(value)}
                    label={defParam.description}
                    onCommitCallback={(event, currentValue) => {
                        setter({ ...scParams, [key]: currentValue });
                    }}
                    marks={[
                        { value: Number(0), label: '0' },
                        { value: Number(100), label: '100' },
                    ]}
                />
            );
        }
    }
}

function makeComponentsFor(defParams, params, setter) {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            {makeComponentFor(defParams[key], key, params, setter)}
            <LineSeparator />
        </Grid>
    ));
}

const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    slider: 'Slider',
};

const BasicShortCircuitParameters = ({
    shortCircuitParams,
    commitShortCircuitParams,
}) => {
    const paramsDef = {
        withVoltageMap: {
            type: TYPES.bool,
            description: 'descWithVoltageMap',
        },
        withFeederResult: {
            type: TYPES.bool,
            description: 'descWithFeederResult',
        },
        minVoltageDropProportionalThreshold: {
            type: TYPES.slider,
            description: 'descMinVoltageDropProportionalThreshold',
        },
        studyType: {
            type: TYPES.enum,
            description: 'descStudyType',
            values: {
                TRANSIENT: 'descTransient',
                SUB_TRANSIENT: 'descSubTransient',
            },
        },
    };

    return makeComponentsFor(
        paramsDef,
        shortCircuitParams,
        commitShortCircuitParams
    );
};

export const ShortCircuitParameters = ({ hideParameters }) => {
    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);

    const [shortCircuitParams, setShortCircuitParams] = useState(null);

    const commitShortCircuitParameter = useCallback(
        (newParams) => {
            let oldParams = { ...shortCircuitParams };
            setShortCircuitParams(newParams);
            setShortCircuitParameters(studyUuid, newParams).catch(
                (errorMessage) => {
                    setShortCircuitParams(oldParams);
                    snackError(errorMessage, 'paramsChangingError');
                }
            );
        },
        [shortCircuitParams, snackError, studyUuid]
    );

    //Forced to do the following for now because on the backend we use a (de)serializer coming from powsybl-core that ignore parameters with the default value
    //we need to make a PR in powsybl core to not ignore parameters with default value before we can remove this
    //withVoltageMap and withFeederResult are equal to false if they are not present in the json
    const setMissingParametersAndSet = function (params) {
        if (params['withVoltageMap'] === undefined) {
            params['withVoltageMap'] = false;
        }
        if (params['withFeederResult'] === undefined) {
            params['withFeederResult'] = false;
        }
        setShortCircuitParams(params);
    };

    const resetShortCircuitParameters = useCallback(() => {
        setShortCircuitParameters(studyUuid, null)
            .then(() => {
                return getShortCircuitParameters(studyUuid)
                    .then((params) => setMissingParametersAndSet(params))
                    .catch((errorMessage) =>
                        snackError(errorMessage, 'paramsRetrievingError')
                    );
            })
            .catch((errorMessage) =>
                snackError(errorMessage, 'paramsChangingError')
            );
    }, [studyUuid, snackError]);

    useEffect(() => {
        if (studyUuid) {
            getShortCircuitParameters(studyUuid)
                .then((params) => setMissingParametersAndSet(params))
                .catch((errorMessage) =>
                    snackError(errorMessage, 'paramsRetrievingError')
                );
        }
    }, [studyUuid, snackError]);

    return (
        <Grid container className={classes.grid}>
            <Grid container key="params">
                <BasicShortCircuitParameters
                    shortCircuitParams={shortCircuitParams || {}}
                    commitShortCircuitParams={commitShortCircuitParameter}
                />
                <Grid
                    container
                    className={
                        classes.controlItem + ' ' + classes.marginTopButton
                    }
                    maxWidth="md"
                >
                    <LabelledButton
                        callback={resetShortCircuitParameters}
                        label="resetToDefault"
                    />
                    <CloseButton
                        hideParameters={hideParameters}
                        className={classes.button}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
