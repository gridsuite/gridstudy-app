/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Box } from '@mui/material';
import { AutocompleteInput, TextInput } from '@gridsuite/commons-ui';
import {
    ATTACHED_LINE_ID,
    LINE_TO_ATTACH_TO_1_ID,
    LINE_TO_ATTACH_TO_2_ID,
    REPLACING_LINE_1_ID,
    REPLACING_LINE_1_NAME,
    REPLACING_LINE_2_ID,
    REPLACING_LINE_2_NAME,
} from 'components/utils/field-constants';
import { useEffect, useState } from 'react';
import { ConnectivityForm } from '../../connectivity/connectivity-form';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';
import useVoltageLevelsListInfos from '../../../../hooks/use-voltage-levels-list-infos';
import GridSection from '../../commons/grid-section';
import GridItem from '../../commons/grid-item';

const LinesAttachToSplitLinesForm = ({ currentNode, studyUuid, currentRootNetworkUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const [linesIds, setLinesIds] = useState([]);

    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

    useEffect(() => {
        fetchEquipmentsIds(studyUuid, currentNodeUuid, currentRootNetworkUuid, undefined, 'LINE', true).then(
            (values) => {
                setLinesIds(values?.sort((a, b) => a.localeCompare(b)));
            }
        );
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    const lineToAttachTo1Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_1_ID}
            label="Line1"
            options={linesIds}
            size={'small'}
        />
    );

    const lineToAttachTo2Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_2_ID}
            label="Line2"
            options={linesIds}
            size={'small'}
        />
    );

    const attachedLineField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={ATTACHED_LINE_ID}
            label="LineAttached"
            options={linesIds}
            size={'small'}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            label={'AttachedVoltageLevelId'}
            voltageLevelOptions={voltageLevelOptions}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            withDirectionsInfos={false}
        />
    );

    const newLine1IdField = <TextInput name={REPLACING_LINE_1_ID} label={'Line1ID'} />;

    const newLine1NameField = <TextInput name={REPLACING_LINE_1_NAME} label={'Line1Name'} />;

    const newLine2IdField = <TextInput name={REPLACING_LINE_2_ID} label={'Line2ID'} />;

    const newLine2NameField = <TextInput name={REPLACING_LINE_2_NAME} label={'Line2Name'} />;

    return (
        <>
            <GridSection title="Line1" />
            <Grid container spacing={2} alignItems="center">
                <GridItem size={5}>{lineToAttachTo1Field}</GridItem>
            </Grid>
            <GridSection title="Line2" />
            <Grid container spacing={2} alignItems="center">
                <GridItem size={5}>{lineToAttachTo2Field}</GridItem>
            </Grid>
            <GridSection title="LineAttached" />
            <Grid container spacing={2} alignItems="center">
                <GridItem size={5}>{attachedLineField}</GridItem>
            </Grid>
            <GridSection title="VOLTAGE_LEVEL" />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>
            <GridSection title="ReplacingLines" />
            <Grid container spacing={2}>
                <GridItem>{newLine1IdField}</GridItem>
                <GridItem>{newLine1NameField}</GridItem>
                <Box sx={{ width: '100%' }} />
                <GridItem>{newLine2IdField}</GridItem>
                <GridItem>{newLine2NameField}</GridItem>
            </Grid>
        </>
    );
};

export default LinesAttachToSplitLinesForm;
