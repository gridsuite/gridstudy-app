/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { filledTextField, IntegerInput, SwitchesBetweenSections } from '@gridsuite/commons-ui';
import { SECTION_COUNT } from 'components/utils/field-constants';
import GridItem from '../../../commons/grid-item';
import { Box, Grid, TextField, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { useCallback, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';

export interface CreateVoltageLevelTopologyFormProps {
    voltageLevelId: string;
    currentNode: CurrentTreeNode;
}

export default function CreateVoltageLevelTopologyForm({
    voltageLevelId,
    currentNode,
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
            <Grid container direction="column">
                <Grid item>
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            {voltageLevelIdField}
                        </Grid>
                        {isNodeBuilt(currentNode) && (
                            <Grid item xs={3}>
                                <Button onClick={handleClickOpenDiagramPane} variant="outlined">
                                    <FormattedMessage id={'CreateCouplingDeviceDiagramButton'} />
                                </Button>
                                {diagramToolTip}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container>
                        <Grid item xs={4}>
                            <IntegerInput name={`${SECTION_COUNT}`} label={'SectionCount'} />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <SwitchesBetweenSections />
                </Grid>
            </Grid>
            <Box>
                <PositionDiagramPane
                    open={isDiagramPaneOpen}
                    onClose={handleCloseDiagramPane}
                    voltageLevelId={voltageLevelId}
                />
            </Box>
        </>
    );
}
