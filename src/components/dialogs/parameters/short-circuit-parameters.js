/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Grid } from '@mui/material';
import {
    getShortCircuitParameters,
    setShortCircuitParameters,
} from '../../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { CloseButton } from './common/close-button';
import { LabelledButton } from './common/labelled-button';
import { useStyles } from './parameters-styles';
import { makeComponentsFor, TYPES } from './util/make-component-utils';

export const useGetShortCircuitParameters = () => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [shortCircuitParams, setShortCircuitParams] = useState(null);

    useEffect(() => {
        if (studyUuid) {
            getShortCircuitParameters(studyUuid)
                .then((params) => setShortCircuitParams(params))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        }
    }, [studyUuid, snackError]);

    return [shortCircuitParams, setShortCircuitParams];
};

const BasicShortCircuitParameters = ({
    shortCircuitParams,
    commitShortCircuitParams,
}) => {
    const paramsDef = {
        withFeederResult: {
            type: TYPES.bool,
            description: 'descWithFeederResult',
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

export const ShortCircuitParameters = ({
    hideParameters,
    useShortCircuitParameters,
}) => {
    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);

    const [shortCircuitParams, setShortCircuitParams] =
        useShortCircuitParameters;

    const commitShortCircuitParameter = useCallback(
        (newParams) => {
            let oldParams = { ...shortCircuitParams };
            setShortCircuitParams(newParams);
            setShortCircuitParameters(studyUuid, newParams).catch((error) => {
                setShortCircuitParams(oldParams);
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [snackError, studyUuid, shortCircuitParams, setShortCircuitParams]
    );

    const resetShortCircuitParameters = useCallback(() => {
        setShortCircuitParameters(studyUuid, null)
            .then(() => {
                return getShortCircuitParameters(studyUuid)
                    .then((params) => setShortCircuitParams(params))
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
    }, [studyUuid, snackError, setShortCircuitParams]);

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
