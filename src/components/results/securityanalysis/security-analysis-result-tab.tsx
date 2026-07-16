/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { AppState } from '../../../redux/reducer.type';
import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import {
    downloadSecurityAnalysisResultZippedCsv,
    fetchSecurityAnalysisResult,
} from '../../../services/study/security-analysis';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import {
    ComputingType,
    EquipmentType,
    GsLangUser,
    ManagedExportCsvButton,
    MuiStyles,
    NmkType,
    PARAM_DEVELOPER_MODE,
    SecurityAnalysisResultNmk,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { SecurityAnalysisResultN } from './security-analysis-result-n';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { RESULT_TYPE, SecurityAnalysisQueryParams, SecurityAnalysisTabProps } from './security-analysis.type';
import {
    convertFilterValues,
    getStoreFields,
    mappingColumnToField,
    NMK_SUBTABS,
    useFetchFiltersEnums,
} from './security-analysis-result-utils';
import { PaginationType, SecurityAnalysisTab, SortWay, TableType } from '../../../types/custom-aggrid-types';
import { useSecurityAnalysisColumnsDefs } from './use-security-analysis-column-defs';
import { SECURITY_ANALYSIS_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import { mapFieldsToColumnsFilter } from '../../../utils/aggrid-headers-utils';
import { securityAnalysisResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { useNodeData } from 'components/use-node-data';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { usePaginationSelector } from 'hooks/use-pagination-selector';
import { UUID } from 'node:crypto';
import { useComputationGlobalFilters } from '../common/global-filter/hooks/use-computation-global-filters';
import { buildValidGlobalFilters } from '../common/global-filter/utils/build-valid-global-filters';
import { useComputationColumnFilters } from '../common/column-filter/use-computation-column-filters';
import { PERMANENT_LIMIT_NAME } from '../common/utils';
import { setTableSort } from '../../../redux/actions';
import { useIntlResultStatusMessages } from 'components/utils/aggrid-rows-handler';
import { useAgGridInitialColumnFilters } from '../common/use-ag-grid-initial-column-filters';
import { PARAM_COMPUTED_LANGUAGE } from '../../../utils/config-params';
import { downloadZipFile } from 'services/utils';

import { FilterType, isCriteriaFilterType } from '../common/global-filter/filter.type';

const styles = {
    toolbarRow: {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        width: '100%',
        mb: 1,
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
    const { snackError } = useSnackMessage();
    const resultStatusMessages = useIntlResultStatusMessages(intl);

    const [isDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [tabIndex, setTabIndex] = useState(isDeveloperMode ? N_RESULTS_TAB_INDEX : NMK_RESULTS_TAB_INDEX);
    const tabIndexRef = useRef<number>(null);
    tabIndexRef.current = tabIndex;

    const [nmkType, setNmkType] = useState(NmkType.CONSTRAINTS_FROM_CONTINGENCIES);
    const [count, setCount] = useState<number>(0);
    const isNmkTab = tabIndex === NMK_RESULTS_TAB_INDEX;
    const isNTabDev = tabIndex === N_RESULTS_TAB_INDEX && isDeveloperMode;
    const showResultsToolbar = isNmkTab || isNTabDev;
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isDeveloperMode && tabIndexRef.current === N_RESULTS_TAB_INDEX) {
            // handle tabIndex when dev mode is disabled
            setTabIndex(NMK_RESULTS_TAB_INDEX);
        }
    }, [isDeveloperMode]);

    const securityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const resultType = useMemo<RESULT_TYPE>(() => {
        if (isDeveloperMode && tabIndex === N_RESULTS_TAB_INDEX) {
            return RESULT_TYPE.N;
        }
        switch (nmkType) {
            case NmkType.CONSTRAINTS_FROM_CONTINGENCIES:
                return RESULT_TYPE.NMK_CONTINGENCIES;
            case NmkType.CONTINGENCIES_FROM_CONSTRAINTS:
                return RESULT_TYPE.NMK_LIMIT_VIOLATIONS;
            case NmkType.CUT_OFF_POWER_FROM_CONSTRAINTS:
                return RESULT_TYPE.NMK_CUT_OFF_POWER;
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

    const { filters } = useComputationColumnFilters(TableType.SecurityAnalysis, getStoreFields(tabIndex));

    const resetPaginationIfNKResults = useCallback(() => {
        if (tabIndex === NMK_RESULTS_TAB_INDEX) {
            dispatchPagination({ page: 0, rowsPerPage });
        }
    }, [dispatchPagination, tabIndex, rowsPerPage]);

    const globalFiltersFromState = useComputationGlobalFilters(TableType.SecurityAnalysis, resetPaginationIfNKResults);

    const queryParams: SecurityAnalysisQueryParams = useMemo(() => {
        const params: SecurityAnalysisQueryParams = {
            resultType,
        };
        if (tabIndex === NMK_RESULTS_TAB_INDEX) {
            params['page'] = page;
            params['size'] = rowsPerPage as number;
        }

        if (sortConfig?.length) {
            const columnToFieldMapping = mappingColumnToField(resultType);
            params['sort'] = sortConfig.map((sort) => ({
                ...sort,
                colId: columnToFieldMapping[sort.colId],
            }));
        }

        if (filters) {
            const columnToFieldMapping = mappingColumnToField(resultType);
            const relevantFilters = filters.filter((f) => columnToFieldMapping[f.column] != null);
            if (relevantFilters.length) {
                const updatedFilters = convertFilterValues(intl, relevantFilters);
                params['filters'] = mapFieldsToColumnsFilter(updatedFilters, columnToFieldMapping);
            }
        }
        const globalFilters = buildValidGlobalFilters(globalFiltersFromState);
        if (globalFilters) {
            params['globalFilters'] = globalFilters;
        }
        return params;
    }, [resultType, tabIndex, sortConfig, filters, globalFiltersFromState, page, rowsPerPage, intl]);

    const fetchSecurityAnalysisResultWithQueryParams = useCallback(
        (studyUuidArg: string, nodeUuidArg: string) => {
            if (tabIndex === LOGS_TAB_INDEX) {
                return Promise.resolve();
            }
            return fetchSecurityAnalysisResult(studyUuidArg, nodeUuidArg, currentRootNetworkUuid, queryParams);
        },
        [tabIndex, queryParams, currentRootNetworkUuid]
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

    const handleChangeNmkType = (_event: SyntheticEvent, newValue: NmkType) => {
        dispatchPagination({ page: 0, rowsPerPage });
        resetResultStates();
        dispatch(
            setTableSort(SECURITY_ANALYSIS_RESULT_SORT_STORE, getStoreFields(tabIndex), [
                { colId: 'contingencyId', sort: SortWay.ASC },
            ])
        );
        setNmkType(newValue);
    };

    const handleTabChange = (_event: SyntheticEvent, newTabIndex: number) => {
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
        (event: React.ChangeEvent<{ value: string }>) => {
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

    const columnDefs = useSecurityAnalysisColumnsDefs(filterEnums, resultType, tabIndex);

    const csvHeaders = useMemo(() => columnDefs.map((cDef) => cDef.headerName ?? ''), [columnDefs]);

    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);
    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);

    const enumValueTranslations = useMemo(() => {
        const returnedValue: Record<string, string> = {
            [PERMANENT_LIMIT_NAME]: intl.formatMessage({
                id: 'PermanentLimitName',
            }),
        };
        const enumValuesToTranslate = [
            'CURRENT',
            'HIGH_VOLTAGE',
            'LOW_VOLTAGE',
            'ACTIVE_POWER',
            'APPARENT_POWER',
            'MAX_ITERATION_REACHED',
            'OTHER',
            'CONVERGED',
            'FAILED',
            'ONE',
            'TWO',
            'NO_CALCULATION',
        ];

        enumValuesToTranslate.forEach((value) => {
            returnedValue[value] = intl.formatMessage({ id: value });
        });

        return returnedValue;
    }, [intl]);

    const downloadZipResult = useCallback(
        (
            studyUuidArg: UUID,
            nodeUuidArg: UUID,
            rootNetworkUuidArg: UUID,
            translations: Record<string, string>,
            lang: GsLangUser
        ) =>
            downloadSecurityAnalysisResultZippedCsv(
                studyUuidArg,
                nodeUuidArg,
                rootNetworkUuidArg,
                queryParams,
                csvHeaders,
                translations,
                lang
            ),
        [csvHeaders, queryParams]
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

    const resetKey = `${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}-${resultType}-${appTabIndex}`;

    const exportResultCsv = useCallback(async () => {
        const fileBlob = await downloadZipResult(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
            enumValueTranslations,
            language
        );
        downloadZipFile(fileBlob, `${resultType}-results.zip`);
    }, [studyUuid, nodeUuid, currentRootNetworkUuid, resultType, enumValueTranslations, language, downloadZipResult]);

    const handleExportError = useCallback(
        (error: unknown) => {
            snackWithFallback(snackError, error, { headerId: 'securityAnalysisCsvResultsError' });
        },
        [snackError]
    );

    const filterableEquipmentTypes: EquipmentType[] = useMemo(() => {
        if (tabIndex === NMK_RESULTS_TAB_INDEX) {
            return [
                EquipmentType.LINE,
                EquipmentType.TWO_WINDINGS_TRANSFORMER,
                EquipmentType.THREE_WINDINGS_TRANSFORMER,
                EquipmentType.BATTERY,
                EquipmentType.GENERATOR,
                EquipmentType.LOAD,
                EquipmentType.SHUNT_COMPENSATOR,
                EquipmentType.STATIC_VAR_COMPENSATOR,
                EquipmentType.BOUNDARY_LINE,
                EquipmentType.HVDC_LINE,
                EquipmentType.VSC_CONVERTER_STATION,
                EquipmentType.BUSBAR_SECTION,
            ];
        }
        return [];
    }, [tabIndex]);

    const filterTypes: FilterType[] = useMemo(() => {
        const allFilterTypes = Object.values(FilterType);
        if (tabIndex === N_RESULTS_TAB_INDEX) {
            // in this case we disable generic filters
            return allFilterTypes.filter((filterType) => !isCriteriaFilterType(filterType));
        }
        return allFilterTypes;
    }, [tabIndex]);

    const computationSubType = getStoreFields(tabIndex);
    const onGridReady = useAgGridInitialColumnFilters(TableType.SecurityAnalysis, computationSubType);

    return (
        <>
            <Box sx={styles.toolbarRow}>
                <Box>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        {isDeveloperMode && (
                            <Tab label="N" value={N_RESULTS_TAB_INDEX} data-testid={'SecurityAnalysisNTab'} />
                        )}
                        <Tab label="N-K" value={NMK_RESULTS_TAB_INDEX} data-testid={'SecurityAnalysisN-KTab'} />
                        <Tab
                            label={<FormattedMessage id={'ComputationResultsLogs'} />}
                            value={LOGS_TAB_INDEX}
                            data-testid={'SecurityAnalysisLogsTab'}
                        />
                    </Tabs>
                </Box>
            </Box>
            {showResultsToolbar && (
                <Box sx={styles.toolbarRow}>
                    <Box sx={{ justifySelf: 'start' }}>
                        {isNmkTab && (
                            <Tabs value={nmkType} onChange={handleChangeNmkType}>
                                {NMK_SUBTABS.map(({ messageId, value }) => (
                                    <Tab key={value} label={<FormattedMessage id={messageId} />} value={value} />
                                ))}
                            </Tabs>
                        )}
                    </Box>
                    <Box sx={{ justifySelf: 'center', position: 'relative' }}>
                        <GlobalFilterSelector
                            filterCategories={filterTypes}
                            filterableEquipmentTypes={filterableEquipmentTypes}
                            genericFiltersStrictMode={true}
                            tableType={TableType.SecurityAnalysis}
                        />
                    </Box>
                    <Box sx={{ justifySelf: 'end' }}>
                        <ManagedExportCsvButton
                            exportCsv={exportResultCsv}
                            resetKey={resetKey}
                            disabled={isExportButtonDisabled}
                            onError={handleExportError}
                        />
                    </Box>
                </Box>
            )}
            <Box sx={styles.loader}>{shouldOpenLoader && <LinearProgress />}</Box>
            <Box sx={styles.resultContainer}>
                {isNTabDev && (
                    <SecurityAnalysisResultN
                        result={result}
                        isLoadingResult={isLoadingResult}
                        onGridReady={onGridReady}
                        columnDefs={columnDefs}
                        resultStatusMessages={resultStatusMessages}
                        securityAnalysisStatus={securityAnalysisStatus}
                    />
                )}
                {isNmkTab && (
                    <SecurityAnalysisResultNmk
                        result={result}
                        isLoadingResult={isLoadingResult || filterEnumsLoading}
                        onGridReady={onGridReady}
                        nmkType={nmkType}
                        resultStatusMessages={resultStatusMessages}
                        securityAnalysisStatus={securityAnalysisStatus}
                        paginationProps={{
                            count,
                            rowsPerPage: rowsPerPage as number,
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
