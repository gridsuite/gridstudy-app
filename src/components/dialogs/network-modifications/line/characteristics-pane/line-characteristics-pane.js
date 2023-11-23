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
} from '../../../dialogUtils';
import { FloatInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
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
} from 'components/utils/field-constants';
import React, { useEffect, useState } from 'react';
import { unitToMicroUnit } from 'utils/rounding';
import { fetchVoltageLevelsListInfos } from '../../../../../services/study/network';

const styles = {
    h3: {
        marginTop: 0,
        marginBottom: 0,
    },
};

const LineCharacteristicsPane = ({
    id = CHARACTERISTICS,
    studyUuid,
    currentNode,
    displayConnectivity,
    lineToModify,
    clearableFields = false,
}) => {
    const currentNodeUuid = currentNode.id;
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNodeUuid]);

    const seriesResistanceField = (
        <FloatInput
            name={`${id}.${SERIES_RESISTANCE}`}
            label="SeriesResistanceText"
            adornment={OhmAdornment}
            previousValue={lineToModify?.r}
            clearable={clearableFields}
        />
    );

    const seriesReactanceField = (
        <FloatInput
            name={`${id}.${SERIES_REACTANCE}`}
            label="SeriesReactanceText"
            adornment={OhmAdornment}
            previousValue={lineToModify?.x}
            clearable={clearableFields}
        />
    );

    const shuntConductance1Field = (
        <FloatInput
            name={`${id}.${SHUNT_CONDUCTANCE_1}`}
            label="ShuntConductanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(lineToModify?.g1)}
            clearable={clearableFields}
        />
    );

    const shuntSusceptance1Field = (
        <FloatInput
            name={`${id}.${SHUNT_SUSCEPTANCE_1}`}
            label="ShuntSusceptanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(lineToModify?.b1)}
            clearable={clearableFields}
        />
    );

    const shuntConductance2Field = (
        <FloatInput
            name={`${id}.${SHUNT_CONDUCTANCE_2}`}
            label="ShuntConductanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(lineToModify?.g2)}
            clearable={clearableFields}
        />
    );

    const shuntSusceptance2Field = (
        <FloatInput
            name={`${id}.${SHUNT_SUSCEPTANCE_2}`}
            label="ShuntSusceptanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(lineToModify?.b2)}
            clearable={clearableFields}
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
            {displayConnectivity && (
                <>
                    <GridSection title="Connectivity" customStyle={styles.h3} />
                    <GridSection title="Side1" heading="4" />
                    <Grid container spacing={2}>
                        {gridItem(connectivity1Field, 12)}
                    </Grid>
                    <GridSection title="Side2" heading="4" />
                    <Grid container spacing={2}>
                        {gridItem(connectivity2Field, 12)}
                    </Grid>
                </>
            )}
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
