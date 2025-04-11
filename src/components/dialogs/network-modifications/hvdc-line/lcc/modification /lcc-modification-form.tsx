import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../graph/tree-node.type';
import { CONVERTER_STATION_1, CONVERTER_STATION_2, HVDC_LINE_TAB } from '../../../../../utils/field-constants';
import { LccCreationDialogTab } from '../lcc-type';
import { Box } from '@mui/material';
import LccHvdcLine from '../lcc-hvdc-line';
import LccConverterStation from '../lcc-converter-station';

interface LccModificationFormProps {
    tabIndex: number;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export function LccModificationForm({
    tabIndex,
    studyUuid,
    currentRootNetworkUuid,
    currentNode,
}: Readonly<LccModificationFormProps>) {
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
                    isModification
                />
            </Box>
            <Box hidden={tabIndex !== LccCreationDialogTab.CONVERTER_STATION_2} p={1}>
                <LccConverterStation
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    id={CONVERTER_STATION_2}
                    stationLabel={'converterStation2'}
                    isModification
                />
            </Box>
        </>
    );
}
