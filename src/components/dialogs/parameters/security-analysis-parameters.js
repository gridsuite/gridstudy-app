/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Grid, TextField, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { CloseButton, DropDown, LabelledButton, useStyles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import Typography from '@mui/material/Typography';
import {
    isPositiveFloatNumber,
    isValidPercentage,
} from '../../../utils/config-params';

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
        resetParameters,
    ] = parametersBackend;

    const handleUpdateProvider = (evt) => updateProvider(evt.target.value);

    const updateProviderCallback = useCallback(handleUpdateProvider, [
        updateProvider,
    ]);
    console.log(' params : ', params);
    const [fieldsValues, setFieldsValues] = useState({
        //todo:  to be replaced with params
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
            setFieldsValues((prevState) => ({
                ...prevState,
                [e.target.name]: e.target.value,
            }));
        }
    };
    const callBack = () => {
        updateParameters({ ...fieldsValues });
    };
    useEffect(() => {
        setFieldsValues({ ...params });
    }, [params]);

    const {
        flowProportionalThreshold,
        lowVoltageAbsoluteThreshold,
        lowVoltageProportionalThreshold,
        highVoltageProportionalThreshold,
        highVoltageAbsoluteThreshold,
    } = fieldsValues;
    // DynaFlow is not supported at the moment for security analysis
    // TODO: remove this when DynaFlow is supported
    const securityAnalysisiProvider = Object.fromEntries(
        Object.entries(providers).filter(([key]) => !key.includes('DynaFlow'))
    );

    const resetSAParametersAndProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    const info =
        "Cette section permet de paramétrer le niveau d'aggravation à partir duquel les contraintes calculées en N réapparaissent en N-k.</br>" +
        '\n' +
        "L'aggravation de contrainte en intensité est déterminée uniquement en pourcentage de la valeur calculée en N pour les ouvrages en contrainte. Par exemple, si l'aggravation en pourcentage correspond à 10 A alors la contrainte en N réapparaitra en N-k pour une augmentation d'intensité de plus de 10 A par rapport à la valeur calculée en N.</br>" +
        '\n' +
        "L'aggravation de contrainte en tension basse peut être calculée en pourcentage ou en définie en valeur absolue par rapport à la valeur calculée en N. La valeur prise en compte sera la plus conservative des deux. Par exemple, si l'aggravation en pourcentage correspond à 1 kV et celle renseignée en absolu est de 2 kV, alors la contrainte en tension basse réapparaitra en N-k pour une chute de tension de plus de 1 kV par rapport à la valeur calculée en N.</br>" +
        '\n' +
        "L'aggravation de contrainte en tension haute peut être calculée en pourcentage ou en définie en valeur absolue par rapport à la valeur calculée en N. La valeur prise en compte sera la plus conservative des deux. Par exemple, si l'aggravation en pourcentage correspond à 1 kV et celle renseignée en absolu est de 2 kV, alors la contrainte en tension haute réapparaitra en N-k pour une élévation de tension de plus de 1 kV par rapport à la valeur calculée en N.</br>";
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

                <Grid className={classes.textContainer}>
                    <Grid item xs={8} className={classes.text}>
                        <Typography>Masquage des contraintes en N-K</Typography>
                        <Tooltip
                            className={classes.tooltip}
                            title={
                                <div
                                    dangerouslySetInnerHTML={{ __html: info }}
                                />
                            }
                            placement="left-start"
                        >
                            <InfoIcon />
                        </Tooltip>
                    </Grid>
                </Grid>

                <Grid className={classes.singleItem}>
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
                    <Tooltip
                        title={
                            <div dangerouslySetInnerHTML={{ __html: info }} />
                        }
                        placement="left-start"
                    >
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
                        className={classes.multipleTextField1}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={lowVoltageAbsoluteThreshold}
                            label={'kv'}
                            name="lowVoltageAbsoluteThreshold"
                            onBlur={callBack}
                            onChange={(e) =>
                                handleValueChanged(e, isPositiveFloatNumber)
                            }
                        />
                    </Grid>
                    <Tooltip
                        title={
                            <div dangerouslySetInnerHTML={{ __html: info }} />
                        }
                        placement="left-start"
                    >
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
                        className={classes.multipleTextField1}
                    >
                        <TextField
                            fullWidth
                            sx={{ input: { textAlign: 'right' } }}
                            value={highVoltageAbsoluteThreshold}
                            label={'kv'}
                            name="highVoltageAbsoluteThreshold"
                            onBlur={callBack}
                            onChange={(e) =>
                                handleValueChanged(e, isPositiveFloatNumber)
                            }
                        />
                    </Grid>
                    <Tooltip
                        title={
                            <div dangerouslySetInnerHTML={{ __html: info }} />
                        }
                        placement="left-start"
                    >
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
                    callback={resetSAParametersAndProvider}
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
