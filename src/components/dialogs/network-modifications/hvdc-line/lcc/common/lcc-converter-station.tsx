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
import { UUID } from 'crypto';
import { ConnectivityForm } from '../../../../connectivity/connectivity-form';
import { Grid } from '@mui/material';
import useVoltageLevelsListInfos from '../../../../../../hooks/use-voltage-levels-list-infos';
import GridSection from '../../../../commons/grid-section';
import GridItem from '../../../../commons/grid-item';

import FiltersShuntCompensatorTable from '../creation/filters-shunt-compensator-table';
import { CurrentTreeNode } from '../../../../../graph/tree-node.type';
import TextField from '@mui/material/TextField';
import { LccConverterStationFormInfos } from './lcc-type';
import { ModificationFiltersShuntCompensatorTable } from '../modification /filter-shunt-compensator-table-modification';

interface LccConverterStationProps {
    id: string;
    stationLabel: string;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
    hideConnectityForm?: boolean;
    previousValues?: LccConverterStationFormInfos;
    isModification?: boolean;
}

export default function LccConverterStation({
    id,
    stationLabel,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    hideConnectityForm,
    previousValues,
    isModification,
}: Readonly<LccConverterStationProps>) {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const stationIdField = previousValues ? (
        <TextField
            size="small"
            fullWidth
            name={`${id}.${CONVERTER_STATION_ID}`}
            label={'converterStationId'}
            value={previousValues?.id}
            disabled
        />
    ) : (
        <TextInput name={`${id}.${CONVERTER_STATION_ID}`} label={'converterStationId'} />
    );

    const stationNameField = (
        <TextInput
            name={`${id}.${CONVERTER_STATION_NAME}`}
            label={'converterStationName'}
            previousValue={previousValues?.name}
        />
    );
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
        <FloatInput
            name={`${id}.${LOSS_FACTOR}`}
            label={'lossFactorLabel'}
            adornment={percentageTextField}
            previousValue={previousValues?.lossFactor}
        />
    );

    const connectivitySection = (
        <>
            <GridSection title={'Connectivity'} />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>
        </>
    );

    const powerFactorField = (
        <FloatInput
            name={`${id}.${POWER_FACTOR}`}
            label={'powerFactorLabel'}
            previousValue={previousValues?.powerFactor}
        />
    );

    const ShuntCompensatorField = isModification ? (
        <ModificationFiltersShuntCompensatorTable
            id={`${id}`}
            previousValues={previousValues?.shuntCompensatorsOnSide}
        />
    ) : (
        <FiltersShuntCompensatorTable id={`${id}`} />
    );

    return (
        <Grid container spacing={2}>
            <GridSection title={stationLabel} />
            <Grid container spacing={2}>
                <GridItem size={4}>{stationIdField}</GridItem>
                <GridItem size={4}>{stationNameField}</GridItem>
            </Grid>
            {!hideConnectityForm && connectivitySection}
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem size={4}>{lossFactorField}</GridItem>
                <GridItem size={4}>{powerFactorField}</GridItem>
            </Grid>
            <GridSection title={'Filters'} />
            {ShuntCompensatorField}
        </Grid>
    );
}
