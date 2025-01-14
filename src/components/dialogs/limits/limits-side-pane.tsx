/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { FloatInput } from '@gridsuite/commons-ui';
import {
    CURRENT_LIMITS,
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
import { TemporaryLimitData } from './limits-type';
import DndTable from '../../utils/dnd-table/dnd-table';

export interface LimitsSidePaneProps {
    indexLimitGroup: number;
    limitsGroupFormName: string;
    permanentCurrentLimitPreviousValue: any;
    previousValues: any;
    clearableFields: any;
    currentNode: any;
}

export interface ILimitColumnDef {
    label: string;
    dataKey: string;
    initialValue: boolean | string | string[] | number | null;
    editable: boolean;
    numeric: boolean;
}

export function LimitsSidePane({
    indexLimitGroup,
    limitsGroupFormName,
    permanentCurrentLimitPreviousValue,
    previousValues,
    clearableFields,
    currentNode,
}: Readonly<LimitsSidePaneProps>) {
    const intl = useIntl();
    const { getValues } = useFormContext();
    const useFieldArrayOutputTemporaryLimits = useFieldArray({
        name: `${limitsGroupFormName}[${indexLimitGroup}].${CURRENT_LIMITS}.${TEMPORARY_LIMITS}`,
    });

    const columnsDefinition: ILimitColumnDef[] = useMemo(() => {
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

    const newRowData: TemporaryLimitData = useMemo(() => {
        const newRowData: TemporaryLimitData = { name: '' };
        columnsDefinition.forEach((column: ILimitColumnDef) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [columnsDefinition]);
    const createRows = () => [newRowData];

    const temporaryLimitHasPreviousValue = useCallback(
        (rowIndex: number, arrayFormName: string, temporaryLimits: TemporaryLimitData[]) => {
            return (
                formatTemporaryLimits(temporaryLimits)?.filter(
                    (l: TemporaryLimitData) =>
                        l.name === getValues(arrayFormName)[rowIndex]?.name &&
                        l.acceptableDuration === getValues(arrayFormName)[rowIndex]?.acceptableDuration
                )?.length > 0
            );
        },
        [getValues]
    );

    const shouldReturnPreviousValue = useCallback(
        (rowIndex: number, column: ILimitColumnDef, arrayFormName: string, temporaryLimits: TemporaryLimitData[]) => {
            return (
                (temporaryLimitHasPreviousValue(rowIndex, arrayFormName, temporaryLimits) &&
                    column.dataKey === TEMPORARY_LIMIT_VALUE) ||
                getValues(arrayFormName)[rowIndex]?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
            );
        },
        [getValues, temporaryLimitHasPreviousValue]
    );

    const findTemporaryLimit = useCallback(
        (rowIndex: number, arrayFormName: string, temporaryLimits: TemporaryLimitData[]) => {
            return temporaryLimits?.find(
                (e: TemporaryLimitData) =>
                    e.name === getValues(arrayFormName)[rowIndex]?.name &&
                    e.acceptableDuration === getValues(arrayFormName)[rowIndex]?.acceptableDuration
            );
        },
        [getValues]
    );

    const getPreviousValue = useCallback(
        (rowIndex: number, column: ILimitColumnDef, arrayFormName: string, temporaryLimits: TemporaryLimitData[]) => {
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
        (rowIndex: number, column: ILimitColumnDef, arrayFormName: string, temporaryLimits: TemporaryLimitData[]) => {
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
            <Box sx={{ maxWidth: 300, paddingTop: 2 }}>
                <FloatInput
                    name={`${limitsGroupFormName}[${indexLimitGroup}].${CURRENT_LIMITS}.${PERMANENT_LIMIT}`}
                    label="PermanentCurrentLimitText"
                    adornment={AmpereAdornment}
                    previousValue={permanentCurrentLimitPreviousValue}
                    clearable={clearableFields}
                />
            </Box>
        ),
        [limitsGroupFormName, indexLimitGroup, clearableFields, permanentCurrentLimitPreviousValue]
    );

    const isValueModified = useCallback(
        (rowIndex: number, arrayFormName: string) => {
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
        <Box sx={{ p: 2 }}>
            {indexLimitGroup !== undefined && permanentCurrentLimitField}
            <Box component={`h4`}>
                <FormattedMessage id="TemporaryCurrentLimitsText" />
            </Box>
            {indexLimitGroup !== undefined && (
                <DndTable
                    arrayFormName={`${limitsGroupFormName}[${indexLimitGroup}].${CURRENT_LIMITS}.${TEMPORARY_LIMITS}`}
                    useFieldArrayOutput={useFieldArrayOutputTemporaryLimits}
                    createRows={createRows}
                    columnsDefinition={columnsDefinition}
                    withLeftButtons={false}
                    withAddRowsDialog={false}
                    withBottomButtons={false}
                    withCheckboxes={false}
                    withButtonOnTheRight
                    previousValues={previousValues}
                    disableTableCell={disableTableCell}
                    getPreviousValue={getPreviousValue}
                    isValueModified={isValueModified}
                    minRowsNumber={5}
                    tableHeight={400}
                />
            )}
        </Box>
    );
}
