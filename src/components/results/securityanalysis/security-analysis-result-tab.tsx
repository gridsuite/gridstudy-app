/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    SyntheticEvent,
    FunctionComponent,
    useState,
    useCallback,
    useMemo,
    useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReduxState } from '../../../redux/reducer.type';
import { Box } from '@mui/system';
import { Tabs, Tab, Select, MenuItem, LinearProgress } from '@mui/material';
import { fetchSecurityAnalysisResult } from '../../../services/study/security-analysis';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { ComputingType } from '../../computing-status/computing-type';
import { SecurityAnalysisResultN } from './security-analysis-result-n';
import { SecurityAnalysisResultNmk } from './security-analysis-result-nmk';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import {
    QueryParamsType,
    SecurityAnalysisTabProps,
} from './security-analysis.type';
import {
    DEFAULT_PAGE_COUNT,
    FROM_COLUMN_TO_FIELD,
    NMK_TYPE,
    RESULT_TYPE,
    useFetchFiltersEnums,
    SECURITY_ANALYSIS_RESULT_INVALIDATIONS,
    getIdType,
} from './security-analysis-result-utils';
import { useNodeData } from '../../study-container';
import { SORT_WAYS, useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useAggridRowFilter } from '../../../hooks/use-aggrid-row-filter';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { REPORT_TYPES } from '../../utils/report-type';

const styles = {
    container: {
        display: 'flex',
        position: 'relative',
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

    const intl = useIntl();

    const N_RESULTS_TAB_INDEX = 0;
    const NMK_RESULTS_TAB_INDEX = 1;
    const LOGS_TAB_INDEX = 2;

    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        colKey: getIdType(tabIndex, nmkType),
        sortWay: SORT_WAYS.asc,
    });

    const { updateFilter, filterSelector, initFilters } = useAggridRowFilter(
        FROM_COLUMN_TO_FIELD,
        () => {
            setPage(0);
        }
    );

    const fetchSecurityAnalysisResultWithQueryParams = useCallback(
        (studyUuid: string, nodeUuid: string) => {
            if (tabIndex === LOGS_TAB_INDEX) {
                return Promise.resolve();
            }

            const resultType =
                tabIndex === N_RESULTS_TAB_INDEX
                    ? RESULT_TYPE.N
                    : nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                    ? RESULT_TYPE.NMK_CONTINGENCIES
                    : RESULT_TYPE.NMK_LIMIT_VIOLATIONS;

            const queryParams: QueryParamsType = {
                resultType,
            };

            if (tabIndex) {
                queryParams['page'] = page;
                queryParams['size'] = rowsPerPage;
            }

            if (sortConfig) {
                const { sortWay, colKey } = sortConfig;
                queryParams['sort'] = {
                    colKey: FROM_COLUMN_TO_FIELD[colKey],
                    sortWay,
                };
            }

            if (filterSelector) {
                queryParams['filters'] = filterSelector;
            }

            return fetchSecurityAnalysisResult(
                studyUuid,
                nodeUuid,
                queryParams
            );
        },
        [nmkType, page, tabIndex, rowsPerPage, sortConfig, filterSelector]
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
            initFilters();
            if (initSort) {
                initSort(defaultSortColKey);
            }
        },
        [initSort, initFilters, setResult]
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
        useFetchFiltersEnums(hasFilter, setHasFilter);

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

    const enumValueTranslations = useMemo(() => {
        const returnedValue: Record<string, string> = {};
        const enumValuesToTranslate = [
            'CURRENT',
            'HIGH_VOLTAGE',
            'LOW_VOLTAGE',
            'ACTIVE_POWER',
            'APPARENT_POWER',
            'MAX_ITERATION_REACHED',
            'OTHER',
            'SOLVER_FAILED',
            'CONVERGED',
            'FAILED',
            'ONE',
            'TWO',
        ];

        enumValuesToTranslate.forEach((value) => {
            returnedValue[value] = intl.formatMessage({ id: value });
        });

        return returnedValue;
    }, [intl]);

    return (
        <>
            <Box sx={styles.container}>
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
                {tabIndex === NMK_RESULTS_TAB_INDEX && (
                    <Box sx={styles.nmkResultSelect}>
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
                    </Box>
                )}
            </Box>
            <Box sx={styles.loader}>
                {shouldOpenLoader && <LinearProgress />}
            </Box>
            <Box sx={styles.resultContainer}>
                {tabIndex === N_RESULTS_TAB_INDEX && (
                    <SecurityAnalysisResultN
                        result={result}
                        isLoadingResult={isLoadingResult}
                        sortProps={{
                            onSortChanged,
                            sortConfig,
                        }}
                        filterProps={{
                            updateFilter,
                            filterSelector,
                        }}
                        filterEnums={filterEnums}
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        enumValueTranslations={enumValueTranslations}
                    />
                )}
                {tabIndex === NMK_RESULTS_TAB_INDEX && (
                    <SecurityAnalysisResultNmk
                        result={result}
                        isLoadingResult={isLoadingResult || filterEnumsLoading}
                        isFromContingency={
                            nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                        }
                        openVoltageLevelDiagram={openVoltageLevelDiagram}
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        paginationProps={{
                            count,
                            rowsPerPage,
                            page,
                            onPageChange: handleChangePage,
                            onRowsPerPageChange: handleChangeRowsPerPage,
                        }}
                        sortProps={{
                            onSortChanged,
                            sortConfig,
                        }}
                        filterProps={{
                            updateFilter,
                            filterSelector,
                        }}
                        filterEnums={filterEnums}
                        enumValueTranslations={enumValueTranslations}
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
