/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../../graph/tree-node.type';
import {
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
} from '../../../../../utils/field-constants';
import { LccDialogTab, LccFormInfos } from '../common/lcc-type';
import { Box, Grid, TextField } from '@mui/material';
import LccHvdcLine from '../common/lcc-hvdc-line';
import LccConverterStation from '../common/lcc-converter-station';
import LccTabs from '../common/lcc-tabs';
import { filledTextField, TextInput } from '@gridsuite/commons-ui';
import GridItem from '../../../../commons/grid-item';

interface LccModificationFormProps {
    tabIndex: number;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    setTabIndex: (tabIndex: number) => void;
    tabIndexesWithError: number[];
    lccToModify: LccFormInfos | null;
}

interface LccModificationHeaderProps {
    lccToModify: LccFormInfos | null;
}

function LccModificationDialogHeader({ lccToModify }: Readonly<LccModificationHeaderProps>) {
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
            previousValue={lccToModify?.name ?? undefined}
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

    return (
        <>
            <Box>{headerAndTabs}</Box>
            <Box hidden={tabIndex !== LccDialogTab.HVDC_LINE_TAB} p={1}>
                <LccHvdcLine id={HVDC_LINE_TAB} previousValues={lccToModify} isModification />
            </Box>
            <Box hidden={tabIndex !== LccDialogTab.CONVERTER_STATION_1} p={1}>
                <LccConverterStation
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_1}
                    stationLabel={'converterStation1'}
                    previousValues={lccToModify?.lccConverterStation1}
                    isModification
                />
            </Box>
            <Box hidden={tabIndex !== LccDialogTab.CONVERTER_STATION_2} p={1}>
                <LccConverterStation
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_2}
                    stationLabel={'converterStation2'}
                    previousValues={lccToModify?.lccConverterStation2}
                    isModification
                />
            </Box>
        </>
    );
}
