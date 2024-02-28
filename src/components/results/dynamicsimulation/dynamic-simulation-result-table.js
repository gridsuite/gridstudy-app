/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
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

/* must be coherent to LoadFlowResult component */
const styles = {
    loader: {
        height: '4px',
    },
};

const DynamicSimulationResultTable = ({ nodeUuid, studyUuid }) => {
    const intl = useIntl();
    const gridRef = useRef(null);

    const [result, isLoading] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationStatus,
        dynamicSimulationResultInvalidations,
        null,
        (status) =>
            status && [
                {
                    status,
                },
            ]
    );

    const columnDefs = useMemo(() => {
        return [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'status',
                }),
                field: 'status',
                width: MEDIUM_COLUMN_WIDTH,
                cellRenderer: StatusCellRender,
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
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    // messages to show when no data
    const dynamicSimulationStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
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
                ref={gridRef}
                rowData={rowDataToShow}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                overlayNoRowsTemplate={overlayMessage}
                enableCellTextSelection
            />
        </>
    );
};

DynamicSimulationResultTable.propTypes = {
    nodeUuid: PropTypes.string,
    studyUuid: PropTypes.string,
};

export default DynamicSimulationResultTable;
