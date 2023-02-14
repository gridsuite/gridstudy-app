/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';
import {
    AmpereAdornment,
    filledTextField,
    gridItem,
    MicroSusceptanceAdornment,
    MVAPowerAdornment,
    OhmAdornment,
    VoltageAdornment,
} from '../../../../dialogs/dialogUtils';
import FloatInput from '../../../rhf-inputs/float-input';
import TextInput from '../../../rhf-inputs/text-input';
import { ConnectivityForm } from '../../connectivity/connectivity-form';
import {
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    G,
    B,
    PERMANENT_LIMIT,
    RATED_S,
    RATED_U1,
    RATED_U2,
    X,
    R,
} from 'components/refactor/utils/field-constants';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

const TwoWindingsTransformerPane = ({
    id = CHARACTERISTICS,
    voltageLevelOptionsPromise,
}) => {
    const classes = useStyles();

    // CHARACTERISTICS TAP PANE
    const twoWindingsTransformerIdField = (
        <TextInput
            name={`${id}.${EQUIPMENT_ID}`}
            label="ID"
            formProps={filledTextField}
        />
    );

    const twoWindingsTransformerNameField = (
        <TextInput
            name={`${id}.${EQUIPMENT_NAME}`}
            label="Name"
            formProps={filledTextField}
        />
    );

    const rField = (
        <FloatInput
            name={`${id}.${R}`}
            label="rText"
            adornment={OhmAdornment}
        />
    );

    const xField = (
        <FloatInput
            name={`${id}.${X}`}
            label="xText"
            adornment={OhmAdornment}
        />
    );

    const gField = (
        <FloatInput
            name={`${id}.${G}`}
            label="G"
            adornment={MicroSusceptanceAdornment}
        />
    );

    const bField = (
        <FloatInput
            name={`${id}.${B}`}
            label="B"
            adornment={MicroSusceptanceAdornment}
        />
    );

    const ratedSField = (
        <FloatInput
            name={`${id}.${RATED_S}`}
            label="RatedNominalPowerText"
            adornment={MVAPowerAdornment}
        />
    );

    const ratedU1Field = (
        <FloatInput
            name={`${id}.${RATED_U1}`}
            label="RatedU"
            adornment={VoltageAdornment}
        />
    );

    const ratedU2Field = (
        <FloatInput
            name={`${id}.${RATED_U2}`}
            label="RatedU"
            adornment={VoltageAdornment}
        />
    );

    const permanentCurrentLimit1Field = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITS_1}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText1"
            adornment={AmpereAdornment}
        />
    );

    const permanentCurrentLimit2Field = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITS_2}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText2"
            adornment={AmpereAdornment}
        />
    );

    const connectivity1Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_1}`}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            withPosition={true}
            direction="column"
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_2}`}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            withPosition={true}
            direction="column"
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(twoWindingsTransformerIdField)}
                {gridItem(twoWindingsTransformerNameField)}
            </Grid>
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
                        <FormattedMessage id="OriginSide" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="ExtremitySide" />
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
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3>
                        <FormattedMessage id="Characteristics" />
                    </h3>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(rField)}
                {gridItem(xField)}
                {gridItem(gField)}
                {gridItem(bField)}
                {gridItem(ratedSField)}
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="OriginSide" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="ExtremitySide" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(ratedU1Field)}
                {gridItem(ratedU2Field)}
            </Grid>
            {/* <br /> */}
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
                        <FormattedMessage id="OriginSide" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="ExtremitySide" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(permanentCurrentLimit1Field)}
                {gridItem(permanentCurrentLimit2Field)}
            </Grid>
        </>
    );
};

export default TwoWindingsTransformerPane;
