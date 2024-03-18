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
    useMemo,
    useState,
} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
import { SORT_WAYS, useAgGridSort } from 'hooks/use-aggrid-sort';
import { useAggridRowFilter } from 'hooks/use-aggrid-row-filter';
import {
    FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT,
    getIdType,
    loadFlowCurrentViolationsColumnsDefinition,
    loadFlowResultColumnsDefinition,
    loadFlowVoltageViolationsColumnsDefinition,
    LOADFLOW_RESULT_FILTER,
    makeData,
    mappingFields,
    mappingTabs,
    useFetchFiltersEnums,
} from './load-flow-result-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
} from 'components/custom-aggrid/custom-aggrid-header.type';
import { Box } from '@mui/material';
import { ICellRendererParams } from 'ag-grid-community';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import { LimitViolationResult } from './limit-violation-result';
import { mapFieldsToColumnsFilter } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { setLoadflowResultFilter } from 'redux/actions';

export const LoadFlowResultTab: FunctionComponent<LoadFlowTabProps> = ({
    studyUuid,
    nodeUuid,
}) => {
    const styles = {
        cell: {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            flex: 1,
            cursor: 'initial',
        },
        succeed: {
            color: green[500],
        },
        fail: {
            color: red[500],
        },
    };
    const intl = useIntl();
    const loadflowResultInvalidations = ['loadflowResult'];

    const [tabIndex, setTabIndex] = useState(0);
    const [hasFilter, setHasFilter] = useState<boolean>(false);
    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        colKey: getIdType(tabIndex),
        sortWay: SORT_WAYS.desc,
    });

    const { updateFilter, filterSelector, initFilters } = useAggridRowFilter(
        LOADFLOW_RESULT_FILTER,
        mappingTabs(tabIndex),
        setLoadflowResultFilter
    );

    const { loading: filterEnumsLoading, result: filterEnums } =
        useFetchFiltersEnums(hasFilter, setHasFilter);

    const fetchLimitViolationsWithParameters = useCallback(() => {
        const limitTypeValues =
            tabIndex === 0
                ? [LimitTypes.CURRENT]
                : [LimitTypes.HIGH_VOLTAGE, LimitTypes.LOW_VOLTAGE];
        const initialFilters = filterSelector || [];
        const existingFilterIndex = initialFilters.findIndex(
            (f) => f.column === 'limitType'
        );
        const updatedFilters =
            existingFilterIndex !== -1 &&
            initialFilters[existingFilterIndex]?.value.length !== 0
                ? initialFilters
                : [
                      ...initialFilters,
                      {
                          column: 'limitType',
                          dataType: FILTER_DATA_TYPES.TEXT,
                          type: FILTER_TEXT_COMPARATORS.EQUALS,
                          value: limitTypeValues,
                      },
                  ];
        return fetchLimitViolations(studyUuid, nodeUuid, {
            sort: {
                colKey: FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT[
                    sortConfig.colKey
                ],
                sortWay: sortConfig.sortWay,
            },
            filters: mapFieldsToColumnsFilter(
                updatedFilters,
                mappingFields(tabIndex)
            ),
        });
    }, [studyUuid, nodeUuid, sortConfig, filterSelector, tabIndex]);

    const fetchloadflowResultWithParameters = useCallback(() => {
        return fetchLoadFlowResult(studyUuid, nodeUuid, {
            sort: sortConfig,
            filters: filterSelector,
        });
    }, [studyUuid, nodeUuid, sortConfig, filterSelector]);

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

    const StatusCellRender = useCallback(
        (cellData: ICellRendererParams) => {
            const status = cellData.value;
            const color = status === 'CONVERGED' ? styles.succeed : styles.fail;
            return (
                <Box sx={styles.cell}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Lens fontSize={'medium'} sx={color} />
                        <span style={{ marginLeft: '4px' }}>{status}</span>
                    </div>
                </Box>
            );
        },
        [styles.cell, styles.fail, styles.succeed]
    );

    const NumberRenderer = useCallback(
        (cellData: ICellRendererParams) => {
            const value = cellData.value;
            return (
                <Box sx={styles.cell}>
                    {!isNaN(value) ? value.toFixed(2) : ''}
                </Box>
            );
        },
        [styles.cell]
    );
    const loadFlowLimitViolationsColumns = useMemo(() => {
        switch (tabIndex) {
            case 0:
                return loadFlowCurrentViolationsColumnsDefinition(
                    intl,
                    { onSortChanged, sortConfig },
                    { updateFilter, filterSelector },
                    filterEnums
                );
            case 1:
                return loadFlowVoltageViolationsColumnsDefinition(
                    intl,
                    { onSortChanged, sortConfig },
                    { updateFilter, filterSelector },
                    filterEnums
                );
            case 2:
                return loadFlowResultColumnsDefinition(
                    intl,
                    { onSortChanged, sortConfig },
                    { updateFilter, filterSelector },
                    filterEnums,
                    StatusCellRender,
                    NumberRenderer
                );

            default:
                return [];
        }
    }, [
        filterEnums,
        filterSelector,
        intl,
        onSortChanged,
        sortConfig,
        updateFilter,
        tabIndex,
        StatusCellRender,
        NumberRenderer,
    ]);

    const resetResultStates = useCallback(
        (defaultSortColKey: string) => {
            setResult(null);
            initFilters();
            if (initSort) {
                initSort(defaultSortColKey);
            }
        },
        [initSort, initFilters, setResult]
    );

    const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
        resetResultStates(getIdType(newTabIndex));
        setTabIndex(newTabIndex);
    };

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
            <div>
                <Tabs value={tabIndex} onChange={handleTabChange}>
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
            </div>

            {tabIndex === 0 && (
                <LimitViolationResult
                    result={result}
                    isLoadingResult={isLoadingResult || filterEnumsLoading}
                    columnDefs={loadFlowLimitViolationsColumns}
                    tableName={intl.formatMessage({
                        id: 'LoadFlowResultsCurrentViolations',
                    })}
                />
            )}
            {tabIndex === 1 && (
                <LimitViolationResult
                    result={result}
                    isLoadingResult={isLoadingResult || filterEnumsLoading}
                    columnDefs={loadFlowLimitViolationsColumns}
                    tableName={intl.formatMessage({
                        id: 'LoadFlowResultsVoltageViolations',
                    })}
                />
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
                        reportType={REPORT_TYPES.LOADFLOW}
                    />
                )}
        </>
    );
};
