/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { LineCreationDialogTab } from './line-modification-dialog';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
} from 'components/refactor/utils/field-constants';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import { areIdsEqual, getObjectId } from 'components/refactor/utils/utils';
import TextInput from 'components/refactor/rhf-inputs/text-input';
import { Box, Grid } from '@mui/material';
import { gridItem } from 'components/dialogs/dialogUtils';
import LimitsPane from '../../limits/limits-pane';
import { fetchEquipmentsIds } from 'utils/rest-api';
import { useFormContext, useWatch } from 'react-hook-form';
import LineCharacteristicsPane from '../characteristics-pane/line-characteristics-pane';
import LineDialogTabs from '../line-dialog-tabs';

const LineModificationForm = ({
    studyUuid,
    currentNode,
    onEquipmentIdChange,
    lineToModify,
    tabIndexesWithError,
}) => {
    const [tabIndex, setTabIndex] = useState(
        LineCreationDialogTab.CHARACTERISTICS_TAB
    );
    const [linesOptions, setLinesOptions] = useState([]);

    const watchEquipmentId = useWatch({
        name: EQUIPMENT_ID,
    });

    const { getValues } = useFormContext();
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

    const disableTableCell = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits) => {
            return (
                temporaryLimits
                    ?.map(({ name }) => name)
                    .includes(getValues(arrayFormName)[rowIndex]?.name) &&
                column.dataKey !== 'value'
            );
        },
        [getValues]
    );

    const getTemporaryLimitPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits) => {
            if (disableTableCell) {
                return disableTableCell(
                    rowIndex,
                    column,
                    arrayFormName,
                    temporaryLimits
                )
                    ? undefined
                    : temporaryLimits?.find(
                          (e) =>
                              e.name ===
                              getValues(arrayFormName)[rowIndex]?.name
                      )?.value ?? Number.MAX_VALUE;
            }
            return undefined;
        },
        [disableTableCell, getValues]
    );

    const lineIdField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={EQUIPMENT_ID}
            label={'ID'}
            options={linesOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
            formProps={{ autoFocus: true, margin: 'normal' }}
        />
    );

    const lineNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            previousValue={lineToModify?.name}
            clearable
            formProps={{ margin: 'normal' }}
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
                    setTabIndex={setTabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                />
            </Box>
            <Box
                hidden={tabIndex !== LineCreationDialogTab.CHARACTERISTICS_TAB}
                p={1}
            >
                <LineCharacteristicsPane
                    displayConnectivity={false}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    lineToModify={lineToModify}
                    clearableFields={true}
                />
            </Box>

            <Box hidden={tabIndex !== LineCreationDialogTab.LIMITS_TAB} p={1}>
                <LimitsPane
                    equipmentToModify={lineToModify}
                    disableTableCell={disableTableCell}
                    clearableFields={true}
                    getTemporaryLimitPreviousValue={
                        getTemporaryLimitPreviousValue
                    }
                />
            </Box>
        </>
    );
};

export default LineModificationForm;
