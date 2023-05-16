/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { CustomAGGrid } from './dialogs/custom-aggrid';
import { useTheme } from '@mui/styles';
import { FilterPanel } from './spreadsheet/filter-panel/filter-panel';
import { Box } from '@mui/system';
import {
    FILTER_TARGET,
    FILTER_TYPE,
    useGroupFilter,
} from './spreadsheet/filter-panel/use-group-filter';
import { SearchBar } from './spreadsheet/search-bar/search-bar';
import { useSearchBar } from './spreadsheet/search-bar/use-search-bar';

const ShortCircuitAnalysisResult = ({ result }) => {
    const intl = useIntl();
    const theme = useTheme();
    const gridRef = useRef();
    const [searchBarOpen, setSearchBarOpen] = useState(false);

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

    useEffect(() => {
        const openSearch = (e) => {
            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                setSearchBarOpen(true);
            }
        };
        document.addEventListener('keydown', openSearch);
        return () => document.removeEventListener('keydown', openSearch);
    }, []);

    const filtersDef = useMemo(
        () => [
            {
                field: 'elementId',
                label: intl.formatMessage({ id: 'IDNode' }),
                type: FILTER_TYPE.TEXT,
                target: FILTER_TARGET.PARENT,
            },
            {
                field: 'faultType',
                label: intl.formatMessage({ id: 'Type' }),
                type: FILTER_TYPE.SELECT,
                options: [intl.formatMessage({ id: 'THREE_PHASE' })],
                target: FILTER_TARGET.PARENT,
            },
            {
                field: 'connectableId',
                label: intl.formatMessage({ id: 'Feeders' }),
                type: FILTER_TYPE.TEXT,
                target: FILTER_TARGET.CHILD,
            },
            {
                field: 'limitType',
                label: intl.formatMessage({ id: 'LimitType' }),
                type: FILTER_TYPE.SELECT,
                options: [
                    intl.formatMessage({ id: 'LOW_SHORT_CIRCUIT_CURRENT' }),
                    intl.formatMessage({ id: 'HIGH_SHORT_CIRCUIT_CURRENT' }),
                ],
                target: FILTER_TARGET.PARENT,
            },
        ],
        [intl]
    );

    const { filterResult, updateFilter } = useGroupFilter(
        filtersDef,
        'elementId',
        'parentElementId'
    );

    const columns = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'IDNode' }),
                field: 'elementId',
            },
            {
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'faultType',
            },
            {
                headerName: intl.formatMessage({ id: 'Feeders' }),
                field: 'connectableId',
            },
            {
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
            },
            {
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                fractionDigits: 1,
                numeric: true,
            },
        ];
    }, [intl]);

    const getRowStyle = useCallback(
        (params) => {
            if (params?.data?.elementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    const flattenResult = useCallback(
        (shortcutAnalysisResult) => {
            const rows = [];
            shortcutAnalysisResult?.faults?.forEach((f) => {
                const fault = f.fault;
                const limitViolations = f.limitViolations;
                let firstLimitViolation;
                if (limitViolations.length > 0) {
                    let lv = limitViolations[0];
                    firstLimitViolation = {
                        limitType: intl.formatMessage({
                            id: lv.limitType,
                        }),
                        limitMin:
                            lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                                ? lv.limit
                                : null,
                        limitMax:
                            lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                                ? lv.limit
                                : null,
                        limitName: lv.limitName,
                        current: lv.value,
                    };
                }
                rows.push({
                    faultId: fault.id,
                    elementId: fault.elementId,
                    faultType: intl.formatMessage({ id: fault.faultType }),
                    shortCircuitPower: f.shortCircuitPower,
                    current: f.current,
                    ...firstLimitViolation,
                });
                limitViolations.slice(1).forEach((lv) => {
                    rows.push({
                        limitType: intl.formatMessage({
                            id: lv.limitType,
                        }),
                        limitMin:
                            lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                                ? lv.limit
                                : null,
                        limitMax:
                            lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                                ? lv.limit
                                : null,
                        limitName: lv.limitName,
                        current: lv.value,
                    });
                });
                const feederResults = f.feederResults;
                feederResults.forEach((fr) => {
                    rows.push({
                        connectableId: fr.connectableId,
                        current: fr.current,
                        parentElementId: fault.elementId,
                    });
                });
            });
            return rows;
        },
        [intl]
    );

    const defaultColDef = useMemo(
        () => ({
            //suppressMovable: true,
            sortable: true,
            filter: true,
        }),
        []
    );

    const filteredFlattenedResults = useMemo(
        () => filterResult(flattenResult(result)),
        [result, filterResult, flattenResult]
    );

    const {
        calculateSearchBarResults,
        focusCell,
        searchInput,
        setSearchInput,
        searchResult,
    } = useSearchBar(gridRef);

    useEffect(() => {
        calculateSearchBarResults();
    }, [filteredFlattenedResults, searchInput, calculateSearchBarResults]);

    const renderResult = () => {
        return (
            result &&
            shortCircuitNotif && (
                <CustomAGGrid
                    ref={gridRef}
                    rowData={filteredFlattenedResults}
                    columnDefs={columns}
                    getRowStyle={getRowStyle}
                    defaultColDef={defaultColDef}
                    onSortChanged={calculateSearchBarResults}
                    onFilterChanged={calculateSearchBarResults}
                    onColumnMoved={calculateSearchBarResults}
                />
            )
        );
    };

    return (
        <>
            <Box m={1}>
                <FilterPanel
                    updateFilter={updateFilter}
                    filtersDef={filtersDef}
                />
            </Box>
            {renderResult()}
            {searchBarOpen && (
                <SearchBar
                    searchResult={searchResult}
                    setSearchInput={(value) => {
                        setSearchInput(value);
                    }}
                    searchInput={searchInput}
                    focusCellCallback={focusCell}
                    onClose={() => setSearchBarOpen(false)}
                />
            )}
        </>
    );
};

ShortCircuitAnalysisResult.defaultProps = {
    result: null,
};

ShortCircuitAnalysisResult.propTypes = {
    result: PropTypes.object,
};

export default ShortCircuitAnalysisResult;
