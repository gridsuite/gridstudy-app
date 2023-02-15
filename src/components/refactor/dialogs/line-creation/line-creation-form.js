/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';

import {
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    PERMANENT_LIMIT,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    SHUNT_CONDUCTANCE_1,
    SHUNT_CONDUCTANCE_2,
    SHUNT_SUSCEPTANCE_1,
    SHUNT_SUSCEPTANCE_2,
} from 'components/refactor/utils/field-constants';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
    AmpereAdornment,
    filledTextField,
    gridItem,
    OhmAdornment,
    SusceptanceAdornment,
} from '../../../dialogs/dialogUtils';
import FloatInput from '../../rhf-inputs/float-input';
import TextInput from '../../rhf-inputs/text-input';
import { ConnectivityForm } from '../connectivity/connectivity-form';
const useStyles = makeStyles((theme) => ({
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
}));
const LineCreationForm = ({
    voltageLevelOptionsPromise,
    displayConnectivity,
}) => {
    const classes = useStyles();
    const lineIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const lineNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const connectivity1Field = (
        <ConnectivityForm
            id={CONNECTIVITY_1}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            withPosition={true}
            direction="column"
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id={CONNECTIVITY_2}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            withPosition={true}
            direction="column"
        />
    );

    const seriesResistanceField = (
        <FloatInput
            name={SERIES_RESISTANCE}
            label="SeriesResistanceText"
            adornment={OhmAdornment}
        />
    );

    const seriesReactanceField = (
        <FloatInput
            name={SERIES_REACTANCE}
            label="SeriesReactanceText"
            adornment={OhmAdornment}
        />
    );

    const shuntConductance1Field = (
        <FloatInput
            name={SHUNT_CONDUCTANCE_1}
            label="ShuntConductanceText"
            adornment={SusceptanceAdornment}
        />
    );

    const shuntSusceptance1Field = (
        <FloatInput
            name={SHUNT_SUSCEPTANCE_1}
            label="ShuntSusceptanceText"
            adornment={SusceptanceAdornment}
        />
    );

    const shuntConductance2Field = (
        <FloatInput
            name={SHUNT_CONDUCTANCE_2}
            label="ShuntConductanceText"
            adornment={SusceptanceAdornment}
        />
    );

    const shuntSusceptance2Field = (
        <FloatInput
            name={SHUNT_SUSCEPTANCE_2}
            label="ShuntSusceptanceText"
            adornment={SusceptanceAdornment}
        />
    );

    const permanentCurrentLimit1Field = (
        <FloatInput
            name={`${CURRENT_LIMITS_1}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText1"
            adornment={AmpereAdornment}
        />
    );

    const permanentCurrentLimit2Field = (
        <FloatInput
            name={`${CURRENT_LIMITS_2}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText2"
            adornment={AmpereAdornment}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(lineIdField)}
                {gridItem(lineNameField)}
            </Grid>
            {displayConnectivity && (
                <>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <h3 className={classes.h3}>
                                <FormattedMessage id="Connectivity" />
                            </h3>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <h4 className={classes.h4}>
                                <FormattedMessage id="Side1" />
                            </h4>
                        </Grid>
                        <Grid item xs={6}>
                            <h4 className={classes.h4}>
                                <FormattedMessage id="Side2" />
                            </h4>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item container xs={6} direction="column">
                            <Grid container direction="column" spacing={2}>
                                {gridItem(connectivity1Field, 12)}
                            </Grid>
                        </Grid>
                        <Grid item container direction="column" xs={6}>
                            <Grid container direction="column" spacing={2}>
                                {gridItem(connectivity2Field, 12)}
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            )}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3>
                        <FormattedMessage id="Characteristics" />
                    </h3>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(seriesResistanceField)}
                {gridItem(seriesReactanceField)}
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="Side1" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="Side2" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item container xs={6} spacing={2}>
                    {gridItem(shuntConductance1Field, 12)}
                    {gridItem(shuntSusceptance1Field, 12)}
                </Grid>
                <Grid item container xs={6} spacing={2}>
                    {gridItem(shuntConductance2Field, 12)}
                    {gridItem(shuntSusceptance2Field, 12)}
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3 className={classes.h3}>
                        <FormattedMessage id="Limits" />
                    </h3>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="Side1" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="Side2" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item container xs={6} direction="column">
                    {gridItem(permanentCurrentLimit1Field, 12)}
                </Grid>
                <Grid item container direction="column" xs={6}>
                    {gridItem(permanentCurrentLimit2Field, 12)}
                </Grid>
            </Grid>
        </>
    );
};

export default LineCreationForm;
