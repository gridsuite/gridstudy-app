/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ChangeEvent,
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { AppState } from '../../../redux/reducer';
import { Box, LinearProgress, MenuItem, Select, Tab, Tabs } from '@mui/material';
import { fetchSecurityAnalysisResult } from '../../../services/study/security-analysis';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { ComputingType, type MuiStyles, PARAM_DEVELOPER_MODE } from '@gridsuite/commons-ui';
import { SecurityAnalysisResultN } from './security-analysis-result-n';
import { SecurityAnalysisResultNmk } from './security-analysis-result-nmk';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { QueryParamsType, SecurityAnalysisTabProps } from './security-analysis.type';
import {
    convertFilterValues,
    getStoreFields,
    mappingColumnToField,
    NMK_TYPE,
    RESULT_TYPE,
    useFetchFiltersEnums,
} from './security-analysis-result-utils';
import {
    FilterType as AgGridFilterType,
    PaginationType,
    SecurityAnalysisTab,
} from '../../../types/custom-aggrid-types';
import { SecurityAnalysisExportButton } from './security-analysis-export-button';
import { useSecurityAnalysisColumnsDefs } from './use-security-analysis-column-defs';
import { SECURITY_ANALYSIS_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import { mapFieldsToColumnsFilter } from '../../../utils/aggrid-headers-utils';
import { securityAnalysisResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { useNodeData } from 'components/use-node-data';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { useGlobalFilterOptions } from '../common/global-filter/use-global-filter-options';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { usePaginationSelector } from 'hooks/use-pagination-selector';
import { useComputationGlobalFilters } from '../../../hooks/use-computation-global-filters';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { GlobalFilter } from '../common/global-filter/global-filter-types';
import { buildValidGlobalFilters } from '../common/global-filter/build-valid-global-filters';

const styles = {
    tabsAndToolboxContainer: {
        display: 'flex',
        position: 'relative',
        justifyContent: 'space-between',
    },
    toolboxContainer: {
        display: 'flex',
        gap: 2,
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    nmkResultSelect: {
        position: 'absolute',
        right: '16px',
    },
    loader: {
        height: '4px',
    },
    resultContainer: {
        flexGrow: 1,
    },
} as const satisfies MuiStyles;

const N_RESULTS_TAB_INDEX = 0;
const NMK_RESULTS_TAB_INDEX = 1;
const LOGS_TAB_INDEX = 2;

export const SecurityAnalysisResultTab: FunctionComponent<SecurityAnalysisTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const intl = useIntl();
    const [isDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [tabIndex, setTabIndex] = useState(isDeveloperMode ? N_RESULTS_TAB_INDEX : NMK_RESULTS_TAB_INDEX);
    const tabIndexRef = useRef<number>(null);
    tabIndexRef.current = tabIndex;
    const [nmkType, setNmkType] = useState(NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES);
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        if (!isDeveloperMode && tabIndexRef.current === N_RESULTS_TAB_INDEX) {
            // handle tabIndex when dev mode is disabled
            setTabIndex(NMK_RESULTS_TAB_INDEX);
        }
    }, [isDeveloperMode]);
    const securityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const resultType = useMemo(() => {
        if (isDeveloperMode && tabIndex === N_RESULTS_TAB_INDEX) {
            return RESULT_TYPE.N;
        } else if (nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES) {
            return RESULT_TYPE.NMK_CONTINGENCIES;
        } else {
            return RESULT_TYPE.NMK_LIMIT_VIOLATIONS;
        }
    }, [tabIndex, nmkType, isDeveloperMode]);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SECURITY_ANALYSIS_RESULT_SORT_STORE][getStoreFields(tabIndex)]
    );

    const { pagination, dispatchPagination } = usePaginationSelector(
        PaginationType.SecurityAnalysis,
        getStoreFields(tabIndex) as SecurityAnalysisTab
    );
    const { page, rowsPerPage } = pagination;

    const { filters } = useFilterSelector(AgGridFilterType.SecurityAnalysis, getStoreFields(tabIndex));
    const { globalFiltersFromState, updateGlobalFilters } = useComputationGlobalFilters(
        AgGridFilterType.SecurityAnalysis
    );
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();

    const globalFilterOptions = useMemo(
        () => [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter],
        [voltageLevelsFilter, countriesFilter, propertiesFilter]
    );

    const goToFirstPage = useCallback(() => {
        dispatchPagination({ ...pagination, page: 0 });
    }, [pagination, dispatchPagination]);

    const handleGlobalFilterChangeAndUpdate = useCallback(
        (newFilters: GlobalFilter[]) => {
            updateGlobalFilters(newFilters);
        },
        [updateGlobalFilters]
    );

    const fetchSecurityAnalysisResultWithQueryParams = useCallback(
        (studyUuid: string, nodeUuid: string) => {
            if (tabIndex === LOGS_TAB_INDEX) {
                return Promise.resolve();
            }

            const queryParams: QueryParamsType = {
                resultType,
            };

            if (tabIndex === NMK_RESULTS_TAB_INDEX) {
                queryParams['page'] = page;
                queryParams['size'] = rowsPerPage as number;
            }

            if (sortConfig?.length) {
                const columnToFieldMapping = mappingColumnToField(resultType);
                queryParams['sort'] = sortConfig.map((sort) => ({
                    ...sort,
                    colId: columnToFieldMapping[sort.colId],
                }));
            }

            if (filters) {
                const updatedFilters = convertFilterValues(intl, filters);
                const columnToFieldMapping = mappingColumnToField(resultType);
                queryParams['filters'] = mapFieldsToColumnsFilter(updatedFilters, columnToFieldMapping);
            }
            const globalFilters = buildValidGlobalFilters(globalFiltersFromState);
            if (globalFilters) {
                queryParams['globalFilters'] = globalFilters;
            }

            return fetchSecurityAnalysisResult(studyUuid, nodeUuid, currentRootNetworkUuid, queryParams);
        },

        [
            tabIndex,
            resultType,
            sortConfig,
            filters,
            globalFiltersFromState,
            currentRootNetworkUuid,
            page,
            rowsPerPage,
            intl,
        ]
    );

    const {
        result,
        isLoading: isLoadingResult,
        setResult,
    } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid: currentRootNetworkUuid,
        fetcher: fetchSecurityAnalysisResultWithQueryParams,
        invalidations: securityAnalysisResultInvalidations,
    });

    const resetResultStates = useCallback(() => {
        setResult(null);
        setCount(0);
    }, [setResult]);

    const handleChangeNmkType = () => {
        dispatchPagination({ page: 0, rowsPerPage });
        resetResultStates();
        setNmkType(
            nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                ? NMK_TYPE.CONTINGENCIES_FROM_CONSTRAINTS
                : NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
        );
    };

    const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
        resetResultStates();
        setTabIndex(newTabIndex);
    };

    // Pagination, sort and filter
    const handleChangePage = useCallback(
        (_: React.MouseEvent<HTMLButtonElement> | null, selectedPage: number) => {
            dispatchPagination({ ...pagination, page: selectedPage });
        },
        [pagination, dispatchPagination]
    );

    const handleChangeRowsPerPage = useCallback(
        (event: ChangeEvent<{ value: string }>) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            dispatchPagination({ page: 0, rowsPerPage: newRowsPerPage });
        },
        [dispatchPagination]
    );

    const { loading: filterEnumsLoading, result: filterEnums } = useFetchFiltersEnums();

    useEffect(() => {
        if (result && tabIndexRef.current === NMK_RESULTS_TAB_INDEX) {
            setCount(result.totalElements);
        }
    }, [result]);

    const shouldOpenLoader = useOpenLoaderShortWait({
        isLoading: securityAnalysisStatus === RunningStatus.RUNNING || isLoadingResult,
        delay: RESULTS_LOADING_DELAY,
    });

    const columnDefs = useSecurityAnalysisColumnsDefs(filterEnums, resultType, tabIndex, goToFirstPage);

    const csvHeaders = useMemo(() => columnDefs.map((cDef) => cDef.headerName ?? ''), [columnDefs]);

    const isExportButtonDisabled =
        // results not ready yet
        securityAnalysisStatus !== RunningStatus.SUCCEED ||
        isLoadingResult ||
        // no result yet
        !result ||
        // empty paged result
        (result.content && result.content.length === 0) ||
        // empty array result
        result.length === 0;

    const filterableEquipmentTypes: EQUIPMENT_TYPES[] = useMemo(() => {
        if (tabIndex === NMK_RESULTS_TAB_INDEX) {
            return [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER, EQUIPMENT_TYPES.LINE];
        }
        return [];
    }, [tabIndex]);

    return (
        <>
            <Box sx={styles.tabsAndToolboxContainer}>
                <Box sx={styles.tabs}>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        {isDeveloperMode && <Tab label="N" value={N_RESULTS_TAB_INDEX} />}
                        <Tab label="N-K" value={NMK_RESULTS_TAB_INDEX} />
                        <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} value={LOGS_TAB_INDEX} />
                    </Tabs>
                </Box>
                {(tabIndex === NMK_RESULTS_TAB_INDEX || (tabIndex === N_RESULTS_TAB_INDEX && isDeveloperMode)) && (
                    <Box sx={{ display: 'flex', flexGrow: 0 }}>
                        <GlobalFilterSelector
                            onChange={handleGlobalFilterChangeAndUpdate}
                            filters={globalFilterOptions}
                            filterableEquipmentTypes={filterableEquipmentTypes}
                            disableGenericFilters={tabIndex === N_RESULTS_TAB_INDEX}
                            preloadedGlobalFilters={globalFiltersFromState}
                            genericFiltersStrictMode={true}
                        />
                    </Box>
                )}
                <Box sx={styles.toolboxContainer}>
                    {tabIndex === NMK_RESULTS_TAB_INDEX && (
                        <Select
                            labelId="nmk-type-label"
                            value={nmkType}
                            onChange={handleChangeNmkType}
                            autoWidth={true}
                            size="small"
                        >
                            <MenuItem value={NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES}>
                                <FormattedMessage id="ConstraintsFromContingencies" />
                            </MenuItem>
                            <MenuItem value={NMK_TYPE.CONTINGENCIES_FROM_CONSTRAINTS}>
                                <FormattedMessage id="ContingenciesFromConstraints" />
                            </MenuItem>
                        </Select>
                    )}
                    {(tabIndex === NMK_RESULTS_TAB_INDEX || (tabIndex === N_RESULTS_TAB_INDEX && isDeveloperMode)) && (
                        <SecurityAnalysisExportButton
                            studyUuid={studyUuid}
                            nodeUuid={nodeUuid}
                            rootNetworkUuid={currentRootNetworkUuid}
                            csvHeaders={csvHeaders}
                            resultType={resultType}
                            disabled={isExportButtonDisabled}
                        />
                    )}
                </Box>
            </Box>
            <Box sx={styles.loader}>{shouldOpenLoader && <LinearProgress />}</Box>
            <Box sx={styles.resultContainer}>
                {tabIndex === N_RESULTS_TAB_INDEX && isDeveloperMode && (
                    <SecurityAnalysisResultN
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={columnDefs}
                        filters={filters}
                    />
                )}
                {tabIndex === NMK_RESULTS_TAB_INDEX && (
                    <SecurityAnalysisResultNmk
                        result={result}
                        isLoadingResult={isLoadingResult || filterEnumsLoading}
                        isFromContingency={nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES}
                        paginationProps={{
                            count,
                            rowsPerPage: rowsPerPage as number,
                            page,
                            onPageChange: handleChangePage,
                            onRowsPerPageChange: handleChangeRowsPerPage,
                        }}
                        columnDefs={columnDefs}
                        filters={filters}
                    />
                )}
                {tabIndex === LOGS_TAB_INDEX &&
                    (securityAnalysisStatus === RunningStatus.SUCCEED ||
                        securityAnalysisStatus === RunningStatus.FAILED) && (
                        <ComputationReportViewer reportType={ComputingType.SECURITY_ANALYSIS} />
                    )}
            </Box>
        </>
    );
};
