/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, TextInput } from '@gridsuite/commons-ui';
import {
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    LOSS_FACTOR,
    POWER_FACTOR,
} from '../../../../../utils/field-constants';
import { percentageTextField } from '../../../../dialog-utils';
import { CurrentTreeNode } from '../../../../../../redux/reducer';
import { UUID } from 'crypto';
import { ConnectivityForm } from '../../../../connectivity/connectivity-form';
import { Grid } from '@mui/material';
import useVoltageLevelsListInfos from '../../../../../../hooks/use-voltage-levels-list-infos';
import GridSection from '../../../../commons/grid-section';
import GridItem from '../../../../commons/grid-item';

import FiltersShuntCompensatorTable from './filters-shunt-compensator-table';

interface LccConverterStationProps {
    id: string;
    stationLabel: string;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
}

export default function LccConverterStation({
    id,
    stationLabel,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
}: Readonly<LccConverterStationProps>) {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const stationIdField = <TextInput name={`${id}.${CONVERTER_STATION_ID}`} label={'converterStationId'} />;

    const stationNameField = <TextInput name={`${id}.${CONVERTER_STATION_NAME}`} label={'converterStationName'} />;

    const connectivityForm = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY}`}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            previousValues={undefined}
        />
    );

    const lossFactorField = (
        <FloatInput name={`${id}.${LOSS_FACTOR}`} label={'lossFactorLabel'} adornment={percentageTextField} />
    );

    const powerFactorField = <FloatInput name={`${id}.${POWER_FACTOR}`} label={'powerFactorLabel'} />;

    return (
        <Grid container spacing={2}>
            <GridSection title={stationLabel} />
            <Grid container spacing={2}>
                <GridItem size={4}>{stationIdField}</GridItem>
                <GridItem size={4}>{stationNameField}</GridItem>
            </Grid>

            <GridSection title={'Connectivity'} />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>

            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem size={4}>{lossFactorField}</GridItem>
                <GridItem size={4}>{powerFactorField}</GridItem>
            </Grid>

            <GridSection title={'Filters'} />
            <FiltersShuntCompensatorTable id={`${id}`} />
        </Grid>
    );
}
