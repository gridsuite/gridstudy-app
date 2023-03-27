/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { DEFAULT_SORT_ORDER } from './spreadsheet/utils/config-tables';
import { makeStyles, useTheme } from '@mui/styles';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import clsx from 'clsx';
import { groupPostSort, groupSort } from './util/sort-functions';

const useStyles = makeStyles((theme) => ({
    grid: {
        width: 'auto',
        height: '100%',
        position: 'relative',

        //overrides the default computed max heigt for ag grid default selector editor to make it more usable
        //can be removed if a custom selector editor is implemented
        '& .ag-select-list': {
            maxHeight: '300px !important',
        },
    },
}));

const ShortCircuitAnalysisResult = ({ result }) => {
    const intl = useIntl();

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

    const theme = useTheme();
    const GRID_PREFIX = 'grid.';
    const classes = useStyles();

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
                filter: true,
            },

            {
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
            },

            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
            },

            {
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                // numeric: true,
                // nullable: true,
                // fractionDigits: 1,
            },
            {
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                // numeric: true,
                // nullable: true,
                // fractionDigits: 1,
            },
            {
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                // numeric: true,
                // fractionDigits: 1,
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

    const getLocaleText = useCallback(
        (params) => {
            const key = GRID_PREFIX + params.key;
            return intl.messages[key] || params.defaultValue;
        },
        [intl]
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
                    linkedElementId: fault.elementId,
                });
            });
        });
        return rows;
    }

    function renderResult() {
        const rows = flattenResult(result);

        return (
            result &&
            shortCircuitNotif && (
                <AgGridReact
                    rowData={rows}
                    defaultColDef={{ sortable: true }}
                    columnDefs={columns}
                    getLocaleText={getLocaleText}
                    getRowStyle={getRowStyle}
                    postSortRows={(params) => {
                        const rows = params.nodes;

                        Object.assign(
                            rows,
                            groupPostSort(rows, 'elementId', 'linkedElementId')
                        );
                    }}
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
