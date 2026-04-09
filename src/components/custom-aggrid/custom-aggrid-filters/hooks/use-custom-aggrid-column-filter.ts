/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from '@mui/material';
import { computeTolerance } from '../utils/filter-tolerance-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
    FilterConfig,
    FilterData,
    FilterParams,
    TableType,
} from '../../../../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer.type';
import { getColumnFiltersFromState } from '../../../../redux/selectors/filter-selectors';
import { persistSpreadsheetColumnFilters } from '../../../spreadsheet-view/columns/utils/persist-spreadsheet-column-filters';
import type { UUID } from 'node:crypto';
import { updateColumnFiltersAction } from '../../../../redux/actions';

import { persistComputationColumnFilters } from '../../../results/common/column-filter/persist-computation-column-filters';

const removeElementFromArrayWithFieldValue = (filtersArrayToRemoveFieldValueFrom: FilterConfig[], field: string) => {
    return filtersArrayToRemoveFieldValueFrom.filter((f) => f.column !== field);
};

const changeValueFromArrayWithFieldValue = (
    filtersArrayToModify: FilterConfig[],
    field: string,
    newData: FilterConfig
) => {
    const filterIndex = filtersArrayToModify.findIndex((f) => f.column === field);
    if (filterIndex === -1) {
        return [...filtersArrayToModify, newData];
    } else {
        const updatedArray = [...filtersArrayToModify];
        updatedArray[filterIndex] = newData;
        return updatedArray;
    }
};

const EMPTY_ARRAY: FilterConfig[] = [];

export const useCustomAggridColumnFilter = (
    colId: string,
    { type, tab, dataType, comparators = [], debounceMs = 1000 }: FilterParams
) => {
    const [selectedFilterComparator, setSelectedFilterComparator] = useState<string>('');
    const [selectedFilterData, setSelectedFilterData] = useState<unknown>();
    const [tolerance, setTolerance] = useState<number | undefined>();

    // Track if user is currently editing to prevent external sync from overriding input
    const isEditingRef = useRef(false);

    const { snackError } = useSnackMessage();
    const dispatch = useDispatch();
    const filters = useSelector<AppState, FilterConfig[]>(
        (state) => getColumnFiltersFromState(state, type, tab) ?? EMPTY_ARRAY
    );
    const studyUuid = useSelector<AppState, AppState['studyUuid']>((state) => state.studyUuid);
    const tableDefinitions = useSelector<AppState, AppState['tables']['definitions']>(
        (state) => state.tables.definitions
    );
    const colDef = useMemo(
        () => tableDefinitions.find((t) => t.uuid === tab)?.columns?.find((col) => col.id === colId),
        [tableDefinitions, tab, colId]
    );

    const updateFilter = useCallback(
        (data: FilterData): void => {
            if (!studyUuid) {
                return;
            }

            const newFilter = {
                column: colId,
                dataType: data.dataType,
                tolerance:
                    data.dataType === FILTER_DATA_TYPES.NUMBER &&
                    data.type !== FILTER_TEXT_COMPARATORS.IS_EMPTY &&
                    data.type !== FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY
                        ? computeTolerance(data.value)
                        : undefined,
                type: data.type,
                value: data.value,
            };

            let updatedFilters: FilterConfig[];
            const filterWithoutValue =
                data.type === FILTER_TEXT_COMPARATORS.IS_EMPTY || data.type === FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY;
            if (!data.value && !filterWithoutValue) {
                updatedFilters = removeElementFromArrayWithFieldValue(filters, colId);
            } else {
                updatedFilters = changeValueFromArrayWithFieldValue(filters, colId, newFilter);
            }

            const onError = (error: unknown) => snackWithFallback(snackError, error);

            // Data flow for logs table is: update redux state -> useEffect -> update hook state
            if (type === TableType.Logs) {
                dispatch(updateColumnFiltersAction(TableType.Logs, tab, updatedFilters));
            }
            // Data flow for spreadsheet / computation tables is: update backend database -> notification -> update redux state -> useEffect -> update hook state
            else if (type === TableType.Spreadsheet) {
                persistSpreadsheetColumnFilters(studyUuid, tab as UUID, colDef, updatedFilters, onError);
            } else {
                persistComputationColumnFilters(studyUuid, type, tab, colId, updatedFilters, onError);
            }
        },
        [studyUuid, colId, type, filters, snackError, tab, dispatch, colDef]
    );

    // We intentionally exclude `updateFilter` from dependencies.
    // `updateFilter` depends on `filters`, which changes on every filter update.
    // Including it would recreate the debounced function on each change,
    // canceling any pending debounced call and preventing updates from being sent.
    // PS: it only works because most of the props never change...
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdateFilter = useCallback(
        debounce((data) => {
            updateFilter(data);
            isEditingRef.current = false;
        }, debounceMs),
        [debounceMs]
    );

    const handleChangeFilterValue = useCallback(
        (filterData: FilterData) => {
            isEditingRef.current = true;

            setSelectedFilterData(filterData.value);
            setTolerance(filterData.tolerance);
            debouncedUpdateFilter({
                value: filterData.value,
                type: filterData.type ?? selectedFilterComparator,
                dataType,
                tolerance: filterData.tolerance,
            });
        },
        [dataType, debouncedUpdateFilter, selectedFilterComparator]
    );

    const handleChangeComparator = useCallback(
        (newType: string) => {
            isEditingRef.current = true;
            setSelectedFilterComparator(newType);
            const filterWithoutValue =
                newType === FILTER_TEXT_COMPARATORS.IS_EMPTY || newType === FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY;
            if (filterWithoutValue) {
                debouncedUpdateFilter({
                    value: true,
                    type: newType,
                    dataType,
                    tolerance: tolerance,
                });
            } else if (selectedFilterData && selectedFilterData !== true) {
                debouncedUpdateFilter({
                    value: selectedFilterData,
                    type: newType,
                    dataType,
                    tolerance: tolerance,
                });
            } else {
                // We switch from IS_EMPTY or IS_NOT_EMPTY comparator to a comparator with a value
                setSelectedFilterData(undefined);
                debouncedUpdateFilter({
                    value: undefined,
                    type: newType,
                    dataType,
                    tolerance: tolerance,
                });
            }
        },
        [dataType, selectedFilterData, tolerance, debouncedUpdateFilter]
    );

    useEffect(() => {
        if (!selectedFilterComparator && comparators.length > 0) {
            setSelectedFilterComparator(comparators[0]);
        }
    }, [selectedFilterComparator, comparators]);

    // Sync from external filter changes (Redux store)
    // Only sync when NOT actively editing to prevent race conditions
    useEffect(() => {
        // Skip sync if user is currently editing
        if (isEditingRef.current) {
            return;
        }

        const filterObject = filters?.find((filter) => filter.column === colId);

        if (filterObject) {
            setSelectedFilterData(filterObject.value);
            setSelectedFilterComparator(filterObject.type ?? '');
        } else {
            setSelectedFilterData(undefined);
        }
    }, [filters, colId]);

    return {
        selectedFilterData,
        selectedFilterComparator,
        handleChangeFilterValue,
        handleChangeComparator,
    };
};
