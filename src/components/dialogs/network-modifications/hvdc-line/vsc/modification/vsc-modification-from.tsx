/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
} from '../../../../../utils/field-constants';
import { FunctionComponent } from 'react';
import VscHvdcLinePane from '../hvdc-line-pane/vsc-hvdc-line-pane';
import ConverterStationPane from '../converter-station/converter-station-pane';
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../../redux/reducer';
import { VscModificationInfo } from 'services/network-modification-types';
import { TextInput } from '@gridsuite/commons-ui';
import { Box, Grid, TextField } from '@mui/material';
import VscTabs from '../vsc-tabs';
import { UpdateReactiveCapabilityCurveTableConverterStation } from '../converter-station/converter-station-utils';
import GridItem from '../../../../commons/grid-item';
import { VSC_CREATION_TABS } from '../vsc-utils';

interface VscModificationFormProps {
    tabIndex: number;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    equipmentId: string;
    vscToModify: VscModificationInfo | null;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    tabIndexesWithError: number[];
    updatePreviousReactiveCapabilityCurveTableConverterStation: UpdateReactiveCapabilityCurveTableConverterStation;
}

export const VscModificationForm: FunctionComponent<VscModificationFormProps> = ({
    tabIndex,
    setTabIndex,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    equipmentId,
    vscToModify,
    tabIndexesWithError,
    updatePreviousReactiveCapabilityCurveTableConverterStation,
}) => {
    const vscIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId || ''}
            InputProps={{
                readOnly: true,
            }}
            disabled
            variant="filled"
        />
    );

    const vscNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={{ variant: 'filled' }}
            previousValue={vscToModify?.name || ''}
            clearable
        />
    );

    const headersAndTabs = (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
            }}
        >
            <Grid container spacing={2}>
                <GridItem size={4}>{vscIdField}</GridItem>
                <GridItem size={4}>{vscNameField}</GridItem>
            </Grid>
            <VscTabs tabIndex={tabIndex} tabIndexesWithError={tabIndexesWithError} setTabIndex={setTabIndex} />
        </Box>
    );

    return (
        <>
            <Box>{headersAndTabs}</Box>
            <Box hidden={tabIndex !== VSC_CREATION_TABS.HVDC_LINE_TAB} p={1}>
                <VscHvdcLinePane id={HVDC_LINE_TAB} previousValues={vscToModify} isEquipementModification={true} />
            </Box>
            <Box hidden={tabIndex !== VSC_CREATION_TABS.CONVERTER_STATION_1} p={1}>
                <ConverterStationPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_1}
                    stationLabel={'converterStation1'}
                    isModification
                    previousValues={vscToModify?.converterStation1}
                    updatePreviousReactiveCapabilityCurveTableConverterStation={(action, index) => {
                        updatePreviousReactiveCapabilityCurveTableConverterStation(action, index, 'converterStation1');
                    }}
                />
            </Box>
            <Box hidden={tabIndex !== VSC_CREATION_TABS.CONVERTER_STATION_2} p={1}>
                <ConverterStationPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_2}
                    stationLabel={'converterStation2'}
                    isModification
                    previousValues={vscToModify?.converterStation2}
                    updatePreviousReactiveCapabilityCurveTableConverterStation={(action, index) => {
                        updatePreviousReactiveCapabilityCurveTableConverterStation(action, index, 'converterStation2');
                    }}
                />
            </Box>
        </>
    );
};
