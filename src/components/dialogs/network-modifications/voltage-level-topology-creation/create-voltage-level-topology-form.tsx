/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntegerInput } from '@gridsuite/commons-ui';
import { SECTION_COUNT } from 'components/utils/field-constants';
import GridItem from '../../commons/grid-item';
import { Box, Grid, TextField, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from '../../../diagrams/singleLineDiagram/position-diagram-pane';
import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { filledTextField } from '../../dialog-utils';
import { UUID } from 'crypto';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { SwitchesBetweenSections } from '../voltage-level/switches-between-sections/switches-between-sections';
import { useMemo } from 'react';

export interface CreateVoltageLevelTopologyFormProps {
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

    const voltageLevelIdField = useMemo(
        () => (
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
        ),
        [intl, voltageLevelId]
    );

    const sectionCountField = <IntegerInput name={`${SECTION_COUNT}`} label={'SectionCount'} />;

    const diagramToolTip = useMemo(
        () => (
            <Tooltip sx={{ paddingLeft: 1 }} title={intl.formatMessage({ id: 'builtNodeTooltipForDiagram' })}>
                <InfoOutlined color="info" fontSize="medium" />
            </Tooltip>
        ),
        [intl]
    );

    return (
        <>
            <Grid container spacing={3}>
                <GridItem size={4}>{voltageLevelIdField}</GridItem>
                {isNodeBuilt(currentNode) && (
                    <GridItem size={3}>
                        <Button onClick={handleClickOpenDiagramPane} variant="outlined">
                            <FormattedMessage id={'CreateCouplingDeviceDiagramButton'} />
                        </Button>
                        {diagramToolTip}
                    </GridItem>
                )}
            </Grid>
            <Grid container spacing={3} sx={{ paddingTop: 4 }}>
                <GridItem size={4}>{sectionCountField}</GridItem>
                <GridItem size={8}>
                    <SwitchesBetweenSections />
                </GridItem>
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
