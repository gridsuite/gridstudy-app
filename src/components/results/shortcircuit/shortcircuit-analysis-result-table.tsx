/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { unitToKiloUnit } from 'utils/rounding';
import {
    SCAResultFault,
    ShortcircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import {
    GridReadyEvent,
    IRowNode,
    PostSortRowsParams,
    RowClassParams,
} from 'ag-grid-community';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { ReduxState } from '../../../redux/reducer.type';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { ISortConfig } from '../../../hooks/use-aggrid-sort';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';

interface ShortCircuitAnalysisResultProps {
    result: SCAResultFault[];
    onSortChanged: (colKey: string, sortWay: number) => void;
    sortConfig: ISortConfig;
    analysisType: ShortcircuitAnalysisType;
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
    deltaCurrentIpMax?: number | null;
    deltaCurrentIpMin?: number | null;
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

interface ColumnConfig {
    headerName?: string;
    field: string;
    isNumeric?: boolean;
    fractionDigits?: number;
    isHidden?: boolean;
    isSortable?: boolean;
}

const ShortCircuitAnalysisResultTable: FunctionComponent<
    ShortCircuitAnalysisResultProps
> = ({ result, onSortChanged, sortConfig, analysisType }) => {
    const intl = useIntl();
    const theme = useTheme();

    const makeColumn = useCallback(
        ({
            headerName,
            field,
            isNumeric = false,
            fractionDigits,
            isHidden = false,
            isSortable = true,
        }: ColumnConfig) => {
            return {
                headerName,
                field,
                numeric: isNumeric,
                fractionDigits,
                hide: isHidden,
                headerComponent: CustomHeaderComponent,
                headerComponentParams: {
                    field,
                    displayName: headerName,
                    sortConfig,
                    onSortChanged: (newSortValue: number) => {
                        onSortChanged(field, newSortValue);
                    },
                    isSortable,
                    isFilterable: false,
                },
            };
        },
        [sortConfig, onSortChanged]
    );

    const columns = useMemo(
        () => [
            makeColumn({
                headerName: intl.formatMessage({ id: 'IDNode' }),
                field: 'elementId',
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'faultType',
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'Feeders' }),
                field: 'connectableId',
                isSortable: false,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
                fractionDigits: 1,
                isNumeric: true,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                fractionDigits: 1,
                isNumeric: true,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                fractionDigits: 1,
                isNumeric: true,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                fractionDigits: 1,
                isNumeric: true,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMin' }),
                field: 'deltaCurrentIpMin',
                fractionDigits: 1,
                isNumeric: true,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMax' }),
                field: 'deltaCurrentIpMax',
                fractionDigits: 1,
                isNumeric: true,
            }),
            makeColumn({
                field: 'linkedElementId',
                isHidden: true,
                isSortable: false,
            }),
        ],
        [intl, makeColumn]
    );

    const shortCircuitAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[
                analysisType === ShortcircuitAnalysisType.ALL_BUSES
                    ? ComputingType.SHORTCIRCUIT_ANALYSIS
                    : ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS
            ]
    );

    const messages = useIntlResultStatusMessages(intl, true);
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

    const flattenResult = (shortCircuitAnalysisResult: SCAResultFault[]) => {
        const rows: ShortCircuitAnalysisAGGridResult[] = [];

        shortCircuitAnalysisResult?.forEach((faultResult: SCAResultFault) => {
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

            const current = faultResult.current;
            const deltaCurrentIpMax =
                faultResult.shortCircuitLimits.deltaCurrentIpMax;
            const deltaCurrentIpMin =
                faultResult.shortCircuitLimits.deltaCurrentIpMin;

            rows.push({
                faultId: fault.id,
                elementId: fault.elementId,
                faultType: intl.formatMessage({ id: fault.faultType }),
                shortCircuitPower: faultResult.shortCircuitPower,
                limitMin: unitToKiloUnit(faultResult.shortCircuitLimits.ipMin),
                limitMax: unitToKiloUnit(faultResult.shortCircuitLimits.ipMax),
                deltaCurrentIpMax: deltaCurrentIpMax,
                deltaCurrentIpMin: deltaCurrentIpMin,
                current: current,
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
                let current = NaN;
                if (analysisType === ShortcircuitAnalysisType.ALL_BUSES) {
                    current = feederResult.current;
                } else if (analysisType === ShortcircuitAnalysisType.ONE_BUS) {
                    current = feederResult.positiveMagnitude;
                }

                rows.push({
                    connectableId: feederResult.connectableId,
                    linkedElementId: fault.id,
                    current: current,
                });
            });
        });
        return rows;
    };

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            resizable: true,
            sortable: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
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

    const rows = flattenResult(result);
    const message = getNoRowsMessage(
        messages,
        rows,
        shortCircuitAnalysisStatus
    );
    const rowsToShow = getRows(rows, shortCircuitAnalysisStatus);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <CustomAGGrid
                rowData={rowsToShow}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                getRowStyle={getRowStyle}
                enableCellTextSelection={true}
                postSortRows={handlePostSortRows}
                columnDefs={columns}
                overlayNoRowsTemplate={message}
            />
        </Box>
    );
};

export default ShortCircuitAnalysisResultTable;
