/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    gridItem,
    GridSection,
    MicroSusceptanceAdornment,
    OhmAdornment,
} from '../../../../dialogs/dialogUtils';
import FloatInput from '../../../rhf-inputs/float-input';
import { ConnectivityForm } from '../../connectivity/connectivity-form';
import {
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    SHUNT_CONDUCTANCE_1,
    SHUNT_CONDUCTANCE_2,
    SHUNT_SUSCEPTANCE_1,
    SHUNT_SUSCEPTANCE_2,
} from 'components/refactor/utils/field-constants';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const LineCharacteristicsPane = ({
    id = CHARACTERISTICS,
    studyUuid,
    currentNode,
    voltageLevelOptions,
}) => {
    const seriesResistanceField = (
        <FloatInput
            name={`${id}.${SERIES_RESISTANCE}`}
            label="SeriesResistanceText"
            adornment={OhmAdornment}
        />
    );

    const seriesReactanceField = (
        <FloatInput
            name={`${id}.${SERIES_REACTANCE}`}
            label="SeriesReactanceText"
            adornment={OhmAdornment}
        />
    );

    const shuntConductance1Field = (
        <FloatInput
            name={`${id}.${SHUNT_CONDUCTANCE_1}`}
            label="ShuntConductanceText"
            adornment={MicroSusceptanceAdornment}
        />
    );

    const shuntSusceptance1Field = (
        <FloatInput
            name={`${id}.${SHUNT_SUSCEPTANCE_1}`}
            label="ShuntSusceptanceText"
            adornment={MicroSusceptanceAdornment}
        />
    );

    const shuntConductance2Field = (
        <FloatInput
            name={`${id}.${SHUNT_CONDUCTANCE_2}`}
            label="ShuntConductanceText"
            adornment={MicroSusceptanceAdornment}
        />
    );

    const shuntSusceptance2Field = (
        <FloatInput
            name={`${id}.${SHUNT_SUSCEPTANCE_2}`}
            label="ShuntSusceptanceText"
            adornment={MicroSusceptanceAdornment}
        />
    );

    const connectivity1Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_1}`}
            studyUuid={studyUuid}
            currentNode={currentNode}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_2}`}
            studyUuid={studyUuid}
            currentNode={currentNode}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
        />
    );

    return (
        <>
            <Grid container spacing={0}>
                {/* prettier (less empty spaces) than having GridSection x 2 */}
                <Grid item xs={12}>
                    <h3>
                        <FormattedMessage id={'Connectivity'} />
                    </h3>
                    <h4>
                        <FormattedMessage id={'Side1'} />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(connectivity1Field, 12)}
            </Grid>
            <GridSection title="Side2" heading="4" />
            <Grid container spacing={2}>
                {gridItem(connectivity2Field, 12)}
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {gridItem(seriesResistanceField, 4)}
                {gridItem(seriesReactanceField, 4)}
            </Grid>
            <GridSection title="Side1" heading="4" />
            <Grid container spacing={2}>
                {gridItem(shuntConductance1Field, 4)}
                {gridItem(shuntSusceptance1Field, 4)}
            </Grid>
            <GridSection title="Side2" heading="4" />
            <Grid container spacing={2}>
                {gridItem(shuntConductance2Field, 4)}
                {gridItem(shuntSusceptance2Field, 4)}
            </Grid>
        </>
    );
};

export default LineCharacteristicsPane;
