/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Grid } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    ColumnNumeric,
    ColumnText,
    DndColumn,
    DndColumnType,
    ErrorInput,
    FieldErrorAlert,
    FloatInput,
    SelectInput,
    TextInput,
} from '@gridsuite/commons-ui';
import {
    APPLICABILITY_FIELD,
    CURRENT_LIMITS,
    LIMITS,
    LIMITS_PROPERTIES,
    NAME,
    OLG_IS_DUPLICATE,
    OPERATIONAL_LIMITS_GROUPS,
    PERMANENT_LIMIT,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import { AmpereAdornment } from '../dialog-utils';
import { useCallback, useEffect, useMemo } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { formatTemporaryLimits } from '../../utils/utils.js';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { TemporaryLimit } from '../../../services/network-modification-types';
import TemporaryLimitsTable from './temporary-limits-table';
import LimitsChart from './limitsChart';
import { CurrentTreeNode } from '../../graph/tree-node.type';
import { APPLICABILITY } from '../../network/constants';
import { LimitsPropertiesSideStack } from './limits-properties-side-stack';

export interface LimitsSidePaneProps {
    name?: string;
    permanentCurrentLimitPreviousValue: number | null | undefined;
    temporaryLimitsPreviousValues: TemporaryLimit[];
    applicabilityPreviousValue?: string;
    clearableFields: boolean | undefined;
    currentNode?: CurrentTreeNode;
    disabled: boolean;
}

export function LimitsSidePane({
    name,
    permanentCurrentLimitPreviousValue,
    temporaryLimitsPreviousValues,
    applicabilityPreviousValue,
    clearableFields,
    currentNode,
    disabled,
}: Readonly<LimitsSidePaneProps>) {
    const intl = useIntl();
    const { getValues, subscribe, trigger } = useFormContext();
    const limitsGroupFormName = useMemo((): string => `${name}.${CURRENT_LIMITS}`, [name]);
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
                clearable={!disabled && clearableFields}
                disabled={disabled}
            />
        ),
        [clearableFields, disabled, limitsGroupFormName, permanentCurrentLimitPreviousValue]
    );

    // Trigger all OLG_IS_DUPLICATE fields when change on applicability or name field
    useEffect(() => {
        const unsubscribeCallBack = subscribe({
            name: [`${name}.${APPLICABILITY_FIELD}`, `${name}.${NAME}`],
            formState: {
                values: true,
            },
            callback: ({ isSubmitted }) => {
                if (isSubmitted) {
                    const operationalLimitsGroups = getValues(`${LIMITS}.${OPERATIONAL_LIMITS_GROUPS}`);
                    for (let index = 0; index < operationalLimitsGroups?.length; index++) {
                        trigger(`${LIMITS}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${OLG_IS_DUPLICATE}`).then();
                    }
                }
            },
        });
        return () => unsubscribeCallBack();
    }, [trigger, subscribe, name, getValues]);

    const {
        fieldState: { error },
    } = useController({
        name: `${name}.${OLG_IS_DUPLICATE}`,
    });

    return (
        <Box sx={{ p: 2 }}>
            {name && (
                <Box>
                    <Grid
                        container
                        justifyContent="flex-start"
                        alignItems="stretch"
                        spacing={2}
                        sx={{ paddingBottom: '15px' }}
                    >
                        <Grid item xs={4}>
                            <TextInput
                                name={`${name}.${NAME}`}
                                label="name"
                                formProps={{ error: !!error?.message }}
                                disabled={disabled}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <SelectInput
                                label="Applicability"
                                options={Object.values(APPLICABILITY)}
                                name={`${name}.${APPLICABILITY_FIELD}`}
                                previousValue={applicabilityPreviousValue}
                                sx={{ flexGrow: 1 }}
                                disableClearable
                                size="small"
                                disabled={disabled}
                                formProps={{ error: !!error?.message }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            {PermanentLimitBox}
                        </Grid>
                    </Grid>
                    <ErrorInput InputField={FieldErrorAlert} name={`${name}.${OLG_IS_DUPLICATE}`} />
                </Box>
            )}
            <LimitsPropertiesSideStack name={`${name}.${LIMITS_PROPERTIES}`} disabled={disabled} />
            <Box>
                <LimitsChart
                    limitsGroupFormName={limitsGroupFormName}
                    previousPermanentLimit={permanentCurrentLimitPreviousValue}
                />
            </Box>

            <Box component={`h4`}>
                <FormattedMessage id="TemporaryCurrentLimitsText" />
            </Box>
            <TemporaryLimitsTable
                arrayFormName={`${limitsGroupFormName}.${TEMPORARY_LIMITS}`}
                createRow={createRows}
                columnsDefinition={columnsDefinition}
                previousValues={temporaryLimitsPreviousValues}
                getPreviousValue={getPreviousValue}
                isValueModified={isValueModified}
                disabled={disabled}
            />
        </Box>
    );
}
