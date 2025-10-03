/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { UUID } from 'node:crypto';
import { Box } from '@mui/material';
import { CONVERTER_STATION_1, CONVERTER_STATION_2, HVDC_LINE_TAB } from '../../../../../utils/field-constants';
import LccHvdcLine from '../common/lcc-hvdc-line';
import { LccDialogTab } from '../common/lcc-type';
import LccConverterStation from '../common/lcc-converter-station';
import { CurrentTreeNode } from '../../../../../graph/tree-node.type';

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
            <Box hidden={tabIndex !== LccDialogTab.HVDC_LINE_TAB} p={1}>
                <LccHvdcLine id={HVDC_LINE_TAB} />
            </Box>
            <Box hidden={tabIndex !== LccDialogTab.CONVERTER_STATION_1} p={1}>
                <LccConverterStation
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_1}
                    stationLabel={'converterStation1'}
                />
            </Box>
            <Box hidden={tabIndex !== LccDialogTab.CONVERTER_STATION_2} p={1}>
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
