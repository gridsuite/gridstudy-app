/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LinearProgress, MenuItem, Select, Tab, Tabs } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { Box } from '@mui/system';
import { mapFieldsToColumnsFilter } from 'components/custom-aggrid/custom-aggrid-header-utils';
import React, {
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl/lib';
import { useSelector } from 'react-redux';
import { setSecurityAnalysisResultFilter } from 'redux/actions';
import { SECURITY_ANALYSIS_RESULT_STORE_FIELD } from 'utils/store-filter-fields';
import { useAggridRowFilter } from '../../../hooks/use-aggrid-row-filter';
import { SortWay, useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { ReduxState } from '../../../redux/reducer.type';
import { fetchSecurityAnalysisResult } from '../../../services/study/security-analysis';
import { ComputingType } from '../../computing-status/computing-type';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { useNodeData } from '../../study-container/study-container';
import { REPORT_TYPES } from '../../utils/report-type';
import { RunningStatus } from '../../utils/running-status';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { SecurityAnalysisExportButton } from './security-analysis-export-button';
import { SecurityAnalysisResultN } from './security-analysis-result-n';
import { SecurityAnalysisResultNmk } from './security-analysis-result-nmk';
import {
    DEFAULT_PAGE_COUNT,
    NMK_TYPE,
    RESULT_TYPE,
    SECURITY_ANALYSIS_RESULT_INVALIDATIONS,
    convertFilterValues,
    getIdType,
    getStoreFields,
    mappingColumnToField,
    useFetchFiltersEnums,
} from './security-analysis-result-utils';
import {
    QueryParamsType,
    SecurityAnalysisTabProps,
} from './security-analysis.type';
import { useSecurityAnalysisColumnsDefs } from './use-security-analysis-column-defs';

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

export const SecurityAnalysisResultTab: FunctionComponent<
    SecurityAnalysisTabProps
> = ({ studyUuid, nodeUuid, openVoltageLevelDiagram }) => {
    const intl = useIntl();
    const [tabIndex, setTabIndex] = useState(0);
    const [nmkType, setNmkType] = useState(
        NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
    );
    const [rowsPerPage, setRowsPerPage] = useState<number>(
        DEFAULT_PAGE_COUNT as number
    );
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [hasFilter, setHasFilter] = useState<boolean>(false);

    const N_RESULTS_TAB_INDEX = 0;
    const NMK_RESULTS_TAB_INDEX = 1;
    const LOGS_TAB_INDEX = 2;

    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        colId: getIdType(tabIndex, nmkType),
        sort: SortWay.ASC,
    });

    const resultType = useMemo(() => {
        if (tabIndex === N_RESULTS_TAB_INDEX) {
            return RESULT_TYPE.N;
        } else if (nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES) {
            return RESULT_TYPE.NMK_CONTINGENCIES;
        } else {
            return RESULT_TYPE.NMK_LIMIT_VIOLATIONS;
        }
    }, [tabIndex, nmkType]);

    const memoizedSetPageCallback = useCallback(() => {
        setPage(0);
    }, []);

    const { updateFilter, filterSelector } = useAggridRowFilter(
        {
            filterType: SECURITY_ANALYSIS_RESULT_STORE_FIELD,
            filterTab: getStoreFields(tabIndex),
            filterStoreAction: setSecurityAnalysisResultFilter,
        },
        memoizedSetPageCallback
    );

    const fetchSecurityAnalysisResultWithQueryParams = useCallback(
        (studyUuid: string, nodeUuid: string) => {
            if (tabIndex === LOGS_TAB_INDEX) {
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
                const updatedFilters = convertFilterValues(
                    intl,
                    filterSelector
                );
                const columnToFieldMapping = mappingColumnToField(resultType);
                queryParams['filters'] = mapFieldsToColumnsFilter(
                    updatedFilters,
                    columnToFieldMapping
                );
            }

            return fetchSecurityAnalysisResult(
                studyUuid,
                nodeUuid,
                queryParams
            );
        },
        [
            page,
            tabIndex,
            rowsPerPage,
            sortConfig,
            filterSelector,
            resultType,
            intl,
        ]
    );

    const [securityAnalysisResult, isLoadingResult, setResult] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchSecurityAnalysisResultWithQueryParams,
        SECURITY_ANALYSIS_RESULT_INVALIDATIONS,
        null
    );

    const resetResultStates = useCallback(
        (defaultSortColKey: string) => {
            setResult(null);
            setCount(0);
            setPage(0);
            if (initSort) {
                initSort(defaultSortColKey);
            }
        },
        [initSort, setResult]
    );

    const handleChangeNmkType = (event: SelectChangeEvent) => {
        const newNmkType = event.target.value;
        resetResultStates(
            newNmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                ? 'contingencyId'
                : 'subjectId'
        );
        setNmkType(
            nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                ? NMK_TYPE.CONTINGENCIES_FROM_CONSTRAINTS
                : NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
        );
    };

    const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
        resetResultStates(getIdType(newTabIndex, nmkType));
        setTabIndex(newTabIndex);
    };

    // Pagination, sort and filter
    const handleChangePage = useCallback(
        (
            _: React.MouseEvent<HTMLButtonElement> | null,
            selectedPage: number
        ) => {
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
        () =>
            securityAnalysisResult === RunningStatus.FAILED
                ? []
                : securityAnalysisResult,
        [securityAnalysisResult]
    );

    const { loading: filterEnumsLoading, result: filterEnums } =
        useFetchFiltersEnums(studyUuid, nodeUuid, hasFilter, setHasFilter);

    useEffect(() => {
        if (result) {
            setCount(tabIndex ? result.totalElements : result.length);
        }
    }, [result, tabIndex]);

    const shouldOpenLoader = useOpenLoaderShortWait({
        isLoading:
            securityAnalysisStatus === RunningStatus.RUNNING || isLoadingResult,
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

    const csvHeaders = useMemo(
        () => columnDefs.map((cDef) => cDef.headerName ?? ''),
        [columnDefs]
    );

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
                        <Tab label="N" />
                        <Tab label="N-K" />
                        <Tab
                            label={
                                <FormattedMessage
                                    id={'ComputationResultsLogs'}
                                />
                            }
                        />
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
                            <MenuItem
                                value={NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES}
                            >
                                <FormattedMessage id="ConstraintsFromContingencies" />
                            </MenuItem>
                            <MenuItem
                                value={NMK_TYPE.CONTINGENCIES_FROM_CONSTRAINTS}
                            >
                                <FormattedMessage id="ContingenciesFromConstraints" />
                            </MenuItem>
                        </Select>
                    )}
                    {(tabIndex === NMK_RESULTS_TAB_INDEX ||
                        tabIndex === N_RESULTS_TAB_INDEX) && (
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
            <Box sx={styles.loader}>
                {shouldOpenLoader && <LinearProgress />}
            </Box>
            <Box sx={styles.resultContainer}>
                {tabIndex === N_RESULTS_TAB_INDEX && (
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
                        isFromContingency={
                            nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                        }
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
                        <ComputationReportViewer
                            reportType={REPORT_TYPES.SECURITY_ANALYSIS}
                        />
                    )}
            </Box>
        </>
    );
};
