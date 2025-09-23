/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Grid } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    DndColumnType,
    ColumnNumeric,
    ColumnText,
    DndColumn,
    FloatInput,
    SelectInput,
    Option,
} from '@gridsuite/commons-ui';
import {
    APPLICABIlITY,
    PERMANENT_LIMIT,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import { AmpereAdornment } from '../dialog-utils';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { formatTemporaryLimits } from '../../utils/utils.js';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { TemporaryLimit } from '../../../services/network-modification-types';
import TemporaryLimitsTable from './temporary-limits-table';
import LimitsChart from './limitsChart';
import { CurrentTreeNode } from '../../graph/tree-node.type';
import { APPLICABILITY } from '../../network/constants';

export interface LimitsSidePaneProps {
    limitsGroupFormName: string;
    limitsGroupApplicabilityName?: string;
    permanentCurrentLimitPreviousValue: number | null | undefined;
    temporaryLimitsPreviousValues: TemporaryLimit[];
    applicabilityPreviousValue?: string;
    clearableFields: boolean | undefined;
    currentNode?: CurrentTreeNode;
    selectedLimitSetName?: string;
    checkLimitSetUnicity: (editedLimitGroupName: string, newSelectedApplicability: string) => string;
}

export function LimitsSidePane({
    limitsGroupFormName,
    limitsGroupApplicabilityName,
    permanentCurrentLimitPreviousValue,
    temporaryLimitsPreviousValues,
    applicabilityPreviousValue,
    clearableFields,
    currentNode,
    selectedLimitSetName,
    checkLimitSetUnicity,
}: Readonly<LimitsSidePaneProps>) {
    const intl = useIntl();
    const { setError, getValues } = useFormContext();
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
                    (l: TemporaryLimit) =>
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
                getValues(arrayFormName)[rowIndex]?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADD
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
        (
            rowIndex: number,
            column: ColumnText | ColumnNumeric,
            arrayFormName: string,
            temporaryLimits?: TemporaryLimit[]
        ) => {
            // If the temporary limit is added, all fields are editable
            // otherwise, only the value field is editable
            let disable: boolean =
                temporaryLimitHasPreviousValue(rowIndex, arrayFormName, temporaryLimits) &&
                column.dataKey !== TEMPORARY_LIMIT_VALUE;

            if (
                getValues(arrayFormName) &&
                getValues(arrayFormName)[rowIndex]?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADD
            ) {
                disable = false;
            }

            return disable;
        },
        [getValues, temporaryLimitHasPreviousValue]
    );

    const isValueModified = useCallback(
        (rowIndex: number, arrayFormName: string) => {
            const temporaryLimits = getValues(arrayFormName);
            const temporaryLimit = temporaryLimits ? temporaryLimits[rowIndex] : null;
            if (
                temporaryLimit?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFY &&
                !isNodeBuilt(currentNode ?? null)
            ) {
                return false;
            } else {
                return temporaryLimit?.modificationType !== null;
            }
        },
        [currentNode, getValues]
    );

    const PermanentLimitBox = useMemo(
        () => (
            <FloatInput
                name={`${limitsGroupFormName}.${PERMANENT_LIMIT}`}
                label="PermanentCurrentLimitText"
                adornment={AmpereAdornment}
                previousValue={permanentCurrentLimitPreviousValue ?? undefined}
                clearable={clearableFields}
            />
        ),
        [clearableFields, limitsGroupFormName, permanentCurrentLimitPreviousValue]
    );

    return (
        <Box sx={{ p: 2 }}>
            {limitsGroupApplicabilityName && (
                <Grid container justifyContent="flex-start" alignItems="center" sx={{ paddingBottom: '15px' }}>
                    <Grid item xs={2}>
                        <FormattedMessage id="Applicability" />
                    </Grid>
                    <Grid item xs={4}>
                        <SelectInput
                            options={Object.values(APPLICABILITY)}
                            name={`${limitsGroupApplicabilityName}.${APPLICABIlITY}`}
                            previousValue={applicabilityPreviousValue}
                            sx={{ flexGrow: 1 }}
                            disableClearable
                            size="small"
                            onCheckNewValue={(value: Option | null) => {
                                if (value) {
                                    const errorMessage: string = checkLimitSetUnicity(
                                        selectedLimitSetName ?? '',
                                        typeof value === 'string' ? value : value.id
                                    );
                                    setError(`${limitsGroupApplicabilityName}.${APPLICABIlITY}`, {
                                        message: errorMessage,
                                    });
                                }
                                return true;
                            }}
                        />
                    </Grid>
                </Grid>
            )}
            <Box>
                <LimitsChart
                    limitsGroupFormName={limitsGroupFormName}
                    previousPermanentLimit={permanentCurrentLimitPreviousValue}
                />
            </Box>
            <Box sx={{ maxWidth: 300, paddingTop: 2 }}>{PermanentLimitBox}</Box>
            <Box component={`h4`}>
                <FormattedMessage id="TemporaryCurrentLimitsText" />
            </Box>
            <TemporaryLimitsTable
                arrayFormName={`${limitsGroupFormName}.${TEMPORARY_LIMITS}`}
                createRow={createRows}
                columnsDefinition={columnsDefinition}
                previousValues={temporaryLimitsPreviousValues}
                disableTableCell={disableTableCell}
                getPreviousValue={getPreviousValue}
                isValueModified={isValueModified}
            />
        </Box>
    );
}
