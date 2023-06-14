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
import { unitToMicroUnit } from '../../../../../utils/rounding';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginTop: 0,
    },
}));

const TwoWindingsTransformerCharacteristicsPane = ({
    id = CHARACTERISTICS,
    twtToModify,
    modification = false,
}) => {
    const classes = useStyles();
    const width = modification ? 12 : 8;

    const seriesResistanceField = (
        <FloatInput
            name={`${id}.${SERIES_RESISTANCE}`}
            label="SeriesResistanceText"
            adornment={OhmAdornment}
            previousValue={twtToModify?.r}
            clearable={modification}
        />
    );

    const seriesReactanceField = (
        <FloatInput
            name={`${id}.${SERIES_REACTANCE}`}
            label="SeriesReactanceText"
            adornment={OhmAdornment}
            previousValue={twtToModify?.x}
            clearable={modification}
        />
    );

    const magnetizingConductanceField = (
        <FloatInput
            name={`${id}.${MAGNETIZING_CONDUCTANCE}`}
            label="MagnetizingConductance"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(twtToModify?.g)}
            clearable={modification}
        />
    );

    const magnetizingSusceptanceField = (
        <FloatInput
            name={`${id}.${MAGNETIZING_SUSCEPTANCE}`}
            label="MagnetizingSusceptance"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(twtToModify?.b)}
            clearable={modification}
        />
    );

    const ratedSField = (
        <FloatInput
            name={`${id}.${RATED_S}`}
            label="RatedNominalPowerText"
            adornment={MVAPowerAdornment}
            previousValue={twtToModify?.ratedS}
            clearable={modification}
        />
    );

    const ratedVoltage1Field = (
        <FloatInput
            name={`${id}.${RATED_VOLTAGE_1}`}
            label="RatedVoltage"
            adornment={VoltageAdornment}
            previousValue={twtToModify?.ratedU1}
            clearable={modification}
        />
    );

    const ratedVoltage2Field = (
        <FloatInput
            name={`${id}.${RATED_VOLTAGE_2}`}
            label="RatedVoltage"
            adornment={VoltageAdornment}
            previousValue={twtToModify?.ratedU2}
            clearable={modification}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3 className={classes.h3}>
                        <FormattedMessage id="Characteristics" />
                    </h3>
                </Grid>
            </Grid>
            <Grid container item spacing={2} xs={width}>
                {gridItem(seriesResistanceField)}
                {gridItem(seriesReactanceField)}
                {gridItem(magnetizingConductanceField)}
                {gridItem(magnetizingSusceptanceField)}
                {gridItem(ratedSField)}
            </Grid>
            <Grid container item spacing={2} xs={width}>
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
            <Grid container item spacing={2} xs={width}>
                {gridItem(ratedVoltage1Field)}
                {gridItem(ratedVoltage2Field)}
            </Grid>
        </>
    );
};

export default TwoWindingsTransformerCharacteristicsPane;
