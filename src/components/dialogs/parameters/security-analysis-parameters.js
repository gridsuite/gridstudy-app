/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import { Grid, TextField, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { CloseButton, DropDown, LabelledButton, useStyles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import Typography from '@mui/material/Typography';
import { isValidPercentage } from '../percentage-area/percentage-area-utils';
import { isFloatNumber } from '../../utils/inputs/input-hooks';

export const SecurityAnalysisParameters = ({
    hideParameters,
    parametersBackend,
}) => {
    const classes = useStyles();

    const [
        providers,
        provider,
        updateProvider,
        resetProvider,
        params,
        updateParameters,
    ] = parametersBackend;

    const handleUpdateProvider = (evt) => updateProvider(evt.target.value);

    const updateProviderCallback = useCallback(handleUpdateProvider, [
        updateProvider,
    ]);

    const [fieldsValues, setFieldsValues] = useState({
        flowProportionalThreshold: params?.flowProportionalThreshold, //  '0.1',
        lowVoltageProportionalThreshold:
            params?.lowVoltageProportionalThreshold, // '0.0',
        lowVoltageAbsoluteThreshold: params?.lowVoltageAbsoluteThreshold, // '0.0',
        highVoltageProportionalThreshold:
            params?.highVoltageProportionalThreshold, // '0.0',
        highVoltageAbsoluteThreshold: params?.highVoltageAbsoluteThreshold, //'0.0',
    });
    const handleValueChanged = (e, verifyFunction) => {
        if (verifyFunction(e.target.value)) {
            console.log(' value: ', e.target.value);
            setFieldsValues((prevState) => ({
                ...prevState,
                [e.target.name]: e.target.value,
            }));
        }
    };
    const callBack = () => {
        console.log(' all params: ', { ...fieldsValues });
        updateParameters({ ...fieldsValues });
    };

    const {
        flowProportionalThreshold,
        lowVoltageAbsoluteThreshold,
        lowVoltageProportionalThreshold,
        highVoltageProportionalThreshold,
        highVoltageAbsoluteThreshold,
    } = fieldsValues;
    console.log(' fieldsValues: ', fieldsValues);
    console.log(' providers: ', providers);
    // DynaFlow is not supported at the moment for security analysis
    // TODO: remove this when DynaFlow is supported
    const securityAnalysisiProvider = Object.fromEntries(
        Object.entries(providers).filter(([key]) => !key.includes('DynaFlow'))
    );

    return (
        <>
            <Grid
                container
                key="secuAnalysisProvider"
                className={classes.scrollableGrid}
                spacing={1}
            >
                <DropDown
                    value={provider}
                    label="Provider"
                    values={securityAnalysisiProvider}
                    callback={updateProviderCallback}
                />

                <Grid className={classes.text}>
                    <Grid item xs={8} className={classes.text}>
                        <Typography>Masquage des contraintes en N-K</Typography>
                        <Tooltip title="Delete">
                            <InfoIcon />
                        </Tooltip>
                    </Grid>
                </Grid>

                <Grid className={classes.maxWidthItem}>
                    <Grid item xs={4} className={classes.parameterName}>
                        <Typography>Intensité</Typography>
                    </Grid>
                    <Grid
                        item
                        container
                        xs={8}
                        className={classes.singleTextField}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={flowProportionalThreshold}
                            name="flowProportionalThreshold"
                            label={'%'}
                            onBlur={callBack}
                            onChange={(e) =>
                                handleValueChanged(e, isValidPercentage)
                            }
                        />
                    </Grid>
                    <Tooltip title="Delete">
                        <InfoIcon />
                    </Tooltip>
                </Grid>

                <Grid className={classes.item}>
                    <Grid item xs={4} className={classes.parameterName}>
                        <Typography>Tension basse</Typography>
                    </Grid>
                    <Grid
                        item
                        container
                        xs={4}
                        className={classes.multipleTextField}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={lowVoltageProportionalThreshold}
                            label={'%'}
                            name="lowVoltageProportionalThreshold"
                            onBlur={callBack}
                            onChange={(e) =>
                                handleValueChanged(e, isValidPercentage)
                            }
                        />
                    </Grid>
                    <Grid
                        item
                        container
                        xs={4}
                        className={classes.multipleTextField}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={lowVoltageAbsoluteThreshold}
                            label={'kv'}
                            name="lowVoltageAbsoluteThreshold"
                            onBlur={callBack}
                            onChange={(e) =>
                                handleValueChanged(e, isFloatNumber)
                            }
                        />
                    </Grid>
                    <Tooltip title="Delete">
                        <InfoIcon />
                    </Tooltip>
                </Grid>

                <Grid className={classes.item}>
                    <Grid item xs={4} className={classes.parameterName}>
                        <Typography>Tension haute</Typography>
                    </Grid>
                    <Grid
                        item
                        container
                        xs={4}
                        className={classes.multipleTextField}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={highVoltageProportionalThreshold}
                            label={'%'}
                            name="highVoltageProportionalThreshold"
                            onBlur={callBack}
                            onChange={(e) =>
                                handleValueChanged(e, isValidPercentage)
                            }
                        />
                    </Grid>
                    <Grid
                        item
                        container
                        xs={4}
                        className={classes.multipleTextField}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={highVoltageAbsoluteThreshold}
                            label={'kv'}
                            name="highVoltageAbsoluteThreshold"
                            onBlur={callBack}
                            onChange={(e) =>
                                handleValueChanged(e, isFloatNumber)
                            }
                        />
                    </Grid>
                    <Tooltip title="Delete">
                        <InfoIcon />
                    </Tooltip>
                </Grid>
            </Grid>
            <LineSeparator />
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <LabelledButton
                    callback={resetProvider}
                    label="resetToDefault"
                />
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};
