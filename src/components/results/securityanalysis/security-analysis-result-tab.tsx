/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { AppState } from '../../../redux/reducer';

import { Box, LinearProgress, MenuItem, Select, Tab, Tabs } from '@mui/material';
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
    convertFilterValues,
    DEFAULT_PAGE_COUNT,
    getStoreFields,
    mappingColumnToField,
    NMK_TYPE,
    RESULT_TYPE,
    useFetchFiltersEnums,
} from './security-analysis-result-utils';
import { FilterType as AgGridFilterType } from '../../../types/custom-aggrid-types';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { SecurityAnalysisExportButton } from './security-analysis-export-button';
import { useSecurityAnalysisColumnsDefs } from './use-security-analysis-column-defs';
import { SECURITY_ANALYSIS_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import { useIntl } from 'react-intl/lib';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { mapFieldsToColumnsFilter } from '../../../utils/aggrid-headers-utils';
import { securityAnalysisResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { useNodeData } from 'components/use-node-data';

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
const N_RESULTS_TAB_INDEX = 0;
const NMK_RESULTS_TAB_INDEX = 1;
const LOGS_TAB_INDEX = 2;

export const SecurityAnalysisResultTab: FunctionComponent<SecurityAnalysisTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    openVoltageLevelDiagram,
}) => {
    const intl = useIntl();
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [tabIndex, setTabIndex] = useState(enableDeveloperMode ? N_RESULTS_TAB_INDEX : NMK_RESULTS_TAB_INDEX);
    const tabIndexRef = useRef<number>();
    tabIndexRef.current = tabIndex;
    const [nmkType, setNmkType] = useState(NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES);
    const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_PAGE_COUNT as number);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);

    useEffect(() => {
        if (!enableDeveloperMode && tabIndexRef.current === N_RESULTS_TAB_INDEX) {
            // handle tabIndex when dev mode is disabled
            setTabIndex(NMK_RESULTS_TAB_INDEX);
        }
    }, [enableDeveloperMode]);
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

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SECURITY_ANALYSIS_RESULT_SORT_STORE][getStoreFields(tabIndex)]
    );

    const { filters } = useFilterSelector(AgGridFilterType.SecurityAnalysis, getStoreFields(tabIndex));

    const memoizedSetPageCallback = useCallback(() => {
        setPage(0);
    }, []);

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
                queryParams['size'] = rowsPerPage;
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

            return fetchSecurityAnalysisResult(studyUuid, nodeUuid, currentRootNetworkUuid, queryParams);
        },

        [page, tabIndex, rowsPerPage, sortConfig, currentRootNetworkUuid, filters, resultType, intl]
    );

    const [securityAnalysisResult, isLoadingResult, setResult] = useNodeData(
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        fetchSecurityAnalysisResultWithQueryParams,
        securityAnalysisResultInvalidations,
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
    const handleChangePage = useCallback((_: React.MouseEvent<HTMLButtonElement> | null, selectedPage: number) => {
        setPage(selectedPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<{ value: string }>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const result = useMemo(
        () => (securityAnalysisResult === RunningStatus.FAILED ? [] : securityAnalysisResult),
        [securityAnalysisResult]
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

    const columnDefs = useSecurityAnalysisColumnsDefs(
        filterEnums,
        resultType,
        openVoltageLevelDiagram,
        tabIndex,
        memoizedSetPageCallback
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
                        {enableDeveloperMode && <Tab label="N" value={N_RESULTS_TAB_INDEX} />}
                        <Tab label="N-K" value={NMK_RESULTS_TAB_INDEX} />
                        <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} value={LOGS_TAB_INDEX} />
                    </Tabs>
                </Box>

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
                    {(tabIndex === NMK_RESULTS_TAB_INDEX ||
                        (tabIndex === N_RESULTS_TAB_INDEX && enableDeveloperMode)) && (
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
                {tabIndex === N_RESULTS_TAB_INDEX && enableDeveloperMode && (
                    <SecurityAnalysisResultN
                        result={result}
                        isLoadingResult={isLoadingResult}
                        columnDefs={columnDefs}
                    />
                )}
                {tabIndex === NMK_RESULTS_TAB_INDEX && (
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
                {tabIndex === LOGS_TAB_INDEX &&
                    (securityAnalysisStatus === RunningStatus.SUCCEED ||
                        securityAnalysisStatus === RunningStatus.FAILED) && (
                        <ComputationReportViewer reportType={ComputingType.SECURITY_ANALYSIS} />
                    )}
            </Box>
        </>
    );
};
