/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { makeStyles, useTheme } from '@mui/styles';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import clsx from 'clsx';
import { groupPostSort } from './util/sort-functions';

const useStyles = makeStyles(() => ({
    grid: {
        width: 'auto',
        height: '100%',
        position: 'relative',
    },
}));

const FILTER_TYPES = {
    PARENT: 'parent',
    CHILD: 'child',
};

export const FilteringRenderer = (props) => {
    if (props.colDef.filterType === FILTER_TYPES.CHILD) {
        return !props.data.linkedElementId ? undefined : props.value;
    } else if (props.colDef.filterType === FILTER_TYPES.PARENT) {
        return props.data.linkedElementId ? undefined : props.value;
    }
};

const ShortCircuitAnalysisResult = ({ result }) => {
    const intl = useIntl();
    const gridRef = useRef();

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

    const theme = useTheme();
    const GRID_PREFIX = 'grid.';
    const classes = useStyles();

    const columns = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'IDNode' }),
                field: 'elementId',
                cellRenderer: FilteringRenderer,
                filter: true,
                filterType: FILTER_TYPES.PARENT,
            },
            {
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'faultType',
                cellRenderer: FilteringRenderer,
                filter: true,
                filterType: FILTER_TYPES.PARENT,
            },
            {
                headerName: intl.formatMessage({ id: 'Feeders' }),
                field: 'connectableId',
                //cellRenderer: FilteringRenderer,
                filter: true,
                filterParams: {
                    filterOptions: ['contains', 'startsWith', 'endsWith'],
                },
                filterType: FILTER_TYPES.CHILD,
            },

            {
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
                cellRenderer: FilteringRenderer,
                filter: true,
                filterType: FILTER_TYPES.PARENT,
            },

            {
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                cellRenderer: FilteringRenderer,
                filter: 'agNumberColumnFilter',
                filterType: FILTER_TYPES.PARENT,
            },
            {
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                cellRenderer: FilteringRenderer,
                filter: 'agNumberColumnFilter',
                filterType: FILTER_TYPES.PARENT,
            },
            {
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                cellRenderer: FilteringRenderer,
                filter: 'agNumberColumnFilter',
                filterType: FILTER_TYPES.PARENT,
            },
            //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
            //it is used for sorting and filtering actions
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [intl]);

    const getRowStyle = useCallback(
        (params) => {
            if (!params?.data?.linkedElementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    const getLocaleText = useCallback(
        (params) => {
            const key = GRID_PREFIX + params.key;
            return intl.messages[key] || params.defaultValue;
        },
        [intl]
    );

    //TODO: this method does not work in the case of multiple limit violation, this needs to be fixed
    const handlePostSortRows = useCallback((params) => {
        const rows = params.nodes;
        Object.assign(
            rows,
            groupPostSort(rows, 'elementId', 'linkedElementId')
        );
    }, []);

    const isChildRow = (row) => !!row.data.linkedElementId;

    const computeFilterValue = useCallback((filterModel) => {
        if (filterModel.operator) {
            return (
                filterModel.condition1.filter + filterModel.condition2.filter
            );
        } else {
            return filterModel?.filter;
        }
    }, []);

    const applyFilter = useCallback(
        (parentIds, filteringColumn, filterValue) => {
            const filterType =
                gridRef.current.columnApi.getColumn(filteringColumn).colDef
                    .filterType;

            gridRef.current?.api?.forEachNode((node) => {
                if (filterType === FILTER_TYPES.CHILD && !isChildRow(node)) {
                    if (parentIds.includes(node.data.faultId)) {
                        node.setDataValue(filteringColumn, filterValue);
                    }
                } else if (
                    filterType === FILTER_TYPES.PARENT &&
                    isChildRow(node)
                ) {
                    if (parentIds.includes(node.data.linkedElementId)) {
                        node.setDataValue(filteringColumn, filterValue);
                    }
                }
            });

            //we need to refresh the row model after updating rows data in order to reapply the filtering on the updated rows
            gridRef.current.api.refreshClientSideRowModel();
            console.log(gridRef.current.api.getRenderedNodes());
        },
        []
    );

    const handleFilterChanged = useCallback(
        (params) => {
            const filteringColumn = params.columns[0];
            const filterModel = gridRef.current?.api?.getFilterInstance(
                filteringColumn.colId
            ).appliedModel;

            if (filterModel !== null) {
                const filterValue = computeFilterValue(filterModel);

                let parentIds = [];
                //depending on which column we are filtering it is either necessary to gather parents ids through the link column linkedElementId
                //when resulting rows are expected to only be children rows or faultId in the opposite situation
                if (filteringColumn.colDef.filterType === FILTER_TYPES.CHILD) {
                    parentIds = [
                        ...new Set(
                            gridRef.current?.api
                                ?.getRenderedNodes()
                                .filter((node) => node.data.linkedElementId)
                                .map((node) => node.data.linkedElementId)
                        ),
                    ];
                } else if (
                    filteringColumn.colDef.filterType === FILTER_TYPES.PARENT
                ) {
                    parentIds = [
                        ...new Set(
                            gridRef.current?.api
                                ?.getRenderedNodes()
                                .filter((node) => !node.data.linkedElementId)
                                .map((node) => node.data.faultId)
                        ),
                    ];
                }
                applyFilter(parentIds, filteringColumn.colId, filterValue);
            }
        },
        [applyFilter, computeFilterValue]
    );

    function flattenResult(shortcutAnalysisResult) {
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
                elementId: fault.id,
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
                    linkedElementId: fault.id,
                });
            });
        });
        return rows;
    }

    function renderResult() {
        const rowData = flattenResult(result);
        return (
            result &&
            shortCircuitNotif && (
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    defaultColDef={{ sortable: true }}
                    columnDefs={columns}
                    getLocaleText={getLocaleText}
                    getRowStyle={getRowStyle}
                    postSortRows={handlePostSortRows}
                    onFilterChanged={handleFilterChanged}
                    suppressPropertyNamesCheck={true}
                />
            )
        );
    }

    return (
        <div className={clsx([theme.aggrid, classes.grid])}>
            {renderResult()}
        </div>
    );
};

ShortCircuitAnalysisResult.defaultProps = {
    result: null,
};

ShortCircuitAnalysisResult.propTypes = {
    result: PropTypes.object,
};

export default ShortCircuitAnalysisResult;
