/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { GridItem, GridSection, MicroSusceptanceAdornment, OhmAdornment } from '../../../dialog-utils';
import { FloatInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import {
    B1,
    B2,
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    G1,
    G2,
    R,
    X,
} from 'components/utils/field-constants';
import React from 'react';
import { unitToMicroUnit } from 'utils/unit-converter';
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';

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
    isModification = false,
}) => {
    const currentNodeUuid = currentNode.id;
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid);

    const seriesResistanceField = (
        <FloatInput
            name={`${id}.${R}`}
            label="SeriesResistanceText"
            adornment={OhmAdornment}
            previousValue={lineToModify?.r}
            clearable={clearableFields}
        />
    );

    const seriesReactanceField = (
        <FloatInput
            name={`${id}.${X}`}
            label="SeriesReactanceText"
            adornment={OhmAdornment}
            previousValue={lineToModify?.x}
            clearable={clearableFields}
        />
    );

    const shuntConductance1Field = (
        <FloatInput
            name={`${id}.${G1}`}
            label="ShuntConductanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(lineToModify?.g1)}
            clearable={clearableFields}
        />
    );

    const shuntSusceptance1Field = (
        <FloatInput
            name={`${id}.${B1}`}
            label="ShuntSusceptanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(lineToModify?.b1)}
            clearable={clearableFields}
        />
    );

    const shuntConductance2Field = (
        <FloatInput
            name={`${id}.${G2}`}
            label="ShuntConductanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={unitToMicroUnit(lineToModify?.g2)}
            clearable={clearableFields}
        />
    );

    const shuntSusceptance2Field = (
        <FloatInput
            name={`${id}.${B2}`}
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
                        {GridItem(connectivity1Field, 12)}
                    </Grid>
                    <GridSection title="Side2" heading="4" />
                    <Grid container spacing={2}>
                        {GridItem(connectivity2Field, 12)}
                    </Grid>
                </>
            )}
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {GridItem(seriesResistanceField, 4)}
                {GridItem(seriesReactanceField, 4)}
            </Grid>
            <GridSection title="Side1" heading="4" />
            <Grid container spacing={2}>
                {GridItem(shuntConductance1Field, 4)}
                {GridItem(shuntSusceptance1Field, 4)}
            </Grid>
            <GridSection title="Side2" heading="4" />
            <Grid container spacing={2}>
                {GridItem(shuntConductance2Field, 4)}
                {GridItem(shuntSusceptance2Field, 4)}
            </Grid>
            <PropertiesForm networkElementType={'line'} isModification={isModification} />
        </>
    );
};

export default LineCharacteristicsPane;
