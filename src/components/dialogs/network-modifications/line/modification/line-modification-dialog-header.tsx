/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_NAME } from 'components/utils/field-constants';
import { Box, Grid, TextField } from '@mui/material';
import { filledTextField } from 'components/dialogs/dialog-utils';
import LineDialogTabs from '../line-dialog-tabs';
import { TextInput } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';
import { BranchInfos } from '../../../../../services/study/network-map.type';

export interface LineModificationDialogHeaderProps {
    lineToModify: BranchInfos | null;
    tabIndexesWithError: number[];
    tabIndex: number | null;
    setTabIndex: React.Dispatch<React.SetStateAction<number | null>>;
    equipmentId: string;
}

const LineModificationDialogHeader = ({
    lineToModify,
    tabIndexesWithError,
    tabIndex,
    setTabIndex,
    equipmentId,
}: Readonly<LineModificationDialogHeaderProps>) => {
    const lineIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );

    const lineNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={lineToModify?.name}
            clearable
        />
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
            }}
        >
            <Grid container spacing={2}>
                <GridItem size={4}>{lineIdField}</GridItem>
                <GridItem size={4}>{lineNameField}</GridItem>
            </Grid>
            <LineDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
                isModification={true}
            />
        </Box>
    );
};

export default LineModificationDialogHeader;
