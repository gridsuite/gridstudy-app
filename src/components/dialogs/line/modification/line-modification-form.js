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
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_VALUE,
} from 'components/utils/field-constants';
import { Box, Grid } from '@mui/material';
import { filledTextField, gridItem } from 'components/dialogs/dialogUtils';
import LimitsPane from '../../limits/limits-pane';
import { fetchEquipmentsIds } from 'utils/rest-api';
import { useFormContext, useWatch } from 'react-hook-form';
import LineCharacteristicsPane from '../characteristics-pane/line-characteristics-pane';
import LineDialogTabs from '../line-dialog-tabs';
import AutocompleteInput from 'components/utils/rhf-inputs/autocomplete-input';
import { areIdsEqual, getObjectId } from 'components/utils/utils';
import TextInput from 'components/utils/rhf-inputs/text-input';

const LineModificationForm = ({
    studyUuid,
    currentNode,
    onEquipmentIdChange,
    lineToModify,
    modifiedLine,
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

    const temporaryLimitHasPreviousValue = useCallback(
        (rowIndex, arrayFormName, temporaryLimits) => {
            return temporaryLimits
                ?.map(({ name }) => name)
                .includes(getValues(arrayFormName)[rowIndex]?.name);
        },
        [getValues]
    );

    const findTemporaryLimit = useCallback(
        (rowIndex, arrayFormName, temporaryLimits) => {
            return temporaryLimits?.find(
                (e) => e.name === getValues(arrayFormName)[rowIndex]?.name
            );
        },
        [getValues]
    );

    const disableTableCell = useCallback(
        (
            rowIndex,
            column,
            arrayFormName,
            temporaryLimits,
            modifiedTemporaryLimits
        ) => {
            // If the temporary limit is added, all fields are editable
            // otherwise, only the value field is editable
            return modifiedTemporaryLimits &&
                findTemporaryLimit(
                    rowIndex,
                    arrayFormName,
                    modifiedTemporaryLimits
                )?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
                ? false
                : temporaryLimitHasPreviousValue(
                      rowIndex,
                      arrayFormName,
                      temporaryLimits
                  ) && column.dataKey !== TEMPORARY_LIMIT_VALUE;
        },
        [findTemporaryLimit, temporaryLimitHasPreviousValue]
    );

    const shouldReturnPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits, modifiedValues) => {
            return (
                (temporaryLimitHasPreviousValue(
                    rowIndex,
                    arrayFormName,
                    temporaryLimits
                ) &&
                    column.dataKey === TEMPORARY_LIMIT_VALUE) ||
                findTemporaryLimit(rowIndex, arrayFormName, modifiedValues)
                    ?.modificationType ===
                    TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
            );
        },
        [findTemporaryLimit, temporaryLimitHasPreviousValue]
    );

    const getTemporaryLimitPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits, modifiedValues) => {
            if (
                shouldReturnPreviousValue(
                    rowIndex,
                    column,
                    arrayFormName,
                    temporaryLimits,
                    modifiedValues
                )
            ) {
                const temporaryLimit = findTemporaryLimit(
                    rowIndex,
                    arrayFormName,
                    temporaryLimits
                );
                if (column.dataKey === TEMPORARY_LIMIT_VALUE) {
                    return temporaryLimit?.value ?? Number.MAX_VALUE;
                } else if (column.dataKey === TEMPORARY_LIMIT_DURATION) {
                    return (
                        temporaryLimit?.acceptableDuration ?? Number.MAX_VALUE
                    );
                }
            } else {
                return undefined;
            }
        },
        [findTemporaryLimit, shouldReturnPreviousValue]
    );

    const isTemporaryLimitModified = useCallback(
        (rowIndex, arrayFormName, modifiedValues) => {
            return (
                findTemporaryLimit(rowIndex, arrayFormName, modifiedValues)
                    ?.modificationType !== undefined
            );
        },
        [findTemporaryLimit]
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
                    modifiedEquipment={modifiedLine}
                    disableTableCell={disableTableCell}
                    clearableFields={true}
                    getTemporaryLimitPreviousValue={
                        getTemporaryLimitPreviousValue
                    }
                    isTemporaryLimitModified={isTemporaryLimitModified}
                />
            </Box>
        </>
    );
};

export default LineModificationForm;
