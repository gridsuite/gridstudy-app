/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, Paper } from '@mui/material';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    LIMITS,
    SELECTED_LIMIT_GROUP_1,
    SELECTED_LIMIT_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
} from 'components/utils/field-constants';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { formatTemporaryLimits } from 'components/utils/utils';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';

const styles = {
    limitsBackground: {
        backgroundColor: '#383838', // TODO : may be found in the theme ??
        padding: 2,
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919', // TODO : may be found in the theme ??
    },
};

const LimitsPane = ({ id = LIMITS, currentNode, equipmentToModify, clearableFields }) => {
    const intl = useIntl();
    const { getValues } = useFormContext();

    const columnsDefinition = useMemo(() => {
        return [
            {
                label: 'TemporaryLimitName',
                dataKey: TEMPORARY_LIMIT_NAME,
                initialValue: '',
                editable: true,
                numeric: false,
            },
            {
                label: 'TemporaryLimitDuration',
                dataKey: TEMPORARY_LIMIT_DURATION,
                initialValue: null,
                editable: true,
                numeric: true,
            },
            {
                label: 'TemporaryLimitValue',
                dataKey: TEMPORARY_LIMIT_VALUE,
                initialValue: null,
                editable: true,
                numeric: true,
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }),
        }));
    }, [intl]);

    const newRowData = useMemo(() => {
        const newRowData = {};
        columnsDefinition.forEach((column) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [columnsDefinition]);
    const createLimitRows = () => [newRowData];

    const temporaryLimitHasPreviousValue = useCallback(
        (rowIndex, arrayFormName, temporaryLimits) => {
            return (
                formatTemporaryLimits(temporaryLimits)?.filter(
                    (l) =>
                        l.name === getValues(arrayFormName)[rowIndex]?.name &&
                        l.acceptableDuration === getValues(arrayFormName)[rowIndex]?.acceptableDuration
                )?.length > 0
            );
        },
        [getValues]
    );

    const findTemporaryLimit = useCallback(
        (rowIndex, arrayFormName, temporaryLimits) => {
            return temporaryLimits?.find(
                (e) =>
                    e.name === getValues(arrayFormName)[rowIndex]?.name &&
                    e.acceptableDuration === getValues(arrayFormName)[rowIndex]?.acceptableDuration
            );
        },
        [getValues]
    );

    const disableTableCell = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits) => {
            // If the temporary limit is added, all fields are editable
            // otherwise, only the value field is editable
            return getValues(arrayFormName)[rowIndex]?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
                ? false
                : temporaryLimitHasPreviousValue(rowIndex, arrayFormName, temporaryLimits) &&
                      column.dataKey !== TEMPORARY_LIMIT_VALUE;
        },
        [getValues, temporaryLimitHasPreviousValue]
    );

    const shouldReturnPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits) => {
            return (
                (temporaryLimitHasPreviousValue(rowIndex, arrayFormName, temporaryLimits) &&
                    column.dataKey === TEMPORARY_LIMIT_VALUE) ||
                getValues(arrayFormName)[rowIndex]?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
            );
        },
        [getValues, temporaryLimitHasPreviousValue]
    );

    const getTemporaryLimitPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits) => {
            const formattedTemporaryLimits = formatTemporaryLimits(temporaryLimits);
            if (shouldReturnPreviousValue(rowIndex, column, arrayFormName, formattedTemporaryLimits)) {
                const temporaryLimit = findTemporaryLimit(rowIndex, arrayFormName, formattedTemporaryLimits);
                if (temporaryLimit === undefined) {
                    return undefined;
                }
                if (column.dataKey === TEMPORARY_LIMIT_VALUE) {
                    return temporaryLimit?.value ?? Number.MAX_VALUE;
                } else if (column.dataKey === TEMPORARY_LIMIT_DURATION) {
                    return temporaryLimit?.acceptableDuration ?? Number.MAX_VALUE;
                }
            } else {
                return undefined;
            }
        },
        [findTemporaryLimit, shouldReturnPreviousValue]
    );

    const isTemporaryLimitModified = useCallback(
        (rowIndex, arrayFormName) => {
            const temporaryLimit = getValues(arrayFormName)[rowIndex];
            if (
                temporaryLimit?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED &&
                !isNodeBuilt(currentNode)
            ) {
                return false;
            } else {
                return temporaryLimit?.modificationType !== null;
            }
        },
        [currentNode, getValues]
    );

    function handleAddLimitSetButton() {
        // TODO (cf dnd-table.jsx)
    }

    return (
        <Grid container spacing={2}>
            {/* titles */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side1" />
                    </Box>
                </Grid>
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side2" />
                    </Box>
                </Grid>
            </Grid>
            {/* active limit set */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        indexLimitSet={0}
                        formName={`${id}.${SELECTED_LIMIT_GROUP_1}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_1}`}
                    />
                </Grid>
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        indexLimitSet={0}
                        formName={`${id}.${SELECTED_LIMIT_GROUP_2}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_2}`}
                    />
                </Grid>
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={11}>
                <Grid item xs={1}>
                    <IconButton color="primary" onClick={() => handleAddLimitSetButton()} disabled>
                        [TODO]
                        <AddCircleIcon />
                    </IconButton>
                    <Paper sx={styles.limitsBackgroundUnselected}>[TODO pas sélectionné 0]</Paper>
                    <Paper sx={styles.limitsBackground}>[TODO Sélectionné]</Paper>
                    <Paper sx={styles.limitsBackgroundUnselected}>[TODO pas sélectionné 1]</Paper>
                    <Paper sx={styles.limitsBackgroundUnselected}>[TODO pas sélectionné 2]</Paper>
                </Grid>
                <Grid item xs={5}>
                    <LimitsSidePane
                        arrayFormName={`${id}.${CURRENT_LIMITS_1}`}
                        clearableFields={clearableFields}
                        indexLimitSet={0}
                        createRows={createLimitRows}
                        columnsDefinition={columnsDefinition}
                        permanentCurrentLimitPreviousValue={equipmentToModify?.currentLimits1?.permanentLimit}
                        previousValues={equipmentToModify?.currentLimits1?.temporaryLimits}
                        disableTableCell={disableTableCell}
                        getPreviousValue={getTemporaryLimitPreviousValue}
                        isValueModified={isTemporaryLimitModified}
                    />
                </Grid>
                <Grid item xs={5}>
                    <LimitsSidePane
                        arrayFormName={`${id}.${CURRENT_LIMITS_2}`}
                        clearableFields={clearableFields}
                        indexLimitSet={0}
                        createRows={createLimitRows}
                        columnsDefinition={columnsDefinition}
                        permanentCurrentLimitPreviousValue={equipmentToModify?.currentLimits2?.permanentLimit}
                        previousValues={equipmentToModify?.currentLimits2?.temporaryLimits}
                        disableTableCell={disableTableCell}
                        getPreviousValue={getTemporaryLimitPreviousValue}
                        isValueModified={isTemporaryLimitModified}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};

export default LimitsPane;
