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
import { Button } from '@mui/material';
import { Box } from '@mui/system';

const ShortCircuitAnalysisResult = ({ result }) => {
    const intl = useIntl();
    const theme = useTheme();

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

    const [filters, setFilters] = useState([]);

    const filtersDef = [
        {
            field: 'limitType',
            type: 'select',
            options: ['Isc max', 'Isc min'],
        },
        {
            field: 'faultType',
            type: 'select',
            options: ['Three-phase'],
        },
        {
            field: 'elementId',
            type: 'text',
        },
        {
            field: 'connectableId',
            type: 'text',
        },
    ];

    const updateFilter = (field, value) => {
        if (value && value.length > 0) {
            setFilters((oldFilters) => {
                const filterIndex = oldFilters.findIndex(
                    (f) => f.field === field
                );
                if (filterIndex === -1) {
                    oldFilters.push({
                        field: field,
                        value: value,
                    });
                } else {
                    oldFilters[filterIndex].value = value;
                }
                return [...oldFilters];
            });
        } else {
            setFilters((oldFilters) => {
                const filterIndex = oldFilters.findIndex(
                    (f) => f.field === field
                );
                oldFilters.splice(filterIndex, 1);
                return [...oldFilters];
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
        console.log('RESULT', shortcutAnalysisResult);
        if (shortcutAnalysisResult == null || filters == undefined) {
            return shortcutAnalysisResult;
        }

        return filters.reduce(
            (currentFilteredShortcutAnalysisResult, filter) => {
                return currentFilteredShortcutAnalysisResult.filter((sc) =>
                    sc?.[filter.field]?.includes(filter?.value)
                );
            },
            shortcutAnalysisResult
        );

        // return shortcutAnalysisResult.filter((sc) =>
        //     sc?.[filters.field]?.includes(filters.value)
        // );
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
