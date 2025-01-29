/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { MicroSusceptanceAdornment, OhmAdornment } from '../../../dialog-utils';
import { convertInputValue, FieldType, FloatInput } from '@gridsuite/commons-ui';
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
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import GridSection from '../../../commons/grid-section';
import GridItem from '../../../commons/grid-item';

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
    currentRootNetworkUuid,
    displayConnectivity,
    lineToModify,
    clearableFields = false,
    isModification = false,
}) => {
    const currentNodeUuid = currentNode.id;
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

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
            previousValue={convertInputValue(FieldType.G1, lineToModify?.g1)}
            clearable={clearableFields}
        />
    );

    const shuntSusceptance1Field = (
        <FloatInput
            name={`${id}.${B1}`}
            label="ShuntSusceptanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={convertInputValue(FieldType.B1, lineToModify?.b1)}
            clearable={clearableFields}
        />
    );

    const shuntConductance2Field = (
        <FloatInput
            name={`${id}.${G2}`}
            label="ShuntConductanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={convertInputValue(FieldType.G2, lineToModify?.g2)}
            clearable={clearableFields}
        />
    );

    const shuntSusceptance2Field = (
        <FloatInput
            name={`${id}.${B2}`}
            label="ShuntSusceptanceText"
            adornment={MicroSusceptanceAdornment}
            previousValue={convertInputValue(FieldType.B2, lineToModify?.b2)}
            clearable={clearableFields}
        />
    );

    const connectivity1Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_1}`}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_2}`}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
        />
    );

    return (
        <>
            {displayConnectivity && (
                <>
                    <GridSection title="Connectivity" customStyle={styles.h3} />
                    <GridSection title="Side1" heading={4} />
                    <Grid container spacing={2}>
                        <GridItem size={12}>{connectivity1Field}</GridItem>
                    </Grid>
                    <GridSection title="Side2" heading={4} />
                    <Grid container spacing={2}>
                        <GridItem size={12}>{connectivity2Field}</GridItem>
                    </Grid>
                </>
            )}
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem size={4}>{seriesResistanceField}</GridItem>
                <GridItem size={4}>{seriesReactanceField}</GridItem>
            </Grid>
            <GridSection title="Side1" heading={4} />
            <Grid container spacing={2}>
                <GridItem size={4}>{shuntConductance1Field}</GridItem>
                <GridItem size={4}>{shuntSusceptance1Field}</GridItem>
            </Grid>
            <GridSection title="Side2" heading={4} />
            <Grid container spacing={2}>
                <GridItem size={4}>{shuntConductance2Field}</GridItem>
                <GridItem size={4}>{shuntSusceptance2Field}</GridItem>
            </Grid>
            <PropertiesForm networkElementType={'line'} isModification={isModification} />
        </>
    );
};

export default LineCharacteristicsPane;
