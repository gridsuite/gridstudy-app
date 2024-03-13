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
} from '../../../../utils/field-constants';
import React, { FunctionComponent } from 'react';
import VscHvdcLinePane from '../hvdc-line-pane/vsc-hvdc-line-pane';
import ConverterStationPane from '../converter-station/converter-station-pane';
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../redux/reducer.type';
import { VscModificationInfo } from 'services/network-modification-types';
import { TextInput } from '@gridsuite/commons-ui';
import { Box, TextField } from '@mui/material';
import { gridItem } from 'components/dialogs/dialogUtils';
import Grid from '@mui/material/Grid';
import { VSC_CREATION_TABS } from '../creation/vsc-creation-dialog';
import VscTabs from '../vsc-tabs';
import { UpdateReactiveCapabilityCurveTableConverterStation } from '../converter-station/converter-station-utils';

interface VscModificationFormProps {
    tabIndex: number;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    equipmentId: string;
    vscToModify: VscModificationInfo | null;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    tabIndexesWithError: number[];
    updatePreviousReactiveCapabilityCurveTableConverterStation: UpdateReactiveCapabilityCurveTableConverterStation;
}

export const VscModificationForm: FunctionComponent<
    VscModificationFormProps
> = ({
    tabIndex,
    setTabIndex,
    studyUuid,
    currentNode,
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
                {gridItem(vscIdField, 4)}
                {gridItem(vscNameField, 4)}
            </Grid>
            <VscTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
            />
        </Box>
    );

    return (
        <>
            <Box>{headersAndTabs}</Box>
            <Box hidden={tabIndex !== VSC_CREATION_TABS.HVDC_LINE_TAB} p={1}>
                <VscHvdcLinePane
                    id={HVDC_LINE_TAB}
                    previousValues={vscToModify}
                    isEquipementModification={true}
                />
            </Box>
            <Box
                hidden={tabIndex !== VSC_CREATION_TABS.CONVERTER_STATION_1}
                p={1}
            >
                <ConverterStationPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    id={CONVERTER_STATION_1}
                    stationLabel={'converterStation1'}
                    isModification
                    previousValues={vscToModify?.converterStation1}
                    updatePreviousReactiveCapabilityCurveTableConverterStation={(
                        action,
                        index,
                    ) => {
                        updatePreviousReactiveCapabilityCurveTableConverterStation(
                            action,
                            index,
                            'converterStation1',
                        );
                    }}
                />
            </Box>
            <Box
                hidden={tabIndex !== VSC_CREATION_TABS.CONVERTER_STATION_2}
                p={1}
            >
                <ConverterStationPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    id={CONVERTER_STATION_2}
                    stationLabel={'converterStation2'}
                    isModification
                    previousValues={vscToModify?.converterStation2}
                    updatePreviousReactiveCapabilityCurveTableConverterStation={(
                        action,
                        index,
                    ) => {
                        updatePreviousReactiveCapabilityCurveTableConverterStation(
                            action,
                            index,
                            'converterStation2',
                        );
                    }}
                />
            </Box>
        </>
    );
};
