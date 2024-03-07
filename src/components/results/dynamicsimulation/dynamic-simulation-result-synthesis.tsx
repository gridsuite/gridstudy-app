/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import React, { memo, useMemo } from 'react';
import { useNodeData } from '../../study-container';
import { fetchDynamicSimulationStatus } from '../../../services/study/dynamic-simulation';
import {
    dynamicSimulationResultInvalidations,
    MEDIUM_COLUMN_WIDTH,
} from './utils/dynamic-simulation-result-utils';
import { useSelector } from 'react-redux';
import ComputingType from '../../computing-status/computing-type';
import {
    getNoRowsMessage,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import { StatusCellRender } from '../common/result-cell-renderers';
import { UUID } from 'crypto';
import RunningStatus from '../../utils/running-status';
import { ReduxState } from '../../../redux/reducer.type';

const styles = {
    loader: {
        height: '4px',
    },
};

const defaultColDef = {
    filter: true,
    sortable: true,
    resizable: true,
    lockPinned: true,
    suppressMovable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    cellRenderer: DefaultCellRenderer,
};

type DynamicSimulationResultSynthesisProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
};

const DynamicSimulationResultSynthesis = memo(
    ({ nodeUuid, studyUuid }: DynamicSimulationResultSynthesisProps) => {
        const intl = useIntl();

        const [result, isLoading] = useNodeData(
            studyUuid,
            nodeUuid,
            fetchDynamicSimulationStatus,
            dynamicSimulationResultInvalidations,
            null,
            (status: RunningStatus) =>
                status && [
                    {
                        status,
                    },
                ]
        );

        const columnDefs = useMemo(
            () => [
                makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({
                        id: 'status',
                    }),
                    field: 'status',
                    width: MEDIUM_COLUMN_WIDTH,
                    cellRenderer: StatusCellRender,
                }),
            ],
            [intl]
        );

        // messages to show when no data
        const dynamicSimulationStatus = useSelector(
            (state: ReduxState) =>
                state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
        );
        const messages = useIntlResultStatusMessages(intl, true);
        const overlayMessage = useMemo(
            () =>
                getNoRowsMessage(
                    messages,
                    result,
                    dynamicSimulationStatus,
                    !isLoading
                ),
            [messages, result, dynamicSimulationStatus, isLoading]
        );

        const rowDataToShow = useMemo(
            () => (overlayMessage ? [] : result),
            [result, overlayMessage]
        );

        return (
            <>
                {isLoading && (
                    <Box sx={styles.loader}>
                        <LinearProgress />
                    </Box>
                )}
                <CustomAGGrid
                    rowData={rowDataToShow}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    overlayNoRowsTemplate={overlayMessage}
                    enableCellTextSelection
                />
            </>
        );
    }
);

export default DynamicSimulationResultSynthesis;
