/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import useResultTimeLine from './hooks/useResultTimeLine';
import { UUID } from 'crypto';
import { Box, LinearProgress } from '@mui/material';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import React, { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import {
    getNoRowsMessage,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import ComputingType from '../../computing-status/computing-type';

const styles = {
    loader: {
        height: '4px',
    },
    cell: {
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
        flex: 1,
        cursor: 'initial',
    },
};

const NumberCellRenderer = (cellData: ICellRendererParams) => {
    const value = cellData.value;
    return <Box sx={styles.cell}>{!isNaN(value) ? value.toFixed(2) : ''}</Box>;
};

type DynamicSimulationResultTimeLineProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
};

const DynamicSimulationResultTimeLine = ({
    studyUuid,
    nodeUuid,
}: DynamicSimulationResultTimeLineProps) => {
    const intl = useIntl();
    const [result, isLoading] = useResultTimeLine(studyUuid, nodeUuid);
    const dynamicSimulationStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const rowData = useMemo(() => result?.timeLines ?? [], [result]);

    // columns are defined from fields in {@link TimelineEvent} type
    const columnDefs = useMemo(() => {
        return [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimeLineEventTime',
                }),
                field: 'time',
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.NUMBER,
                    filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
                },
                cellRenderer: NumberCellRenderer,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimeLineEventModelName',
                }),
                field: 'modelName',
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterComparators: [
                        FILTER_TEXT_COMPARATORS.STARTS_WITH,
                        FILTER_TEXT_COMPARATORS.CONTAINS,
                    ],
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimeLineEventModelMessage',
                }),
                field: 'message',
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterComparators: [
                        FILTER_TEXT_COMPARATORS.STARTS_WITH,
                        FILTER_TEXT_COMPARATORS.CONTAINS,
                    ],
                },
            }),
        ];
    }, [intl]);

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            suppressMovable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);

    const messages = useIntlResultStatusMessages(intl);
    const overlayNoRowsTemplate = useMemo(
        () =>
            getNoRowsMessage(
                messages,
                rowData,
                dynamicSimulationStatus,
                rowData && !isLoading
            ),
        [messages, rowData, dynamicSimulationStatus, isLoading]
    );

    return (
        <>
            {isLoading && (
                <Box sx={styles.loader}>
                    <LinearProgress />
                </Box>
            )}
            {result && (
                <CustomAGGrid
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    onGridReady={onGridReady}
                    overlayNoRowsTemplate={overlayNoRowsTemplate}
                    enableCellTextSelection
                />
            )}
        </>
    );
};

export default DynamicSimulationResultTimeLine;
