/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { CustomAGGrid } from 'components/dialogs/custom-aggrid';
import { useTheme } from '@mui/styles';
import { unitToKiloUnit } from 'utils/rounding';
import { ShortcircuitAnalysisResult } from './shortcircuit-analysis-result.type';
import { ReduxState } from 'redux/reducer.type';
import { AgGridReactProps } from 'ag-grid-react';
import {
    GridReadyEvent,
    IRowNode,
    PostSortRowsParams,
    RowClassParams,
} from 'ag-grid-community';

interface ShortCircuitAnalysisResultProps {
    result: ShortcircuitAnalysisResult;
}

const ShortCircuitAnalysisResult: FunctionComponent<
    ShortCircuitAnalysisResultProps
> = ({ result }) => {
    const intl = useIntl();
    const theme: any = useTheme();

    const shortCircuitNotif = useSelector(
        (state: ReduxState) => state.shortCircuitNotif
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
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [intl]);

    const groupPostSort = (
        sortedRows: IRowNode[],
        idField: string,
        linkedIdField: string
    ) => {
        const result: IRowNode[] = [];
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
        (params: RowClassParams) => {
            if (!params?.data?.linkedElementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    function flattenResult(
        shortCircuitAnalysisResult: ShortcircuitAnalysisResult
    ) {
        const rows: (
            | {
                  faultId: string;
                  elementId: string;
                  faultType: string;
                  shortCircuitPower: number;
                  current: number;
                  limitType?: string | null;
                  limitMin?: number | null;
                  limitMax?: number | null;
                  limitName?: string;
              }
            | {
                  current: number;
                  limitType?: string | null;
                  limitMin?: number | null;
                  limitMax?: number | null;
                  limitName?: string;
              }
            | {
                  connectableId: string;
                  current: number;
                  linkedElementId: string;
              }
        )[] = [];
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
                    limitMin:
                        lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                            ? unitToKiloUnit(lv.limit)
                            : null,
                    limitMax:
                        lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                            ? unitToKiloUnit(lv.limit)
                            : null,
                    limitName: lv.limitName,
                };
            }
            rows.push({
                faultId: fault.id,
                elementId: fault.elementId,
                faultType: intl.formatMessage({ id: fault.faultType }),
                shortCircuitPower: faultResult.shortCircuitPower,
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

    const onGridReady = useCallback((params: GridReadyEvent) => {
        if (params?.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);
    const handlePostSortRows = useCallback((params: PostSortRowsParams) => {
        const rows = params.nodes;
        Object.assign(
            rows,
            groupPostSort(rows, 'elementId', 'linkedElementId')
        );
    }, []);

    const renderResult = () => {
        const rows = flattenResult(result);

        const aggridProps: AgGridReactProps = {
            columnDefs: columns,
            getRowStyle: getRowStyle,
            defaultColDef: defaultColDef,
            onGridReady: onGridReady,
            enableCellTextSelection: true,
            postSortRows: handlePostSortRows,
        };

        return (
            result &&
            shortCircuitNotif && (
                <CustomAGGrid rowData={rows} {...aggridProps} ref={null} />
            )
        );
    };

    return <>{renderResult()}</>;
};

export default ShortCircuitAnalysisResult;
