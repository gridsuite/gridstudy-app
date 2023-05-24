/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { EQUIPMENT_ID, EQUIPMENT_NAME } from 'components/utils/field-constants';
import { Box, Grid } from '@mui/material';
import { filledTextField, gridItem } from 'components/dialogs/dialogUtils';
import { useWatch } from 'react-hook-form';
import LineDialogTabs from '../line-dialog-tabs';
import AutocompleteInput from 'components/utils/rhf-inputs/autocomplete-input';
import { getObjectId } from 'components/utils/utils';
import TextInput from 'components/utils/rhf-inputs/text-input';

import { fetchEquipmentsIds } from '../../../../services/study';

const LineModificationDialogHeader = ({
    studyUuid,
    currentNode,
    onEquipmentIdChange,
    lineToModify,
    tabIndexesWithError,
    tabIndex,
    setTabIndex,
}) => {
    const [linesOptions, setLinesOptions] = useState([]);

    const watchEquipmentId = useWatch({
        name: EQUIPMENT_ID,
    });

    useEffect(() => {
        onEquipmentIdChange(watchEquipmentId);
    }, [watchEquipmentId, onEquipmentIdChange]);

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNode?.id,
            undefined,
            'LINE',
            true
        ).then((values) => {
            setLinesOptions(values.sort((a, b) => a.localeCompare(b)));
        });
    }, [studyUuid, currentNode?.id]);

    const lineIdField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={EQUIPMENT_ID}
            label={'ID'}
            options={linesOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
            formProps={{ autoFocus: true, ...filledTextField }}
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
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px',
                }}
            >
                <Grid container spacing={2}>
                    {gridItem(lineIdField, 4)}
                    {gridItem(lineNameField, 4)}
                </Grid>
                <LineDialogTabs
                    tabIndex={tabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                    setTabIndex={setTabIndex}
                />
            </Box>
        </>
    );
};

export default LineModificationDialogHeader;
