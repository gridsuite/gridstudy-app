/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../graph/tree-node.type';
import {
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
} from '../../../../../utils/field-constants';
import { LccDialogTab } from '../lcc-type';
import { Box, Grid, TextField } from '@mui/material';
import LccHvdcLine from '../creation/lcc-hvdc-line';
import LccConverterStation from '../lcc-converter-station';
import LccTabs from '../lcc-tabs';
import { TextInput } from '@gridsuite/commons-ui';
import { filledTextField } from '../../../../dialog-utils';
import GridItem from '../../../../commons/grid-item';
import { LccModificationInfo } from '../../../../../../services/network-modification-types';

interface LccModificationFormProps {
    tabIndex: number;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    setTabIndex: (tabIndex: number) => void;
    tabIndexesWithError: number[];
    lccToModify: LccModificationInfo | null;
}

interface LccModificationHeaderProps {
    lccToModify: LccModificationInfo | null;
}

function LccModificationDialogHeader({ lccToModify }: LccModificationHeaderProps) {
    const LccIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={lccToModify?.id ?? ''}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );
    const LccNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={lccToModify?.name ?? ''}
            clearable={true}
        />
    );
    return (
        <Grid container item spacing={2}>
            <GridItem size={4}>{LccIdField}</GridItem>
            <GridItem size={4}>{LccNameField}</GridItem>
        </Grid>
    );
}

export function LccModificationForm({
    tabIndex,
    studyUuid,
    currentRootNetworkUuid,
    currentNode,
    setTabIndex,
    tabIndexesWithError,
    lccToModify,
}: Readonly<LccModificationFormProps>) {
    const headerAndTabs = (
        <Grid container spacing={2}>
            <LccModificationDialogHeader lccToModify={lccToModify} />
            <LccTabs tabIndex={tabIndex} tabIndexesWithError={tabIndexesWithError} setTabIndex={setTabIndex} />
        </Grid>
    );

    console.log('lccToModify : ', lccToModify);
    console.log('lccToModify.converterStation1 : ', lccToModify?.lccConverterStation1);
    console.log('lccToModify.converterStation2 : ', lccToModify?.lccConverterStation2);

    return (
        <>
            <Box>{headerAndTabs}</Box>
            <Box hidden={tabIndex !== LccDialogTab.HVDC_LINE_TAB} p={1}>
                <LccHvdcLine id={HVDC_LINE_TAB} previousValues={lccToModify} />
            </Box>
            <Box hidden={tabIndex !== LccDialogTab.CONVERTER_STATION_1} p={1}>
                <LccConverterStation
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_1}
                    stationLabel={'converterStation1'}
                    hideConnectityForm
                    previousValues={lccToModify?.lccConverterStation1}
                />
            </Box>
            <Box hidden={tabIndex !== LccDialogTab.CONVERTER_STATION_2} p={1}>
                <LccConverterStation
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_2}
                    stationLabel={'converterStation2'}
                    hideConnectityForm
                    previousValues={lccToModify?.lccConverterStation2}
                />
            </Box>
        </>
    );
}
