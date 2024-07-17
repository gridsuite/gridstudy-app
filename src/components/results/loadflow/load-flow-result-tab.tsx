/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl/lib';
import { LimitTypes, LoadFlowTabProps } from './load-flow-result.type';
import { LoadFlowResult } from './load-flow-result';
import { useNodeData } from '../../study-container';
import {
    fetchLimitViolations,
    fetchLoadFlowResult,
} from '../../../services/study/loadflow';
import { REPORT_TYPES } from 'components/utils/report-type';
import RunningStatus from 'components/utils/running-status';
import { ReduxState } from 'redux/reducer.type';
import ComputingType from 'components/computing-status/computing-type';
import { useSelector } from 'react-redux';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { SortConfigType, useAgGridSort } from 'hooks/use-aggrid-sort';
import { useAggridRowFilter } from 'hooks/use-aggrid-row-filter';
import {
    FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT,
    loadFlowCurrentViolationsColumnsDefinition,
    loadFlowResultColumnsDefinition,
    loadFlowVoltageViolationsColumnsDefinition,
    makeData,
    mappingFields,
    mappingTabs,
    convertFilterValues,
    useFetchFiltersEnums,
} from './load-flow-result-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
} from 'components/custom-aggrid/custom-aggrid-header.type';
import { LimitViolationResult } from './limit-violation-result';
import { mapFieldsToColumnsFilter } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { setLoadflowResultFilter, setLoadflowResultSort } from 'redux/actions';
import {
    NumberCellRenderer,
    StatusCellRender,
} from '../common/result-cell-renderers';
import ResultsGlobalFilter, {
    Filter,
    FilterType,
} from '../common/results-global-filter';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    fetchAllCountries,
    fetchAllNominalVoltages,
} from '../../../services/study/network-map';
import { LOADFLOW_RESULT_STORE_FIELD } from 'utils/store-filter-fields';
import GlassPane from '../common/glass-pane';
import { mergeSx } from '../../utils/functions';

const styles = {
    flexWrapper: {
        display: 'flex',
    },
    flexElement: {
        flexGrow: 0,
    },
    show: {
        display: 'inherit',
    },
    hide: {
        display: 'none',
    },
    emptySpace: {
        flexGrow: 1,
    },
};

export interface GlobalFilter {
    nominalV?: string[];
    countryCode?: string[];
    limitViolationsTypes?: LimitTypes[];
}

export const LoadFlowResultTab: FunctionComponent<LoadFlowTabProps> = ({
    studyUuid,
    nodeUuid,
}) => {
    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const loadflowResultInvalidations = ['loadflowResult'];

    const [tabIndex, setTabIndex] = useState(0);
    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOAD_FLOW]
    );

    const sortConfigType = useSelector(
        (state: ReduxState) => state.loadflowResultSort[mappingTabs(tabIndex)]
    );

    const { onSortChanged, initSort } = useAgGridSort(
        sortConfigType,
        setLoadflowResultSort,
        mappingTabs(tabIndex)
    );

    const { updateFilter, filterSelector } = useAggridRowFilter({
        filterType: LOADFLOW_RESULT_STORE_FIELD,
        filterTab: mappingTabs(tabIndex),
        filterStoreAction: setLoadflowResultFilter,
    });

    const [countriesFilter, setCountriesFilter] = useState<Filter[]>([]);
    const [voltageLevelsFilter, setVoltageLevelsFilter] = useState<Filter[]>(
        []
    );

    const [globalFilter, setGlobalFilter] = useState<GlobalFilter>();

    const { loading: filterEnumsLoading, result: filterEnums } =
        useFetchFiltersEnums();

    // load countries
    useEffect(() => {
        fetchAllCountries(studyUuid, nodeUuid)
            .then((countryCodes) => {
                setCountriesFilter(
                    countryCodes.map((countryCode: string) => ({
                        label: countryCode,
                        filterType: FilterType.COUNTRY,
                    }))
                );
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'FetchCountryError',
                });
            });
        fetchAllNominalVoltages(studyUuid, nodeUuid)
            .then((nominalVoltages) => {
                setVoltageLevelsFilter(
                    nominalVoltages.map((nominalV: number) => ({
                        label: nominalV.toString(),
                        filterType: FilterType.VOLTAGE_LEVEL,
                    }))
                );
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'FetchNominalVoltagesError',
                });
            });
    }, [nodeUuid, studyUuid, snackError, loadFlowStatus]);

    const getGlobalFilterParameter = useCallback(
        (globalFilter: GlobalFilter | undefined) => {
            let shouldSentParameter = false;
            if (globalFilter) {
                if (
                    globalFilter.countryCode &&
                    globalFilter.countryCode.length > 0
                ) {
                    shouldSentParameter = true;
                }
                if (globalFilter.nominalV && globalFilter.nominalV.length > 0) {
                    shouldSentParameter = true;
                }
            }
            if (!shouldSentParameter) {
                return undefined;
            }
            return {
                ...globalFilter,
                limitViolationsTypes:
                    tabIndex === 0
                        ? [LimitTypes.CURRENT]
                        : [LimitTypes.HIGH_VOLTAGE, LimitTypes.LOW_VOLTAGE],
            };
        },
        [tabIndex]
    );

    const fetchLimitViolationsWithParameters = useCallback(() => {
        const limitTypeValues =
            tabIndex === 0
                ? [LimitTypes.CURRENT]
                : [LimitTypes.HIGH_VOLTAGE, LimitTypes.LOW_VOLTAGE];
        const initialFilters = filterSelector || [];
        let updatedFilters = convertFilterValues(initialFilters, intl);
        let limitTypeFilter = initialFilters.find(
            (f) => f.column === 'limitType'
        );

        // If 'limitType' filter does not exist or its value array is empty, add the default one
        if (
            !limitTypeFilter ||
            !(limitTypeFilter.value as LimitTypes[]).length
        ) {
            updatedFilters.push({
                column: 'limitType',
                dataType: FILTER_DATA_TYPES.TEXT,
                type: FILTER_TEXT_COMPARATORS.EQUALS,
                value: limitTypeValues,
            });
        }
        return fetchLimitViolations(studyUuid, nodeUuid, {
            sort: sortConfigType.map((sort: SortConfigType) => ({
                ...sort,
                colId: FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT[sort.colId],
            })),
            filters: mapFieldsToColumnsFilter(
                updatedFilters,
                mappingFields(tabIndex)
            ),
            globalFilters: getGlobalFilterParameter(globalFilter),
        });
    }, [
        studyUuid,
        nodeUuid,
        sortConfigType,
        filterSelector,
        tabIndex,
        globalFilter,
        getGlobalFilterParameter,
        intl,
    ]);

    const fetchloadflowResultWithParameters = useCallback(() => {
        return fetchLoadFlowResult(studyUuid, nodeUuid, {
            sort: sortConfigType,
            filters: filterSelector,
        });
    }, [studyUuid, nodeUuid, sortConfigType, filterSelector]);

    const fetchResult = useMemo(() => {
        if (tabIndex === 0 || tabIndex === 1) {
            return fetchLimitViolationsWithParameters;
        } else if (tabIndex === 2) {
            return fetchloadflowResultWithParameters;
        }
    }, [
        tabIndex,
        fetchLimitViolationsWithParameters,
        fetchloadflowResultWithParameters,
    ]);

    const [loadflowResult, isLoadingResult, setResult] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchResult,
        loadflowResultInvalidations
    );

    const loadFlowLimitViolationsColumns = useMemo(() => {
        switch (tabIndex) {
            case 0:
                return loadFlowCurrentViolationsColumnsDefinition(
                    intl,
                    { onSortChanged, sortConfig: sortConfigType },
                    { updateFilter, filterSelector },
                    filterEnums
                );
            case 1:
                return loadFlowVoltageViolationsColumnsDefinition(
                    intl,
                    { onSortChanged, sortConfig: sortConfigType },
                    { updateFilter, filterSelector },
                    filterEnums
                );
            case 2:
                return loadFlowResultColumnsDefinition(
                    intl,
                    { onSortChanged, sortConfig: sortConfigType },
                    { updateFilter, filterSelector },
                    filterEnums,
                    StatusCellRender,
                    NumberCellRenderer
                );

            default:
                return [];
        }
    }, [
        filterEnums,
        filterSelector,
        intl,
        onSortChanged,
        sortConfigType,
        updateFilter,
        tabIndex,
    ]);

    const resetResultStates = useCallback(() => {
        setResult(null);
        if (initSort) {
            initSort(sortConfigType);
        }
    }, [initSort, setResult, sortConfigType]);

    const handleTabChange = (_event: SyntheticEvent, newTabIndex: number) => {
        resetResultStates();
        setTabIndex(newTabIndex);
    };

    const handleGlobalFilterChange = useCallback((value: Filter[]) => {
        let newGlobalFilter: GlobalFilter = {};
        if (value) {
            const nominalVs = new Set(
                value
                    .filter(
                        (filter: Filter) =>
                            filter.filterType === FilterType.VOLTAGE_LEVEL
                    )
                    .map((filter: Filter) => filter.label)
            );
            const countryCodes = new Set(
                value
                    .filter(
                        (filter: Filter) =>
                            filter.filterType === FilterType.COUNTRY
                    )
                    .map((filter: Filter) => filter.label)
            );
            newGlobalFilter.nominalV = [...nominalVs];
            newGlobalFilter.countryCode = [...countryCodes];
        }
        setGlobalFilter(newGlobalFilter);
    }, []);

    const result = useMemo(() => {
        if (loadflowResult === RunningStatus.FAILED || !loadflowResult) {
            return [];
        }
        if (tabIndex === 0 || tabIndex === 1) {
            return makeData(loadflowResult, intl);
        }
        return loadflowResult;
    }, [tabIndex, loadflowResult, intl]);

    return (
        <>
            <Box sx={styles.flexWrapper}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    sx={styles.flexElement}
                >
                    <Tab
                        label={
                            <FormattedMessage
                                id={'LoadFlowResultsCurrentViolations'}
                            />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage
                                id={'LoadFlowResultsVoltageViolations'}
                            />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage id={'LoadFlowResultsStatus'} />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage id={'ComputationResultsLogs'} />
                        }
                    />
                </Tabs>
                <Box
                    sx={mergeSx(
                        styles.flexElement,
                        tabIndex === 0 || tabIndex === 1
                            ? styles.show
                            : styles.hide
                    )}
                >
                    <ResultsGlobalFilter
                        onChange={handleGlobalFilterChange}
                        filters={[...countriesFilter, ...voltageLevelsFilter]}
                    />
                </Box>
                <Box sx={styles.emptySpace}></Box>
            </Box>

            {tabIndex === 0 && (
                <GlassPane active={isLoadingResult}>
                    <LimitViolationResult
                        result={result}
                        isLoadingResult={isLoadingResult || filterEnumsLoading}
                        columnDefs={loadFlowLimitViolationsColumns}
                        tableName={intl.formatMessage({
                            id: 'LoadFlowResultsCurrentViolations',
                        })}
                    />
                </GlassPane>
            )}
            {tabIndex === 1 && (
                <GlassPane active={isLoadingResult}>
                    <LimitViolationResult
                        result={result}
                        isLoadingResult={isLoadingResult || filterEnumsLoading}
                        columnDefs={loadFlowLimitViolationsColumns}
                        tableName={intl.formatMessage({
                            id: 'LoadFlowResultsVoltageViolations',
                        })}
                    />
                </GlassPane>
            )}
            {tabIndex === 2 && (
                <LoadFlowResult
                    result={result}
                    isLoadingResult={isLoadingResult || filterEnumsLoading}
                    columnDefs={loadFlowLimitViolationsColumns}
                    tableName={intl.formatMessage({
                        id: 'LoadFlowResultsStatus',
                    })}
                />
            )}
            {tabIndex === 3 &&
                (loadFlowStatus === RunningStatus.SUCCEED ||
                    loadFlowStatus === RunningStatus.FAILED) && (
                    <ComputationReportViewer
                        reportType={REPORT_TYPES.LOAD_FLOW}
                    />
                )}
        </>
    );
};
