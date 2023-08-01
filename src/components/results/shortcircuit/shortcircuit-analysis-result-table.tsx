/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useTheme } from '@mui/styles';
import { unitToKiloUnit } from 'utils/rounding';
import { ShortcircuitAnalysisResult } from './shortcircuit-analysis-result.type';
import {
    GridReadyEvent,
    IRowNode,
    PostSortRowsParams,
    RowClassParams,
} from 'ag-grid-community';
import { GridStudyTheme } from 'components/app-wrapper.type';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';

interface ShortCircuitAnalysisResultProps {
    result: ShortcircuitAnalysisResult;
}

type ShortCircuitAnalysisAGGridResult =
    | ShortCircuitAnalysisResultsFaultHeader
    | ShortCircuitAnalysisResultsLimitViolation
    | ShortCircuitAnalysisResultsFeederResult;

interface ShortCircuitAnalysisResultsFaultHeader {
    faultId: string;
    elementId: string;
    faultType: string;
    shortCircuitPower: number;
    current: number;
    limitType?: string | null;
    limitMin?: number | null;
    limitMax?: number | null;
    limitName?: string;
    deltaIscIscMax?: number | null;
    deltaIscIscMin?: number | null;
}

interface ShortCircuitAnalysisResultsLimitViolation {
    current: number;
    limitType?: string | null;
    limitMin?: number | null;
    limitMax?: number | null;
    limitName?: string;
}

interface ShortCircuitAnalysisResultsFeederResult {
    connectableId: string;
    current: number;
    linkedElementId: string;
}

const ShortCircuitAnalysisResult: FunctionComponent<
    ShortCircuitAnalysisResultProps
> = ({ result }) => {
    const intl = useIntl();
    const theme: GridStudyTheme = useTheme();

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

    const groupPostSort = (
        sortedRows: IRowNode[],
        idField: string,
        linkedIdField: string
    ) => {
        // Because Map remembers the original insertion order of the keys.
        const rowsMap = new Map<string, IRowNode[]>();
        // first index by main resource idField
        sortedRows.forEach((row) => {
            if (row.data[idField] != null) {
                rowsMap.set(row.data[idField], [row]);
            }
        });

        // then index by linked resource linkedIdField
        let currentRows;
        sortedRows.forEach((row) => {
            if (row.data[idField] == null) {
                currentRows = rowsMap.get(row.data[linkedIdField]);
                if (currentRows) {
                    currentRows.push(row);
                    rowsMap.set(row.data[linkedIdField], currentRows);
                }
            }
        });
        return [...rowsMap.values()].flat();
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
        const rows: ShortCircuitAnalysisAGGridResult[] = [];
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
                    (unitToKiloUnit(faultResult.shortCircuitLimits.ipMax) ?? 0),
                deltaIscIscMin:
                    faultResult.current -
                    (unitToKiloUnit(faultResult.shortCircuitLimits.ipMin) ?? 0),
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

        return (
            <CustomAGGrid
                rowData={rows}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                getRowStyle={getRowStyle}
                enableCellTextSelection={true}
                postSortRows={handlePostSortRows}
                columnDefs={columns}
            />
        );
    };

    return <>{renderResult()}</>;
};

export default ShortCircuitAnalysisResult;
