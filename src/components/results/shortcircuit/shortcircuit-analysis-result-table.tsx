/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { unitToKiloUnit } from 'utils/rounding';
import {
    SCAFaultResult,
    SCAFeederResult,
    ShortCircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import { GridReadyEvent, RowClassParams } from 'ag-grid-community';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { ReduxState } from '../../../redux/reducer.type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import {
    FilterEnumsType,
    FilterPropsType,
} from '../../../hooks/use-aggrid-row-filter';
import { SortPropsType } from '../../../hooks/use-aggrid-sort';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import IconButton from '@mui/material/IconButton';
import GetAppIcon from '@mui/icons-material/GetApp';
import { downloadShortCircuitResultZippedCsv } from '../../../services/study/short-circuit-analysis';
import { useSnackMessage } from '@gridsuite/commons-ui';

const styles = {
    gridContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    csvExport: {
        display: 'flex',
        alignItems: 'baseline',
        marginTop: '-40px',
    },
    grid: {
        flexGrow: '1',
    },
};
interface ShortCircuitAnalysisResultProps {
    result: SCAFaultResult[];
    analysisType: ShortCircuitAnalysisType;
    isFetching: boolean;
    filterProps: FilterPropsType;
    sortProps: SortPropsType;
    filterEnums: FilterEnumsType;
    studyUuid: string;
    currentNode: string;
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
    deltaCurrentIpMax?: number | null;
    deltaCurrentIpMin?: number | null;
}

interface ShortCircuitAnalysisResultsLimitViolation {
    current: number;
    limitType?: string | null;
    limitMin?: number | null;
    limitMax?: number | null;
}

interface ShortCircuitAnalysisResultsFeederResult {
    connectableId: string;
    current: number;
    linkedElementId: string;
}

const ShortCircuitAnalysisResultTable: FunctionComponent<
    ShortCircuitAnalysisResultProps
> = ({
    result,
    analysisType,
    isFetching,
    sortProps,
    filterProps,
    filterEnums,
    studyUuid,
    currentNode,
}) => {
    const intl = useIntl();
    const theme = useTheme();
    const { snackError } = useSnackMessage();
    const columns = useMemo(() => {
        const isAllBusesAnalysisType =
            analysisType === ShortCircuitAnalysisType.ALL_BUSES;
        const isOneBusAnalysisType =
            analysisType === ShortCircuitAnalysisType.ONE_BUS;

        const sortPropsCheckedForAllBusesAnalysisType = isAllBusesAnalysisType
            ? sortProps
            : undefined;
        const sortPropsCheckedForOneBusAnalysisType = isOneBusAnalysisType
            ? sortProps
            : undefined;

        const filterPropsCheckedForAllBusesAnalysisType = isAllBusesAnalysisType
            ? filterProps
            : undefined;
        const filterPropsCheckedForOneBusAnalysisType = isOneBusAnalysisType
            ? filterProps
            : undefined;

        const textFilterParams = {
            filterDataType: FILTER_DATA_TYPES.TEXT,
            filterComparators: [
                FILTER_TEXT_COMPARATORS.STARTS_WITH,
                FILTER_TEXT_COMPARATORS.CONTAINS,
            ],
        };

        const numericFilterParams = {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        };

        const autoCompleteFilterParams = {
            filterDataType: FILTER_DATA_TYPES.TEXT,
            filterEnums,
        };

        return [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IDNode' }),
                field: 'elementId',
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: textFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'faultType',
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: autoCompleteFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Feeders' }),
                field: 'connectableId',
                sortProps: sortPropsCheckedForOneBusAnalysisType,
                filterProps: filterPropsCheckedForOneBusAnalysisType,
                filterParams: textFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
                numeric: true,
                fractionDigits: 2,
                sortProps,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: numericFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: autoCompleteFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: numericFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: numericFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: numericFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMin' }),
                field: 'deltaCurrentIpMin',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: numericFilterParams,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMax' }),
                field: 'deltaCurrentIpMax',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterProps: filterPropsCheckedForAllBusesAnalysisType,
                filterParams: numericFilterParams,
            }),
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [intl, analysisType, sortProps, filterProps, filterEnums]);

    const shortCircuitAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[
                analysisType === ShortCircuitAnalysisType.ALL_BUSES
                    ? ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS
                    : ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS
            ]
    );

    const messages = useIntlResultStatusMessages(intl, true);

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

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            resizable: true,
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

    const getCurrent = useCallback(
        (x: SCAFaultResult | SCAFeederResult) => {
            let current = NaN;
            if (analysisType === ShortCircuitAnalysisType.ALL_BUSES) {
                current = x.current;
            } else if (analysisType === ShortCircuitAnalysisType.ONE_BUS) {
                current = x.positiveMagnitude;
            }
            return current;
        },
        [analysisType]
    );

    const flattenResult = useCallback(
        (shortCircuitAnalysisResult: SCAFaultResult[]) => {
            const rows: ShortCircuitAnalysisAGGridResult[] = [];

            shortCircuitAnalysisResult?.forEach(
                (faultResult: SCAFaultResult) => {
                    const fault = faultResult.fault;
                    const limitViolations = faultResult.limitViolations ?? [];
                    let firstLimitViolation;
                    if (limitViolations.length > 0) {
                        let lv = limitViolations[0];
                        firstLimitViolation = {
                            limitType: intl.formatMessage({
                                id: lv.limitType,
                            }),
                        };
                    }

                    const current = getCurrent(faultResult);

                    const deltaCurrentIpMax =
                        faultResult.shortCircuitLimits.deltaCurrentIpMax;
                    const deltaCurrentIpMin =
                        faultResult.shortCircuitLimits.deltaCurrentIpMin;

                    rows.push({
                        faultId: fault.id,
                        elementId: fault.elementId,
                        faultType: intl.formatMessage({ id: fault.faultType }),
                        shortCircuitPower: faultResult.shortCircuitPower,
                        limitMin: unitToKiloUnit(
                            faultResult.shortCircuitLimits.ipMin
                        ),
                        limitMax: unitToKiloUnit(
                            faultResult.shortCircuitLimits.ipMax
                        ),
                        deltaCurrentIpMax: deltaCurrentIpMax,
                        deltaCurrentIpMin: deltaCurrentIpMin,
                        current: current,
                        connectableId: '', // we have to add this otherwise it's automatically filtered
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
                            current: lv.value,
                            elementId: '', // we have to add this otherwise it's automatically filtered
                            faultType: '', // we have to add this otherwise it's automatically filtered
                            connectableId: '', // we have to add this otherwise it's automatically filtered
                        });
                    });
                    const feederResults = faultResult.feederResults ?? [];
                    feederResults.forEach((feederResult) => {
                        const current = getCurrent(feederResult);

                        rows.push({
                            connectableId: feederResult.connectableId,
                            linkedElementId: fault.id,
                            current: current,
                            elementId: '', // we have to add this otherwise it's automatically filtered
                            faultType: '', // we have to add this otherwise it's automatically filtered
                            limitType: '', // we have to add this otherwise it's automatically filtered
                        });
                    });
                }
            );
            return rows;
        },
        [getCurrent, intl]
    );
    const rows = useMemo(() => flattenResult(result), [flattenResult, result]);

    const message = getNoRowsMessage(
        messages,
        rows,
        shortCircuitAnalysisStatus,
        !isFetching
    );
    const rowsToShow = getRows(rows, shortCircuitAnalysisStatus);
    const headersCsv = columns
        .filter((column) => 'headerName' in column)
        .map((column) => (column as { headerName?: string }).headerName || '');
    const exportCsv = useCallback(() => {
        downloadShortCircuitResultZippedCsv(
            studyUuid,
            currentNode,
            analysisType,
            headersCsv
        )
            .then((response) => {
                debugger;
                response.blob().then((blb: Blob) => {
                    const url = URL.createObjectURL(blb);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute(
                        'download',
                        analysisType === ShortCircuitAnalysisType.ONE_BUS
                            ? 'oneBus-results.zip'
                            : 'allBuses_results.zip'
                    );
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'ShortCirduitAnalysisExportCsvResultsError',
                    }),
                });
            });
    }, [studyUuid, currentNode, intl, snackError, headersCsv, analysisType]);

    return (
        <Box sx={styles.gridContainer}>
            <Box sx={styles.csvExport}>
                <Box style={{ flexGrow: 1 }}></Box>
                <Box>
                    <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
                </Box>
                <Box>
                    <IconButton
                        disabled={!rowsToShow || rowsToShow.length === 0}
                        aria-label="exportCSVButton"
                        onClick={exportCsv}
                    >
                        <GetAppIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={styles.grid}>
                <CustomAGGrid
                    rowData={rowsToShow}
                    defaultColDef={defaultColDef}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    enableCellTextSelection={true}
                    columnDefs={columns}
                    overlayNoRowsTemplate={message}
                />
            </Box>
        </Box>
    );
};

export default ShortCircuitAnalysisResultTable;
