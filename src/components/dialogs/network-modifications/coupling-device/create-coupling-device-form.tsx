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
import { Box, Grid, TextField, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from '../../../diagrams/singleLineDiagram/position-diagram-pane.js';
import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { filledTextField } from '../../dialog-utils';
import GridSection from '../../commons/grid-section';
import {
    EquipmentModificationDialogProps
} from "../../../graph/menus/network-modifications/network-modification-menu.type";

export type CreateCouplingDeviceFormProps = EquipmentModificationDialogProps & {
    sectionOptions: Array[];
    studyUuid: string;
    voltageLevelId: string;
    currentNodeUuid: string;
    currentRootNetworkUuid: string;
    isNodeBuilt: boolean;
};
export const CreateCouplingDeviceForm = ({
    sectionOptions,
    studyUuid,
    voltageLevelId,
    currentNodeUuid,
    currentRootNetworkUuid,
    isNodeBuilt,
}: Readonly<CreateCouplingDeviceFormProps>) => {
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

    const diagramToolTip = (
        <Tooltip sx={{ paddingLeft: 1 }} title={intl.formatMessage({ id: 'builtNodeTooltipForDiagram' })}>
            <InfoOutlined color="info" fontSize="medium" />
        </Tooltip>
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{voltageLevelIdField}</GridItem>
                {isNodeBuilt && (
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
            <GridSection
                title={'CouplingDeviceText'}
                tooltipEnabled={true}
                tooltipMessage={'CouplingDeviceBusBarSectionToolTipText'}
            />
            <Grid container>
                <GridItem size={4}>{busBarSectionId1Field}</GridItem>
                <GridItem size={4}>{busBarSectionId2Field}</GridItem>
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
