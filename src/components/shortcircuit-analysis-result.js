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
import { CustomAGGrid } from './dialogs/custom-aggrid';
import { useTheme } from '@mui/styles';
import { unitToKiloUnit } from '../utils/rounding';

const ShortCircuitAnalysisResult = ({ result }) => {
    const intl = useIntl();
    const theme = useTheme();

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

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
            {
                headerName: intl.formatMessage({ id: 'DeltaIscIscMax' }),
                field: 'deltaIscIscMax',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'DeltaIscIscMin' }),
                field: 'deltaIscIscMin',
                fractionDigits: 1,
                numeric: true,
            },
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [intl]);

    const groupPostSort = (sortedRows, idField, linkedIdField) => {
        const result = [];
        const idRows = sortedRows.filter((row) => row.data[idField] != null);
        idRows.forEach((idRow) => {
            result.push(idRow);
            result.push(
                ...sortedRows.filter(
                    (row) => row.data[linkedIdField] === idRow.data[idField]
                )
            );
        });

        return result;
    };
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

    function flattenResult(shortCircuitAnalysisResult) {
        const rows = [];
        shortCircuitAnalysisResult?.faults?.forEach((faultResult) => {
            const fault = faultResult.fault;
            const limitViolations = faultResult.limitViolations;
            let firstLimitViolation;
            if (limitViolations.length > 0) {
                let lv = limitViolations[0];
                firstLimitViolation = {
                    limitType: intl.formatMessage({
                        id: lv.limitType,
                    }),
                    limitName: lv.limitName,
                };
            }
            rows.push({
                faultId: fault.id,
                elementId: fault.elementId,
                faultType: intl.formatMessage({ id: fault.faultType }),
                shortCircuitPower: faultResult.shortCircuitPower,
                limitMin: unitToKiloUnit(faultResult.shortCircuitLimits.ipMin),
                limitMax: unitToKiloUnit(faultResult.shortCircuitLimits.ipMax),
                deltaIscIscMax:
                    faultResult.current -
                    unitToKiloUnit(faultResult.shortCircuitLimits.ipMax),
                deltaIscIscMin:
                    faultResult.current -
                    unitToKiloUnit(faultResult.shortCircuitLimits.ipMin),
                current: faultResult.current,
                ...firstLimitViolation,
            });
            limitViolations.slice(1).forEach((lv) => {
                rows.push({
                    limitType: intl.formatMessage({
                        id: lv.limitType,
                    }),
                    limitMin:
                        lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                            ? unitToKiloUnit(lv.limit)
                            : null,
                    limitMax:
                        lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                            ? unitToKiloUnit(lv.limit)
                            : null,
                    limitName: lv.limitName,
                    current: lv.value,
                });
            });
            const feederResults = faultResult.feederResults;
            feederResults.forEach((feederResult) => {
                rows.push({
                    connectableId: feederResult.connectableId,
                    current: feederResult.current,
                    linkedElementId: fault.id,
                });
            });
        });
        return rows;
    }

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            resizable: true,
            sortable: true,
            autoHeaderHeight: true,
            flex: 1,
        }),
        []
    );

    const onGridReady = useCallback((params) => {
        if (params?.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);
    const handlePostSortRows = useCallback((params) => {
        const rows = params.nodes;
        Object.assign(
            rows,
            groupPostSort(rows, 'elementId', 'linkedElementId')
        );
    }, []);

    const renderResult = () => {
        const rows = flattenResult(result);

        return (
            result &&
            shortCircuitNotif && (
                <CustomAGGrid
                    rowData={rows}
                    columnDefs={columns}
                    getRowStyle={getRowStyle}
                    onGridReady={onGridReady}
                    enableCellTextSelection={true}
                    postSortRows={handlePostSortRows}
                    defaultColDef={defaultColDef}
                />
            )
        );
    };

    return renderResult();
};

ShortCircuitAnalysisResult.defaultProps = {
    result: null,
};

ShortCircuitAnalysisResult.propTypes = {
    result: PropTypes.object,
};

export default ShortCircuitAnalysisResult;
