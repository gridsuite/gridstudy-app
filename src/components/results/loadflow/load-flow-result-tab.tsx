/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl/lib';
import { LimitTypes, LoadFlowTabProps, OverloadedEquipment } from './load-flow-result.type';
import { LoadFlowResult } from './load-flow-result';
import { fetchLimitViolations, fetchLoadFlowResult } from '../../../services/study/loadflow';
import RunningStatus from 'components/utils/running-status';
import { AppState } from 'redux/reducer';
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
import { ComputingType, mergeSx, type MuiStyles } from '@gridsuite/commons-ui';
import { LOADFLOW_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import GlassPane from '../common/glass-pane';
import { FilterType as AgGridFilterType } from '../../../types/custom-aggrid-types';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { mapFieldsToColumnsFilter } from '../../../utils/aggrid-headers-utils';
import { loadflowResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { UUID } from 'crypto';
import GlobalFilterSelector from '../../global-filter/global-filter-selector';
import useGlobalFilters from '../common/global-filter/use-global-filters';
import { useGlobalFilterOptions } from '../../global-filter/use-global-filter-options';
import { ICellRendererParams } from 'ag-grid-community';
import { Button, Tooltip } from '@mui/material';
import { resultsStyles } from '../common/utils';
import { useLoadFlowResultColumnActions } from './use-load-flow-result-column-actions';

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
} as const satisfies MuiStyles;

export const LoadFlowResultTab: FunctionComponent<LoadFlowTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    openVoltageLevelDiagram,
}) => {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(0);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[LOADFLOW_RESULT_SORT_STORE][mappingTabs(tabIndex)]
    );

    const { filters } = useFilterSelector(AgGridFilterType.Loadflow, mappingTabs(tabIndex));

    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();
    const { globalFilters, handleGlobalFilterChange, getGlobalFilterParameter } = useGlobalFilters({});
    const { onLinkClick } = useLoadFlowResultColumnActions({
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        openVoltageLevelDiagram,
    });
    const { loading: filterEnumsLoading, result: filterEnums } = useFetchFiltersEnums();

    const getEnumLabel = useCallback(
        (value: string) =>
            intl.formatMessage({
                id: value,
                defaultMessage: value,
            }),
        [intl]
    );

    const fetchLimitViolationsWithParameters = useMemo(
        () => (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => {
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
                ...(getGlobalFilterParameter(globalFilters) !== undefined && {
                    globalFilters: {
                        ...getGlobalFilterParameter(globalFilters),
                        limitViolationsTypes:
                            tabIndex === 0 ? [LimitTypes.CURRENT] : [LimitTypes.HIGH_VOLTAGE, LimitTypes.LOW_VOLTAGE],
                    },
                }),
            });
        },
        [tabIndex, filters, intl, sortConfig, getGlobalFilterParameter, globalFilters]
    );

    const fetchloadflowResultWithParameters = useMemo(() => {
        return (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) =>
            fetchLoadFlowResult(studyUuid, nodeUuid, currentRootNetworkUuid, {
                sort: sortConfig,
                filters,
            });
    }, [sortConfig, filters]);

    const fetchResult = useMemo(() => {
        if (tabIndex === 0 || tabIndex === 1) {
            return fetchLimitViolationsWithParameters;
        } else if (tabIndex === 2) {
            return fetchloadflowResultWithParameters;
        }
    }, [tabIndex, fetchLimitViolationsWithParameters, fetchloadflowResultWithParameters]);

    const {
        result: loadflowResult,
        isLoading: isLoadingResult,
        setResult,
    } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid: currentRootNetworkUuid,
        fetcher: fetchResult,
        invalidations: loadflowResultInvalidations,
    });

    const SubjectIdRenderer = useCallback(
        (props: ICellRendererParams) => {
            const { value, node, colDef } = props || {};
            const onClick = () => {
                const row: OverloadedEquipment = { ...node?.data };
                onLinkClick(row, colDef);
            };
            if (value) {
                return (
                    <Tooltip title={value}>
                        <Button sx={resultsStyles.sldLink} onClick={onClick}>
                            {value}
                        </Button>
                    </Tooltip>
                );
            }
        },
        [onLinkClick]
    );

    const loadFlowLimitViolationsColumns = useMemo(() => {
        switch (tabIndex) {
            case 0:
                return loadFlowCurrentViolationsColumnsDefinition(
                    intl,
                    filterEnums,
                    getEnumLabel,
                    tabIndex,
                    SubjectIdRenderer
                );
            case 1:
                return loadFlowVoltageViolationsColumnsDefinition(
                    intl,
                    filterEnums,
                    getEnumLabel,
                    tabIndex,
                    SubjectIdRenderer
                );
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
    }, [tabIndex, intl, filterEnums, getEnumLabel, SubjectIdRenderer]);

    const resetResultStates = useCallback(() => {
        setResult(null);
    }, [setResult]);

    const handleTabChange = (_event: SyntheticEvent, newTabIndex: number) => {
        resetResultStates();
        setTabIndex(newTabIndex);
    };

    const result = useMemo(() => {
        if (!loadflowResult) {
            return [];
        }
        if (tabIndex === 0 || tabIndex === 1) {
            return makeData(loadflowResult, intl);
        }
        return loadflowResult;
    }, [tabIndex, loadflowResult, intl]);

    const filterableEquipmentTypes: EQUIPMENT_TYPES[] = useMemo(() => {
        switch (tabIndex) {
            case 0:
                return [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER, EQUIPMENT_TYPES.LINE];
            case 1:
                return [EQUIPMENT_TYPES.VOLTAGE_LEVEL];
        }
        return [];
    }, [tabIndex]);

    const globalFilterOptions = useMemo(
        () => [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter],
        [voltageLevelsFilter, countriesFilter, propertiesFilter]
    );

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
                    <GlobalFilterSelector
                        onChange={handleGlobalFilterChange}
                        filters={globalFilterOptions}
                        filterableEquipmentTypes={filterableEquipmentTypes}
                        genericFiltersStrictMode={true}
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
