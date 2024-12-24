/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SyntheticEvent, FunctionComponent, useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { AppState } from '../../../redux/reducer';

import { Tabs, Tab, Select, MenuItem, LinearProgress, Box } from '@mui/material';
import { fetchSecurityAnalysisResult } from '../../../services/study/security-analysis';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { ComputingType } from '../../computing-status/computing-type';
import { SecurityAnalysisResultN } from './security-analysis-result-n';
import { SecurityAnalysisResultNmk } from './security-analysis-result-nmk';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { QueryParamsType, SecurityAnalysisTabProps } from './security-analysis.type';
import {
    DEFAULT_PAGE_COUNT,
    NMK_TYPE,
    RESULT_TYPE,
    useFetchFiltersEnums,
    SECURITY_ANALYSIS_RESULT_INVALIDATIONS,
    mappingColumnToField,
    getStoreFields,
    convertFilterValues,
} from './security-analysis-result-utils';
import { useNodeData } from '../../study-container';
import { useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useAggridRowFilter } from '../../../hooks/use-aggrid-row-filter';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { SecurityAnalysisExportButton } from './security-analysis-export-button';
import { useSecurityAnalysisColumnsDefs } from './use-security-analysis-column-defs';
import { mapFieldsToColumnsFilter } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { setSecurityAnalysisResultFilter } from 'redux/actions';
import {
    SECURITY_ANALYSIS_RESULT_SORT_STORE,
    SECURITY_ANALYSIS_RESULT_STORE_FIELD,
} from 'utils/store-sort-filter-fields';
import { useIntl } from 'react-intl/lib';
import { useParameterState } from 'components/dialogs/parameters/parameters';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { usePrevious } from 'components/utils/utils';

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
};

export const SecurityAnalysisResultTab: FunctionComponent<SecurityAnalysisTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    openVoltageLevelDiagram,
}) => {
    const intl = useIntl();
    const [tabIndex, setTabIndex] = useState(0);
    const [nmkType, setNmkType] = useState(NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES);
    const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_PAGE_COUNT as number);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);

    const N_RESULTS_TAB_INDEX = 0;
    const NMK_RESULTS_TAB_INDEX = 1;
    const LOGS_TAB_INDEX = 2;
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const previousEnableDeveloperMode = usePrevious(enableDeveloperMode);

    useEffect(() => {
        if (previousEnableDeveloperMode !== undefined) {
            if (!enableDeveloperMode && previousEnableDeveloperMode !== enableDeveloperMode && tabIndex !== 0) {
                // handle tabIndex when dev mode is disabled
                setTabIndex(tabIndex - 1);
            }

            if (enableDeveloperMode && previousEnableDeveloperMode !== enableDeveloperMode) {
                // handle tabIndex when dev mode is enabled
                setTabIndex(tabIndex + 1);
            }
        }
    }, [enableDeveloperMode, tabIndex, previousEnableDeveloperMode]);
    const securityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const resultType = useMemo(() => {
        if (enableDeveloperMode && tabIndex === N_RESULTS_TAB_INDEX) {
            return RESULT_TYPE.N;
        } else if (nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES) {
            return RESULT_TYPE.NMK_CONTINGENCIES;
        } else {
            return RESULT_TYPE.NMK_LIMIT_VIOLATIONS;
        }
    }, [tabIndex, nmkType, enableDeveloperMode]);

    const { onSortChanged, sortConfig } = useAgGridSort(SECURITY_ANALYSIS_RESULT_SORT_STORE, getStoreFields(tabIndex));

    const memoizedSetPageCallback = useCallback(() => {
        setPage(0);
    }, []);

    const { updateFilter, filterSelector } = useAggridRowFilter(
        {
            filterType: SECURITY_ANALYSIS_RESULT_STORE_FIELD,
            filterTab: getStoreFields(tabIndex),
            // @ts-expect-error TODO: found how to have Action type in props type
            filterStoreAction: setSecurityAnalysisResultFilter,
        },
        memoizedSetPageCallback
    );

    const fetchSecurityAnalysisResultWithQueryParams = useCallback(
        (studyUuid: string, nodeUuid: string) => {
            if (tabIndex === (enableDeveloperMode ? LOGS_TAB_INDEX : LOGS_TAB_INDEX - 1)) {
                return Promise.resolve();
            }

            const queryParams: QueryParamsType = {
                resultType,
            };

            if (tabIndex) {
                queryParams['page'] = page;
                queryParams['size'] = rowsPerPage;
            }

            if (sortConfig?.length) {
                const columnToFieldMapping = mappingColumnToField(resultType);
                queryParams['sort'] = sortConfig.map((sort) => ({
                    ...sort,
                    colId: columnToFieldMapping[sort.colId],
                }));
            }

            if (filterSelector) {
                const updatedFilters = convertFilterValues(intl, filterSelector);
                const columnToFieldMapping = mappingColumnToField(resultType);
                queryParams['filters'] = mapFieldsToColumnsFilter(updatedFilters, columnToFieldMapping);
            }

            return fetchSecurityAnalysisResult(studyUuid, nodeUuid, currentRootNetworkUuid, queryParams);
        },
        [
            page,
            tabIndex,
            rowsPerPage,
            sortConfig,
            filterSelector,
            currentRootNetworkUuid,
            resultType,
            intl,
            enableDeveloperMode,
        ]
    );

    const [securityAnalysisResult, isLoadingResult, setResult] = useNodeData(
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        fetchSecurityAnalysisResultWithQueryParams,
        SECURITY_ANALYSIS_RESULT_INVALIDATIONS,
        null
    );

    const resetResultStates = useCallback(() => {
        setResult(null);
        setCount(0);
        setPage(0);
    }, [setResult]);

    const handleChangeNmkType = (event: SelectChangeEvent) => {
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
            setPage(selectedPage);
        },
        [setPage]
    );

    const handleChangeRowsPerPage = useCallback(
        (event: React.ChangeEvent<{ value: string }>) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
        },
        [setPage]
    );

    const result = useMemo(
        () => (securityAnalysisResult === RunningStatus.FAILED ? [] : securityAnalysisResult),
        [securityAnalysisResult]
    );

    const { loading: filterEnumsLoading, result: filterEnums } = useFetchFiltersEnums();

    useEffect(() => {
        if (result) {
            setCount(tabIndex ? result.totalElements : result.length);
        }
    }, [result, tabIndex]);

    const shouldOpenLoader = useOpenLoaderShortWait({
        isLoading: securityAnalysisStatus === RunningStatus.RUNNING || isLoadingResult,
        delay: RESULTS_LOADING_DELAY,
    });

    const columnDefs = useSecurityAnalysisColumnsDefs(
        {
            onSortChanged,
            sortConfig,
        },
        {
            updateFilter,
            filterSelector,
        },
        filterEnums,
        resultType,
        openVoltageLevelDiagram
    );

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

    return (
        <>
            <Box sx={styles.tabsAndToolboxContainer}>
                <Box sx={styles.tabs}>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        {enableDeveloperMode && <Tab label="N" />}
                        <Tab label="N-K" />
                        <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} />
                    </Tabs>
                </Box>

                <Box sx={styles.toolboxContainer}>
                    {tabIndex === (enableDeveloperMode ? NMK_RESULTS_TAB_INDEX : NMK_RESULTS_TAB_INDEX - 1) && (
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
                    {(tabIndex === (enableDeveloperMode ? NMK_RESULTS_TAB_INDEX : NMK_RESULTS_TAB_INDEX - 1) ||
                        (tabIndex === N_RESULTS_TAB_INDEX && enableDeveloperMode)) && (
                        <SecurityAnalysisExportButton
                            studyUuid={studyUuid}
                            nodeUuid={nodeUuid}
                            csvHeaders={csvHeaders}
                            resultType={resultType}
                            disabled={isExportButtonDisabled}
                        />
                    )}
                </Box>
            </Box>
            <Box sx={styles.loader}>{shouldOpenLoader && <LinearProgress />}</Box>
            <Box sx={styles.resultContainer}>
                {tabIndex === N_RESULTS_TAB_INDEX && enableDeveloperMode && (
                    <SecurityAnalysisResultN
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={columnDefs}
                    />
                )}
                {tabIndex === (enableDeveloperMode ? NMK_RESULTS_TAB_INDEX : NMK_RESULTS_TAB_INDEX - 1) && (
                    <SecurityAnalysisResultNmk
                        result={result}
                        isLoadingResult={isLoadingResult || filterEnumsLoading}
                        isFromContingency={nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES}
                        paginationProps={{
                            count,
                            rowsPerPage,
                            page,
                            onPageChange: handleChangePage,
                            onRowsPerPageChange: handleChangeRowsPerPage,
                        }}
                        columnDefs={columnDefs}
                    />
                )}
                {tabIndex === (enableDeveloperMode ? LOGS_TAB_INDEX : LOGS_TAB_INDEX - 1) &&
                    (securityAnalysisStatus === RunningStatus.SUCCEED ||
                        securityAnalysisStatus === RunningStatus.FAILED) && (
                        <ComputationReportViewer reportType={ComputingType.SECURITY_ANALYSIS} />
                    )}
            </Box>
        </>
    );
};
