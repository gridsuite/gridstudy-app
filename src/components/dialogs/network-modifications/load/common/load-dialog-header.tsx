/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { EQUIPMENT_ID, EQUIPMENT_NAME, LOAD_TYPE } from 'components/utils/field-constants';
import { Box, Grid, TextField } from '@mui/material';
import { getLoadTypeLabel, LOAD_TYPES } from 'components/network/constants';
import { filledTextField, SelectInput, TextInput } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';
import { useIntl } from 'react-intl';
import LoadDialogTabs from './load-dialog-tabs';
import { LoadFormInfos } from './load.type';

interface LoadDialogHeaderProps {
    loadToModify?: LoadFormInfos | null;
    tabIndexesWithError: number[];
    tabIndex: number;
    setTabIndex: (index: number) => void;
    equipmentId?: string | null;
    isModification?: boolean;
}

const LoadDialogHeader: React.FC<LoadDialogHeaderProps> = ({
    loadToModify,
    tabIndexesWithError,
    tabIndex,
    setTabIndex,
    equipmentId,
    isModification = false,
}) => {
    const intl = useIntl();

    const loadIdField = isModification ? (
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
    ) : (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const loadNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={loadToModify?.name}
            clearable
        />
    );

    const loadTypeField = (
        <SelectInput
            name={LOAD_TYPE}
            label="Type"
            options={Object.values(LOAD_TYPES)}
            fullWidth
            size={'small'}
            formProps={filledTextField}
            previousValue={
                loadToModify?.type && loadToModify.type !== 'UNDEFINED'
                    ? intl.formatMessage({
                          id: getLoadTypeLabel(loadToModify.type),
                      })
                    : undefined
            }
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
                <GridItem size={4}>{loadIdField}</GridItem>
                <GridItem size={4}>{loadNameField}</GridItem>
                <GridItem size={4}>{loadTypeField}</GridItem>
            </Grid>
            <LoadDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
                isModification={isModification}
            />
        </Box>
    );
};

export default LoadDialogHeader;
