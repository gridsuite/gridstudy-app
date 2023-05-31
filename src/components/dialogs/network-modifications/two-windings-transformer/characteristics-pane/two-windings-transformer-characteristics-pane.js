/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';
import {
    gridItem,
    MicroSusceptanceAdornment,
    MVAPowerAdornment,
    OhmAdornment,
    VoltageAdornment,
} from '../../../dialogUtils';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import {
    CHARACTERISTICS,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
} from 'components/utils/field-constants';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginTop: 0,
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

const TwoWindingsTransformerCharacteristicsPane = ({
    id = CHARACTERISTICS,
    twtToModify,
    clearableFields = false,
}) => {
    const classes = useStyles();

    const seriesResistanceField = (
        <FloatInput
            name={`${id}.${SERIES_RESISTANCE}`}
            label="SeriesResistanceText"
            adornment={OhmAdornment}
            previousValue={twtToModify?.r}
            clearable={clearableFields}
        />
    );

    const seriesReactanceField = (
        <FloatInput
            name={`${id}.${SERIES_REACTANCE}`}
            label="SeriesReactanceText"
            adornment={OhmAdornment}
            previousValue={twtToModify?.x}
            clearable={clearableFields}
        />
    );

    const magnetizingConductanceField = (
        <FloatInput
            name={`${id}.${MAGNETIZING_CONDUCTANCE}`}
            label="MagnetizingConductance"
            adornment={MicroSusceptanceAdornment}
            previousValue={twtToModify?.g}
            clearable={clearableFields}
        />
    );

    const magnetizingSusceptanceField = (
        <FloatInput
            name={`${id}.${MAGNETIZING_SUSCEPTANCE}`}
            label="MagnetizingSusceptance"
            adornment={MicroSusceptanceAdornment}
            previousValue={twtToModify?.b}
            clearable={clearableFields}
        />
    );

    const ratedSField = (
        <FloatInput
            name={`${id}.${RATED_S}`}
            label="RatedNominalPowerText"
            adornment={MVAPowerAdornment}
            previousValue={twtToModify?.ratedS}
            clearable={clearableFields}
        />
    );

    const ratedVoltage1Field = (
        <FloatInput
            name={`${id}.${RATED_VOLTAGE_1}`}
            label="RatedVoltage"
            adornment={VoltageAdornment}
            previousValue={twtToModify?.ratedU1}
            clearable={clearableFields}
        />
    );

    const ratedVoltage2Field = (
        <FloatInput
            name={`${id}.${RATED_VOLTAGE_2}`}
            label="RatedVoltage"
            adornment={VoltageAdornment}
            previousValue={twtToModify?.ratedU2}
            clearable={clearableFields}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3>
                        <FormattedMessage id="Characteristics" />
                    </h3>
                </Grid>
            </Grid>
            <Grid container item spacing={2} xs={8}>
                {gridItem(seriesResistanceField)}
                {gridItem(seriesReactanceField)}
                {gridItem(magnetizingConductanceField)}
                {gridItem(magnetizingSusceptanceField)}
                {gridItem(ratedSField)}
            </Grid>
            <Grid container item spacing={2} xs={8}>
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
            <Grid container item spacing={2} xs={8}>
                {gridItem(ratedVoltage1Field)}
                {gridItem(ratedVoltage2Field)}
            </Grid>
        </>
    );
};

export default TwoWindingsTransformerCharacteristicsPane;
