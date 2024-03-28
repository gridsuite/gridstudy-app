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
    useEffect,
    useMemo,
    useState,
} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
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
import { SortWay, useAgGridSort } from 'hooks/use-aggrid-sort';
import { useAggridRowFilter } from 'hooks/use-aggrid-row-filter';
import {
    FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT,
    getIdType,
    loadFlowCurrentViolationsColumnsDefinition,
    loadFlowResultColumnsDefinition,
    loadFlowVoltageViolationsColumnsDefinition,
    makeData,
    mappingFields,
    mappingTabs,
    useFetchFiltersEnums,
} from './load-flow-result-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
} from 'components/custom-aggrid/custom-aggrid-header.type';
import { LimitViolationResult } from './limit-violation-result';
import { mapFieldsToColumnsFilter } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { setLoadflowResultFilter } from 'redux/actions';
import {
    NumberCellRenderer,
    StatusCellRender,
} from '../common/result-cell-renderers';
import ResultsGlobalFilter from '../common/results-global-filter';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { fetchAllCountries } from '../../../services/study/network-map';
import { LOADFLOW_RESULT_STORE_FIELD } from 'utils/store-filter-fields';

export const LoadFlowResultTab: FunctionComponent<LoadFlowTabProps> = ({
    studyUuid,
    nodeUuid,
}) => {
    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const loadflowResultInvalidations = ['loadflowResult'];

    const [tabIndex, setTabIndex] = useState(0);
    const [hasFilter, setHasFilter] = useState<boolean>(false);
    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        colId: getIdType(tabIndex),
        sort: SortWay.DESC,
    });

    const { updateFilter, filterSelector } = useAggridRowFilter({
        filterType: LOADFLOW_RESULT_STORE_FIELD,
        filterTab: mappingTabs(tabIndex),
        filterStoreAction: setLoadflowResultFilter,
    });
    const mapEquipments = useSelector((state) => state.mapEquipments);
    const [countriesFilter, setCountriesFilter] = useState([]);
    const [voltageLevelsFilter, setVoltageLevelsFilter] = useState([]);
    const [globalFilters, setGlobalFilters] = useState(undefined);

    const { loading: filterEnumsLoading, result: filterEnums } =
        useFetchFiltersEnums(hasFilter, setHasFilter);

    // load countries
    useEffect(() => {
        fetchAllCountries(studyUuid, nodeUuid)
            .then((countryCodes) => {
                setCountriesFilter(
                    countryCodes.map((countryCode) => ({
                        label: countryCode,
                        filterType: 'country',
                    }))
                );
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'DynamicSimulationFetchCountryError',
                });
            });
    }, [nodeUuid, studyUuid, snackError]);

    // load voltage levels
    useEffect(() => {
        const voltageLevels = mapEquipments.getVoltageLevels();
        const nominalVs = voltageLevels.map((element) =>
            element.nominalV?.toString()
        );
        const uniqueNominalV = [...new Set(nominalVs)];

        setVoltageLevelsFilter(
            uniqueNominalV.map((nominalV) => ({
                label: nominalV,
                filterType: 'voltageLevel',
            }))
        );
    }, [mapEquipments]);

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
        let updatedGlobalFilters = undefined;
        if (globalFilters && Object.keys(globalFilters).length > 0) {
            updatedGlobalFilters = {
                ...globalFilters,
                limitViolationsType:
                    tabIndex === 0 ? LimitTypes.CURRENT : 'VOLTAGE',
            };
        }

        return fetchLimitViolations(studyUuid, nodeUuid, {
            sort: sortConfig.map((sort) => ({
                ...sort,
                colId: FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT[sort.colId],
            })),
            filters: mapFieldsToColumnsFilter(
                updatedFilters,
                mappingFields(tabIndex)
            ),
            globalFilters: updatedGlobalFilters,
        });
    }, [
        studyUuid,
        nodeUuid,
        sortConfig,
        filterSelector,
        tabIndex,
        globalFilters,
    ]);

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
                    NumberCellRenderer
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
    ]);

    const resetResultStates = useCallback(
        (defaultSortColKey: string) => {
            setResult(null);
            if (initSort) {
                initSort(defaultSortColKey);
            }
        },
        [initSort, setResult]
    );

    const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
        resetResultStates(getIdType(newTabIndex));
        setTabIndex(newTabIndex);
    };

    const handleGlobalFilterChange = (value: any) => {
        let formattedData;
        if (value) {
            // We update the format of the filter to reflect the DTO in the backend
            formattedData = value.reduce((accumulator, currentItem) => {
                const { label, filterType } = currentItem;
                let key;
                if (filterType === 'voltageLevel') {
                    key = 'nominalV';
                } else {
                    key = 'countryCode';
                }
                if (!accumulator[key]) {
                    accumulator[key] = [];
                }
                accumulator[key].push(label);
                return accumulator;
            }, {});
        }
        setGlobalFilters(formattedData);
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
            <Box sx={{ display: 'flex' }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    sx={{ flexGrow: 0 }}
                >
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
                <Box sx={{ flexGrow: 0 }}>
                    <ResultsGlobalFilter
                        onChange={handleGlobalFilterChange}
                        filters={[...countriesFilter, ...voltageLevelsFilter]}
                    />
                </Box>
                {isLoadingResult && (
                    /* TODO update this : we have to add a glasspane and big spinner over the results. */ <Box
                        sx={{ backgroundColor: 'red', color: 'white' }}
                    >
                        LOADING
                    </Box>
                )}
                <Box sx={{ flexGrow: 1 }}></Box>
            </Box>

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
