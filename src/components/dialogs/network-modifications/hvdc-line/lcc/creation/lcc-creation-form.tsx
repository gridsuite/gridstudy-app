/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../../redux/reducer';
import { Box } from '@mui/material';
import { CONVERTER_STATION_1, CONVERTER_STATION_2, HVDC_LINE_TAB } from '../../../../../utils/field-constants';
import LccHvdcLine from './lcc-hvdc-line';
import { LccCreationDialogTab } from './lcc-creation.type';
import LccConverterStation from './lcc-converter-station';

interface LccCreationFormProps {
    tabIndex: number;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}
export default function LccCreationForm({
    tabIndex,
    studyUuid,
    currentRootNetworkUuid,
    currentNode,
}: Readonly<LccCreationFormProps>) {
    return (
        <>
            <Box hidden={tabIndex !== LccCreationDialogTab.HVDC_LINE_TAB} p={1}>
                <LccHvdcLine id={HVDC_LINE_TAB} />
            </Box>
            <Box hidden={tabIndex !== LccCreationDialogTab.CONVERTER_STATION_1} p={1}>
                <LccConverterStation
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_1}
                    stationLabel={'converterStation1'}
                />
            </Box>
            <Box hidden={tabIndex !== LccCreationDialogTab.CONVERTER_STATION_2} p={1}>
                <LccConverterStation
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_2}
                    stationLabel={'converterStation2'}
                />
            </Box>
        </>
    );
}
