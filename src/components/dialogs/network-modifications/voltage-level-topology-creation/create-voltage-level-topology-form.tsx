/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, Option } from '@gridsuite/commons-ui';
import { ALIGNED_BUSES_OR_BUSBAR_COUNT, SECTION_COUNT } from 'components/utils/field-constants';
import GridItem from '../../commons/grid-item';
import { Box, Grid, TextField, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from '../../../diagrams/singleLineDiagram/position-diagram-pane';
import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { filledTextField } from '../../dialog-utils';
import GridSection from '../../commons/grid-section';
import { UUID } from 'crypto';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { CurrentTreeNode } from '../../../graph/tree-node.type';

export interface CreateVoltageLevelTopologyFormProps {
    sectionOptions: Option[];
    voltageLevelId: string;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export default function CreateVoltageLevelTopologyForm({
    studyUuid,
    voltageLevelId,
    currentNode,
    currentRootNetworkUuid,
}: Readonly<CreateVoltageLevelTopologyFormProps>) {
    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);
    const intl = useIntl();

    const handleCloseDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(false);
    }, []);
    const handleClickOpenDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(true);
    }, []);

    const voltageLevelIdField = (
        <TextField
            size="small"
            fullWidth
            label={intl.formatMessage({ id: 'VoltageLevelId' })}
            value={voltageLevelId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );

    const sectionCountField = <FloatInput name={`${SECTION_COUNT}`} label={'SectionCount'} />;
    const alignedBusesOrBusbarCount = (
        <FloatInput name={`${ALIGNED_BUSES_OR_BUSBAR_COUNT}`} label={'AlignedBusesOrBusbarCount'} />
    );

    const diagramToolTip = (
        <Tooltip sx={{ paddingLeft: 1 }} title={intl.formatMessage({ id: 'builtNodeTooltipForDiagram' })}>
            <InfoOutlined color="info" fontSize="medium" />
        </Tooltip>
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{voltageLevelIdField}</GridItem>
                {isNodeBuilt(currentNode) && (
                    <GridItem size={3}>
                        <Grid sx={{ paddingTop: 1 }}>
                            <Button onClick={handleClickOpenDiagramPane} variant="outlined">
                                <FormattedMessage id={'CreateCouplingDeviceDiagramButton'} />
                            </Button>
                            {diagramToolTip}
                        </Grid>
                    </GridItem>
                )}
            </Grid>
            <GridSection title={'test'} />
            <Grid container>
                <GridItem size={4}>{sectionCountField}</GridItem>
            </Grid>

            <Grid container>
                <GridItem size={4}>{alignedBusesOrBusbarCount}</GridItem>
            </Grid>
            <Box>
                <PositionDiagramPane
                    studyUuid={studyUuid}
                    open={isDiagramPaneOpen}
                    onClose={handleCloseDiagramPane}
                    voltageLevelId={voltageLevelId}
                    currentNodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Box>
        </>
    );
}
