/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
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
import { TemporaryLimit } from '../../../services/network-modification-types';
import DndTable from '../../utils/dnd-table/dnd-table';
import TemporaryLimitsTable from './temporary-limits-table';
import { CurrentTreeNode } from '../../../redux/reducer';
import { ColumnNumeric, ColumnText, DndColumn, DndColumnType } from 'components/utils/dnd-table/dnd-table.type';
import LimitsChart from './limitsChart';

export interface LimitsSidePaneProps {
    limitsGroupFormName: string;
    permanentCurrentLimitPreviousValue: number | null | undefined;
    temporaryLimitsPreviousValues: TemporaryLimit[];
    clearableFields: boolean | undefined;
    currentNode?: CurrentTreeNode;
    onlySelectedLimitsGroup: boolean;
}

export function LimitsSidePane({
    limitsGroupFormName,
    permanentCurrentLimitPreviousValue,
    temporaryLimitsPreviousValues,
    clearableFields,
    currentNode,
    onlySelectedLimitsGroup,
}: Readonly<LimitsSidePaneProps>) {
    const intl = useIntl();
    const { getValues } = useFormContext();
    const useFieldArrayOutputTemporaryLimits = useFieldArray({
        name: `${limitsGroupFormName}.${TEMPORARY_LIMITS}`,
    });
    const columnsDefinition: ((ColumnText | ColumnNumeric) & { initialValue: string | null })[] = useMemo(() => {
        return [
            {
                label: 'TemporaryLimitName',
                dataKey: TEMPORARY_LIMIT_NAME,
                initialValue: '',
                editable: true,
                type: DndColumnType.TEXT as const,
                maxWidth: 200,
            },
            {
                label: 'TemporaryLimitDuration',
                dataKey: TEMPORARY_LIMIT_DURATION,
                initialValue: null,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                maxWidth: 100,
            },
            {
                label: 'TemporaryLimitValue',
                dataKey: TEMPORARY_LIMIT_VALUE,
                initialValue: null,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                maxWidth: 100,
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }),
        }));
    }, [intl]);

    const newRowData = useMemo(() => {
        let newRowData: any = {};
        columnsDefinition.forEach((column) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [columnsDefinition]);
    const createRows = () => [newRowData];

    const temporaryLimitHasPreviousValue = useCallback(
        (rowIndex: number, arrayFormName: string, temporaryLimits?: TemporaryLimit[]) => {
            if (!temporaryLimits) {
                return false;
            }
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
        (rowIndex: number, column: DndColumn, arrayFormName: string, temporaryLimits: TemporaryLimit[]) => {
            return (
                (temporaryLimitHasPreviousValue(rowIndex, arrayFormName, temporaryLimits) &&
                    column.dataKey === TEMPORARY_LIMIT_VALUE) ||
                getValues(arrayFormName)[rowIndex]?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
            );
        },
        [getValues, temporaryLimitHasPreviousValue]
    );

    const findTemporaryLimit = useCallback(
        (rowIndex: number, arrayFormName: string, temporaryLimits: TemporaryLimit[]) => {
            return temporaryLimits?.find(
                (e: TemporaryLimit) =>
                    e.name === getValues(arrayFormName)[rowIndex]?.name &&
                    e.acceptableDuration === getValues(arrayFormName)[rowIndex]?.acceptableDuration
            );
        },
        [getValues]
    );

    const getPreviousValue = useCallback(
        (rowIndex: number, column: DndColumn, arrayFormName: string, temporaryLimits?: TemporaryLimit[]) => {
            if (!temporaryLimits) {
                return undefined;
            }
            const formattedTemporaryLimits = formatTemporaryLimits(temporaryLimits);
            if (!temporaryLimits?.length) {
                return undefined;
            }
            if (!shouldReturnPreviousValue(rowIndex, column, arrayFormName, formattedTemporaryLimits)) {
                return undefined;
            }
            const temporaryLimit = findTemporaryLimit(rowIndex, arrayFormName, formattedTemporaryLimits);
            if (temporaryLimit === undefined) {
                return undefined;
            }
            if (column.dataKey === TEMPORARY_LIMIT_VALUE) {
                return temporaryLimit?.value ?? Number.MAX_VALUE;
            } else if (column.dataKey === TEMPORARY_LIMIT_DURATION) {
                return temporaryLimit?.acceptableDuration ?? Number.MAX_VALUE;
            }
        },
        [findTemporaryLimit, shouldReturnPreviousValue]
    );

    const disableTableCell = useCallback(
        (rowIndex: number, column: DndColumn, arrayFormName: string, temporaryLimits?: TemporaryLimit[]) => {
            // If the temporary limit is added, all fields are editable
            // otherwise, only the value field is editable
            return getValues(arrayFormName) &&
                getValues(arrayFormName)[rowIndex]?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
                ? false
                : temporaryLimitHasPreviousValue(rowIndex, arrayFormName, temporaryLimits) &&
                      column.dataKey !== TEMPORARY_LIMIT_VALUE;
        },
        [getValues, temporaryLimitHasPreviousValue]
    );

    const permanentCurrentLimitField = useMemo(
        () => (
            <Box sx={{ maxWidth: 300, paddingTop: 2 }}>
                <FloatInput
                    name={`${limitsGroupFormName}.${PERMANENT_LIMIT}`}
                    label="PermanentCurrentLimitText"
                    adornment={AmpereAdornment}
                    previousValue={permanentCurrentLimitPreviousValue ?? undefined}
                    clearable={clearableFields}
                />
            </Box>
        ),
        [limitsGroupFormName, clearableFields, permanentCurrentLimitPreviousValue]
    );

    const isValueModified = useCallback(
        (rowIndex: number, arrayFormName: string) => {
            const temporaryLimits = getValues(arrayFormName);
            const temporaryLimit = temporaryLimits ? temporaryLimits[rowIndex] : null;
            if (
                temporaryLimit?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED &&
                !isNodeBuilt(currentNode ?? null)
            ) {
                return false;
            } else {
                return temporaryLimit?.modificationType !== null;
            }
        },
        [currentNode, getValues]
    );

    return (
        <Box sx={{ p: 2 }}>
            <Box>
                <LimitsChart limitsGroupFormName={limitsGroupFormName} />
            </Box>
            {permanentCurrentLimitField}
            <Box component={`h4`}>
                <FormattedMessage id="TemporaryCurrentLimitsText" />
            </Box>
            {onlySelectedLimitsGroup ? (
                <DndTable
                    arrayFormName={`${limitsGroupFormName}.${TEMPORARY_LIMITS}`}
                    useFieldArrayOutput={useFieldArrayOutputTemporaryLimits}
                    createRows={createRows}
                    columnsDefinition={columnsDefinition}
                    tableHeight={270}
                    withLeftButtons={false}
                    withAddRowsDialog={false}
                    previousValues={temporaryLimitsPreviousValues}
                    disableTableCell={disableTableCell}
                    getPreviousValue={getPreviousValue}
                    isValueModified={isValueModified}
                />
            ) : (
                <TemporaryLimitsTable
                    arrayFormName={`${limitsGroupFormName}.${TEMPORARY_LIMITS}`}
                    createRow={createRows}
                    columnsDefinition={columnsDefinition}
                    previousValues={temporaryLimitsPreviousValues}
                    disableTableCell={disableTableCell}
                    getPreviousValue={getPreviousValue}
                    isValueModified={isValueModified}
                />
            )}
        </Box>
    );
}
