/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AutocompleteInput } from '@gridsuite/commons-ui';
import { BUS_BAR_SECTION_ID1, BUS_BAR_SECTION_ID2 } from 'components/utils/field-constants';
import GridItem from '../../commons/grid-item.js';
import { getObjectId } from '../../../utils/utils.js';
import { Box, Grid, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from '../../../diagrams/singleLineDiagram/position-diagram-pane.js';
import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';

export const CouplingDeviceForm = ({
    sectionOptions,
    studyUuid,
    voltageLevelId,
    currentNodeUuid,
    currentRootNetworkUuid,
    isNodeBuilt,
}) => {
    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);
    const intl = useIntl();

    const handleCloseDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(false);
    }, []);
    const handleClickOpenDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(true);
    }, []);

    const busBarSectionId1Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${BUS_BAR_SECTION_ID1}`}
            label="BusBarSectionID1"
            options={sectionOptions ?? []}
            getOptionLabel={getObjectId}
            size={'small'}
            sx={{ paddingTop: 2, paddingRight: 1 }}
        />
    );
    const busBarSectionId2Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${BUS_BAR_SECTION_ID2}`}
            label="BusBarSectionID2"
            options={sectionOptions ?? []}
            getOptionLabel={getObjectId}
            size={'small'}
            sx={{ paddingTop: 2, paddingRight: 4 }}
        />
    );

    const stackHelper = (
        <Tooltip
            title={intl.formatMessage({ id: 'builtNodeTooltipForDiagram' })}
            placement="right"
            arrow
            PopperProps={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -10],
                        },
                    },
                ],
            }}
        >
            <InfoOutlined color="info" fontSize="small" />
        </Tooltip>
    );

    return (
        <>
            <Grid container>
                <GridItem size={4.5}>{busBarSectionId1Field}</GridItem>
                <GridItem size={4.5}>{busBarSectionId2Field}</GridItem>
                {isNodeBuilt && (
                    <GridItem size={2}>
                        <Grid sx={{ paddingTop: 2 }}>
                            <Button onClick={handleClickOpenDiagramPane} variant="outlined">
                                <FormattedMessage id={'CouplingDeviceCreationDiagramButton'} />
                            </Button>
                            {stackHelper}
                        </Grid>
                    </GridItem>
                )}
            </Grid>
            <Box>
                <PositionDiagramPane
                    studyUuid={studyUuid}
                    open={isDiagramPaneOpen}
                    onClose={handleCloseDiagramPane}
                    voltageLevelId={{ id: voltageLevelId }}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Box>
        </>
    );
};
