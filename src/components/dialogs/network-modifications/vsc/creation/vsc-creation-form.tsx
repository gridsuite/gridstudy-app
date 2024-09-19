/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CONVERTER_STATION_1, CONVERTER_STATION_2, HVDC_LINE_TAB } from '../../../../utils/field-constants';
import React, { FunctionComponent } from 'react';
import { Box } from '@mui/system';
import VscHvdcLinePane from '../hvdc-line-pane/vsc-hvdc-line-pane';
import ConverterStationPane from '../converter-station/converter-station-pane';
import { VSC_CREATION_TABS } from './vsc-creation-dialog';
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../redux/reducer';

interface VscCreationFormProps {
    tabIndex: number;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
}
const VscCreationForm: FunctionComponent<VscCreationFormProps> = ({ tabIndex, studyUuid, currentNode }) => {
    return (
        <>
            <Box hidden={tabIndex !== VSC_CREATION_TABS.HVDC_LINE_TAB} p={1}>
                <VscHvdcLinePane id={HVDC_LINE_TAB} />
            </Box>
            <Box hidden={tabIndex !== VSC_CREATION_TABS.CONVERTER_STATION_1} p={1}>
                <ConverterStationPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    id={CONVERTER_STATION_1}
                    stationLabel={'converterStation1'}
                />
            </Box>
            <Box hidden={tabIndex !== VSC_CREATION_TABS.CONVERTER_STATION_2} p={1}>
                <ConverterStationPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    id={CONVERTER_STATION_2}
                    stationLabel={'converterStation2'}
                />
            </Box>
        </>
    );
};

export default VscCreationForm;
