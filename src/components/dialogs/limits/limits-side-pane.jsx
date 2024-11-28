/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Paper } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import DndTable from '../../utils/dnd-table/dnd-table.jsx';
import { FloatInput } from '@gridsuite/commons-ui';
import {
    PERMANENT_LIMIT,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import { AmpereAdornment } from '../dialog-utils';
import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { formatTemporaryLimits } from '../../utils/utils.js';
import { isNodeBuilt } from '../../graph/util/model-functions';

const styles = {
    limitsBackground: {
        backgroundColor: '#383838',
        padding: 2,
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919',
    },
};

export const LimitsSidePane = ({
    indexLimitSet,
    limitSetFormName,
    permanentCurrentLimitPreviousValue,
    previousValues,
    clearableFields,
    currentNode,
}) => {
    const intl = useIntl();
    const { getValues } = useFormContext();
    const useFieldArrayOutputTemporaryLimits = useFieldArray({
        name: `${limitSetFormName}[${indexLimitSet}].${TEMPORARY_LIMITS}`,
    });

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
    const createRows = () => [newRowData];

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

    const getPreviousValue = useCallback(
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

    const permanentCurrentLimitField = useMemo(
        () => (
            <Box sx={{ maxWidth: 300 }}>
                <FloatInput
                    name={`${limitSetFormName}[${indexLimitSet}].${PERMANENT_LIMIT}`}
                    label="PermanentCurrentLimitText"
                    adornment={AmpereAdornment}
                    previousValue={permanentCurrentLimitPreviousValue}
                    clearable={clearableFields}
                />
            </Box>
        ),
        [limitSetFormName, indexLimitSet, clearableFields, permanentCurrentLimitPreviousValue]
    );

    const isValueModified = useCallback(
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

    return (
        <Paper sx={styles.limitsBackground}>
                {(indexLimitSet !== undefined) && permanentCurrentLimitField}
            <Box component={`h4`}>
                <FormattedMessage id="TemporaryCurrentLimitsText" />
            </Box>
            {(indexLimitSet !== undefined) && (
                <DndTable
                    arrayFormName={`${limitSetFormName}[${indexLimitSet}].${TEMPORARY_LIMITS}`}
                    useFieldArrayOutput={useFieldArrayOutputTemporaryLimits}
                    createRows={createRows}
                    columnsDefinition={columnsDefinition}
                    withLeftButtons={false}
                    withAddRowsDialog={false}
                    withBottomButtons={false}
                    withCheckboxes={false}
                    withTopRightAddButton
                    previousValues={previousValues}
                    disableTableCell={disableTableCell}
                    getPreviousValue={getPreviousValue}
                    isValueModified={isValueModified}
                    minRowsNumber={5}
                />
                )}
        </Paper>
    );
};
