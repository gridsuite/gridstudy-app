/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { CustomAGGrid } from './dialogs/custom-aggrid';
import { useTheme } from '@mui/styles';
import { FilterPanel } from './spreadsheet/filter-panel/filter-panel';
import { Box } from '@mui/system';

const ShortCircuitAnalysisResult = ({ result }) => {
    const intl = useIntl();
    const theme = useTheme();

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);
    const [filters, setFilters] = useState({
        childrenFilters: [],
        parentFilters: [],
    });

    const filtersDef = [
        {
            field: 'limitType',
            type: 'select',
            options: ['Isc max', 'Isc min'],
            target: 'parent',
        },
        {
            field: 'faultType',
            type: 'select',
            options: ['Three-phase'],
            target: 'parent',
        },
        {
            field: 'elementId',
            type: 'text',
            target: 'parent',
        },
        {
            field: 'connectableId',
            type: 'text',
            target: 'children',
        },
    ];

    const groupBy = (array, key) => {
        return array.reduce(function (result, object) {
            result[object[key]] = result[object[key]] || [];
            result[object[key]].push(object);
            return result;
        }, Object.create(null));
    };

    console.log('FILTERS', filters);

    const updateFilter = (field, value) => {
        const isParentFilter =
            filtersDef.find((filter) => field === filter.field).target ===
            'parent';

        console.log('ISPARENT', isParentFilter);
        if (value && value.length > 0) {
            setFilters((oldFilters) => {
                if (isParentFilter) {
                    const parentFilters = oldFilters.parentFilters;
                    const filterIndex = parentFilters.findIndex(
                        (f) => f.field === field
                    );
                    if (filterIndex === -1) {
                        parentFilters.push({
                            field: field,
                            value: value,
                        });
                    } else {
                        parentFilters[filterIndex].value = value;
                    }
                    return { ...oldFilters, parentFilters: [...parentFilters] };
                } else {
                    const childrenFilters = oldFilters.childrenFilters;
                    const filterIndex = childrenFilters.findIndex(
                        (f) => f.field === field
                    );
                    if (filterIndex === -1) {
                        childrenFilters.push({
                            field: field,
                            value: value,
                        });
                    } else {
                        childrenFilters[filterIndex].value = value;
                    }
                    return {
                        ...oldFilters,
                        childrenFilters: [...childrenFilters],
                    };
                }
            });
        } else {
            setFilters((oldFilters) => {
                if (isParentFilter) {
                    const parentFilters = oldFilters.parentFilters;

                    const filterIndex = parentFilters.findIndex(
                        (f) => f.field === field
                    );
                    parentFilters.splice(filterIndex, 1);
                    return { ...oldFilters, parentFilters: [...parentFilters] };
                } else {
                    const childrenFilters = oldFilters.childrenFilters;

                    const filterIndex = childrenFilters.findIndex(
                        (f) => f.field === field
                    );
                    childrenFilters.splice(filterIndex, 1);
                    return {
                        ...oldFilters,
                        childrenFilters: [...childrenFilters],
                    };
                }
            });
        }
    };

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

    const filterResult = (shortcutAnalysisResult) => {
        if (shortcutAnalysisResult == null || filters == undefined) {
            return shortcutAnalysisResult;
        }

        const childrenRows = shortcutAnalysisResult.filter(
            (sc) => sc?.parentElementId != undefined
        );

        const filteredChidrenRows = filters.childrenFilters.reduce(
            (childrenRowsResult, filter) => {
                return childrenRowsResult.filter((sc) =>
                    sc?.[filter.field]?.includes(filter?.value)
                );
            },
            childrenRows
        );

        const childrenRowsGroupedByParent = groupBy(
            filteredChidrenRows,
            'parentElementId'
        );

        const parentRows = shortcutAnalysisResult.filter(
            (sc) => sc?.parentElementId == undefined
        );
        const filteredParentRows = filters.parentFilters.reduce(
            (parentRowsResult, filter) => {
                return parentRowsResult.filter((sc) =>
                    sc?.[filter.field]?.includes(filter?.value)
                );
            },
            parentRows
        );

        return filteredParentRows.reduce((result, currentParent) => {
            const childrenOfCurrentParent =
                childrenRowsGroupedByParent[currentParent.elementId];
            if (childrenOfCurrentParent != undefined) {
                result.push(currentParent);
                return result.concat(childrenOfCurrentParent);
            }
            return result;
        }, []);
    };

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
    }

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
        }),
        []
    );

    const renderResult = () => {
        console.log('BEFORE', result);
        const rows = filterResult(flattenResult(result));

        return (
            result &&
            shortCircuitNotif && (
                <CustomAGGrid
                    rowData={rows}
                    columnDefs={columns}
                    getRowStyle={getRowStyle}
                    defaultColDef={defaultColDef}
                />
            )
        );
    };

    return (
        <>
            <Box m={2}>
                Filters
                <FilterPanel
                    updateFilter={updateFilter}
                    filtersDef={filtersDef}
                />
            </Box>
            {renderResult()}
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
