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
import { mergeSx } from '@gridsuite/commons-ui';
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
import { UUID } from 'crypto';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { useGlobalFilterData } from '../common/global-filter/use-global-filter-data';

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
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(0);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[LOADFLOW_RESULT_SORT_STORE][mappingTabs(tabIndex)]
    );

    const { filters } = useFilterSelector(AgGridFilterType.Loadflow, mappingTabs(tabIndex));

    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterData();
    const [globalFilter, setGlobalFilter] = useState<GlobalFilters>();

    const { loading: filterEnumsLoading, result: filterEnums } = useFetchFiltersEnums();

    const getGlobalFilterParameter = useCallback(
        (globalFilter: GlobalFilters | undefined) => {
            let shouldSentParameter = false;
            if (globalFilter) {
                if (
                    (globalFilter.countryCode && globalFilter.countryCode.length > 0) ||
                    (globalFilter.nominalV && globalFilter.nominalV.length > 0) ||
                    (globalFilter.genericFilter && globalFilter.genericFilter.length > 0) ||
                    globalFilter.substationProperty
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
                globalFilters: getGlobalFilterParameter(globalFilter),
            });
        },
        [tabIndex, filters, intl, sortConfig, getGlobalFilterParameter, globalFilter]
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
            // extract the substation properties and sort them by property name (ie filterSubtype)
            const substationProperties: Map<string, string[]> = new Map();
            value
                .filter((filter: GlobalFilter) => filter.filterType === FilterType.SUBSTATION_PROPERTY)
                .forEach((filter: GlobalFilter) => {
                    if (filter.filterSubtype) {
                        const subtypeSubstationProperties = substationProperties.get(filter.filterSubtype);
                        if (subtypeSubstationProperties) {
                            subtypeSubstationProperties.push(filter.label);
                        } else {
                            substationProperties.set(filter.filterSubtype, [filter.label]);
                        }
                    }
                });

            newGlobalFilter.nominalV = [...nominalVs];
            newGlobalFilter.countryCode = [...countryCodes];
            newGlobalFilter.genericFilter = [...genericFilters];
            if (substationProperties.size > 0) {
                newGlobalFilter.substationProperty = Object.fromEntries(substationProperties);
            }
        }
        setGlobalFilter(newGlobalFilter);
    }, []);

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
                return [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER, EQUIPMENT_TYPES.LINE, EQUIPMENT_TYPES.VOLTAGE_LEVEL];
            case 1:
                return [EQUIPMENT_TYPES.VOLTAGE_LEVEL];
        }
        return [];
    }, [tabIndex]);

    const globalFilters = useMemo(
        () => (
            <GlobalFilterSelector
                onChange={handleGlobalFilterChange}
                filters={[...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter]}
                filterableEquipmentTypes={filterableEquipmentTypes}
            />
        ),
        [countriesFilter, filterableEquipmentTypes, handleGlobalFilterChange, voltageLevelsFilter, propertiesFilter]
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
                    {globalFilters}
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
