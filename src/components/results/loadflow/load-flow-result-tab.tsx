/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl/lib';
import { LimitTypes, LoadFlowTabProps } from './load-flow-result.type';
import { LoadFlowResult } from './load-flow-result';
import { fetchLimitViolations, fetchLoadFlowResult } from '../../../services/study/loadflow';
import RunningStatus from 'components/utils/running-status';
import { AppState } from 'redux/reducer';
import ComputingType from 'components/computing-status/computing-type';
import { useSelector } from 'react-redux';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import {
    convertFilterValues,
    FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT,
    loadFlowCurrentViolationsColumnsDefinition,
    loadFlowResultColumnsDefinition,
    loadFlowVoltageViolationsColumnsDefinition,
    makeData,
    mappingFields,
    mappingTabs,
    useFetchFiltersEnums,
} from './load-flow-result-utils';
import { LimitViolationResult } from './limit-violation-result';
import { NumberCellRenderer, StatusCellRender } from '../common/result-cell-renderers';
import ResultsGlobalFilter from '../common/global-filter/results-global-filter';
import { mergeSx, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchAllCountries, fetchAllNominalVoltages } from '../../../services/study/network-map';
import { LOADFLOW_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import GlassPane from '../common/glass-pane';
import { FilterType as AgGridFilterType } from '../../../types/custom-aggrid-types';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { mapFieldsToColumnsFilter } from '../../../utils/aggrid-headers-utils';
import { loadflowResultInvalidations } from '../../computing-status/use-all-computing-status';
import { FilterType } from '../common/utils';
import { useNodeData } from 'components/use-node-data';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { GlobalFilter, GlobalFilters } from '../common/global-filter/global-filter-types';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';

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

export const LoadFlowResultTab: FunctionComponent<LoadFlowTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(0);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[LOADFLOW_RESULT_SORT_STORE][mappingTabs(tabIndex)]
    );

    const { filters } = useFilterSelector(AgGridFilterType.Loadflow, mappingTabs(tabIndex));

    const [countriesFilter, setCountriesFilter] = useState<GlobalFilter[]>([]);
    const [voltageLevelsFilter, setVoltageLevelsFilter] = useState<GlobalFilter[]>([]);

    const [globalFilter, setGlobalFilter] = useState<GlobalFilters>();

    const { loading: filterEnumsLoading, result: filterEnums } = useFetchFiltersEnums();

    // load countries
    useEffect(() => {
        fetchAllCountries(studyUuid, nodeUuid, currentRootNetworkUuid)
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

        fetchAllNominalVoltages(studyUuid, nodeUuid, currentRootNetworkUuid)
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
    }, [nodeUuid, studyUuid, currentRootNetworkUuid, snackError, loadFlowStatus]);

    const getGlobalFilterParameter = useCallback(
        (globalFilter: GlobalFilters | undefined) => {
            let shouldSentParameter = false;
            if (globalFilter) {
                if (
                    (globalFilter.countryCode && globalFilter.countryCode.length > 0) ||
                    (globalFilter.nominalV && globalFilter.nominalV.length > 0) ||
                    (globalFilter.genericFilter && globalFilter.genericFilter.length > 0)
                ) {
                    shouldSentParameter = true;
                }
            }
            if (!shouldSentParameter) {
                return undefined;
            }
            return {
                ...globalFilter,
                limitViolationsTypes:
                    tabIndex === 0 ? [LimitTypes.CURRENT] : [LimitTypes.HIGH_VOLTAGE, LimitTypes.LOW_VOLTAGE],
            };
        },
        [tabIndex]
    );

    const getEnumLabel = useCallback(
        (value: string) =>
            intl.formatMessage({
                id: value,
                defaultMessage: value,
            }),
        [intl]
    );

    const fetchLimitViolationsWithParameters = useCallback(() => {
        const limitTypeValues =
            tabIndex === 0 ? [LimitTypes.CURRENT] : [LimitTypes.HIGH_VOLTAGE, LimitTypes.LOW_VOLTAGE];
        const initialFilters = filters || [];
        let updatedFilters = convertFilterValues(initialFilters, intl);
        let limitTypeFilter = initialFilters.find((f) => f.column === 'limitType');

        // If 'limitType' filter does not exist or its value array is empty, add the default one
        if (!limitTypeFilter || !(limitTypeFilter.value as LimitTypes[]).length) {
            updatedFilters.push({
                column: 'limitType',
                dataType: FILTER_DATA_TYPES.TEXT,
                type: FILTER_TEXT_COMPARATORS.EQUALS,
                value: limitTypeValues,
            });
        }
        return fetchLimitViolations(studyUuid, nodeUuid, currentRootNetworkUuid, {
            sort: sortConfig.map((sort) => ({
                ...sort,
                colId: FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT[sort.colId],
            })),
            filters: mapFieldsToColumnsFilter(updatedFilters, mappingFields(tabIndex)),
            globalFilters: getGlobalFilterParameter(globalFilter),
        });
    }, [
        tabIndex,
        filters,
        intl,
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        sortConfig,
        getGlobalFilterParameter,
        globalFilter,
    ]);

    const fetchloadflowResultWithParameters = useCallback(() => {
        return fetchLoadFlowResult(studyUuid, nodeUuid, currentRootNetworkUuid, {
            sort: sortConfig,
            filters,
        });
    }, [studyUuid, nodeUuid, currentRootNetworkUuid, sortConfig, filters]);

    const fetchResult = useMemo(() => {
        if (tabIndex === 0 || tabIndex === 1) {
            return fetchLimitViolationsWithParameters;
        } else if (tabIndex === 2) {
            return fetchloadflowResultWithParameters;
        }
    }, [tabIndex, fetchLimitViolationsWithParameters, fetchloadflowResultWithParameters]);

    const [loadflowResult, isLoadingResult, setResult] = useNodeData(
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        fetchResult,
        loadflowResultInvalidations
    );

    const loadFlowLimitViolationsColumns = useMemo(() => {
        switch (tabIndex) {
            case 0:
                return loadFlowCurrentViolationsColumnsDefinition(intl, filterEnums, getEnumLabel, tabIndex);
            case 1:
                return loadFlowVoltageViolationsColumnsDefinition(intl, filterEnums, getEnumLabel, tabIndex);
            case 2:
                return loadFlowResultColumnsDefinition(
                    intl,
                    filterEnums,
                    getEnumLabel,
                    tabIndex,
                    StatusCellRender,
                    NumberCellRenderer
                );

            default:
                return [];
        }
    }, [tabIndex, intl, filterEnums, getEnumLabel]);

    const resetResultStates = useCallback(() => {
        setResult(null);
    }, [setResult]);

    const handleTabChange = (_event: SyntheticEvent, newTabIndex: number) => {
        resetResultStates();
        setTabIndex(newTabIndex);
    };

    const handleGlobalFilterChange = useCallback((value: GlobalFilter[]) => {
        let newGlobalFilter: GlobalFilters = {};
        if (value) {
            const nominalVs = new Set(
                value
                    .filter((filter: GlobalFilter) => filter.filterType === FilterType.VOLTAGE_LEVEL)
                    .map((filter: GlobalFilter) => filter.label)
            );
            const genericFilters: Set<string> = new Set(
                value
                    .filter((filter: GlobalFilter): boolean => filter.filterType === FilterType.GENERIC_FILTER)
                    .map((filter: GlobalFilter) => filter.uuid ?? '')
                    .filter((uuid: string): boolean => uuid !== '')
            );
            const countryCodes = new Set(
                value
                    .filter((filter: GlobalFilter) => filter.filterType === FilterType.COUNTRY)
                    .map((filter: GlobalFilter) => filter.label)
            );
            newGlobalFilter.nominalV = [...nominalVs];
            newGlobalFilter.countryCode = [...countryCodes];
            newGlobalFilter.genericFilter = [...genericFilters];
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

    const getFilterableEquipmentTypes = useCallback(() => {
        switch (tabIndex) {
            case 0:
                return [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER, EQUIPMENT_TYPES.LINE];
            case 1:
                return [EQUIPMENT_TYPES.VOLTAGE_LEVEL];
        }
        return [];
    }, [tabIndex]);

    return (
        <>
            <Box sx={styles.flexWrapper}>
                <Tabs value={tabIndex} onChange={handleTabChange} sx={styles.flexElement}>
                    <Tab label={<FormattedMessage id={'LoadFlowResultsCurrentViolations'} />} />
                    <Tab label={<FormattedMessage id={'LoadFlowResultsVoltageViolations'} />} />
                    <Tab label={<FormattedMessage id={'LoadFlowResultsStatus'} />} />
                    <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} />
                </Tabs>
                <Box sx={mergeSx(styles.flexElement, tabIndex === 0 || tabIndex === 1 ? styles.show : styles.hide)}>
                    <ResultsGlobalFilter
                        onChange={handleGlobalFilterChange}
                        filters={[...voltageLevelsFilter, ...countriesFilter]}
                        filterableEquipmentTypes={getFilterableEquipmentTypes()}
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
                (loadFlowStatus === RunningStatus.SUCCEED || loadFlowStatus === RunningStatus.FAILED) && (
                    <ComputationReportViewer reportType={ComputingType.LOAD_FLOW} />
                )}
        </>
    );
};
