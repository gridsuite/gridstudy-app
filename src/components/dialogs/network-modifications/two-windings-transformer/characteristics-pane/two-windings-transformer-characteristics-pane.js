/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    gridItem,
    GridSection,
    MicroSusceptanceAdornment,
    MVAPowerAdornment,
    OhmAdornment,
    VoltageAdornment,
} from '../../../dialogUtils';
import { FloatInput } from '@gridsuite/commons-ui';
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

const TwoWindingsTransformerCharacteristicsPane = ({
    id = CHARACTERISTICS,
    twtToModify,
    isModification = false,
}) => {
    const width = isModification ? 12 : 8;

    const seriesResistanceField = (
        <FloatInput
            name={`${id}.${SERIES_RESISTANCE}`}
            label="SeriesResistanceText"
            adornment={OhmAdornment}
            previousValue={twtToModify?.r}
            clearable={isModification}
        />
    );

    const seriesReactanceField = (
        <FloatInput
            name={`${id}.${SERIES_REACTANCE}`}
            label="SeriesResistanceText"
            adornment={OhmAdornment}
            previousValue={twtToModify?.x}
            clearable={isModification}
        />
    );

    const magnetizingConductanceField = (
        <FloatInput
            name={`${id}.${MAGNETIZING_CONDUCTANCE}`}
            label="MagnetizingConductance"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(twtToModify?.g)}
            clearable={isModification}
        />
    );

    const magnetizingSusceptanceField = (
        <FloatInput
            name={`${id}.${MAGNETIZING_SUSCEPTANCE}`}
            label="MagnetizingSusceptance"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(twtToModify?.b)}
            clearable={isModification}
        />
    );

    const ratedSField = (
        <FloatInput
            name={`${id}.${RATED_S}`}
            label="RatedNominalPowerText"
            adornment={MVAPowerAdornment}
            previousValue={twtToModify?.ratedS}
            clearable={isModification}
        />
    );

    const ratedVoltage1Field = (
        <FloatInput
            name={`${id}.${RATED_VOLTAGE_1}`}
            label="RatedVoltage"
            adornment={VoltageAdornment}
            previousValue={twtToModify?.ratedU1}
            clearable={isModification}
        />
    );

    const ratedVoltage2Field = (
        <FloatInput
            name={`${id}.${RATED_VOLTAGE_2}`}
            label="RatedVoltage"
            adornment={VoltageAdornment}
            previousValue={twtToModify?.ratedU2}
            clearable={isModification}
        />
    );

    return (
        <>
            <GridSection title={'Characteristics'} />
            <Grid container item spacing={2} xs={width}>
                {gridItem(seriesResistanceField)}
                {gridItem(seriesReactanceField)}
                {gridItem(magnetizingConductanceField)}
                {gridItem(magnetizingSusceptanceField)}
                {gridItem(ratedSField)}
            </Grid>
            <Grid container item spacing={2} xs={width}>
                <Grid item xs={6}>
                    <h4>
                        <FormattedMessage id="Side1" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4>
                        <FormattedMessage id="Side2" />
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
