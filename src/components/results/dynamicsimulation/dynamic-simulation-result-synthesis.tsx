/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import { memo, useMemo } from 'react';
import { fetchDynamicSimulationStatus } from '../../../services/study/dynamic-simulation';
import { MEDIUM_COLUMN_WIDTH } from './utils/dynamic-simulation-result-utils';
import { useSelector } from 'react-redux';
import ComputingType from '../../computing-status/computing-type';
import { getNoRowsMessage, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { StatusCellRender } from '../common/result-cell-renderers';
import { UUID } from 'crypto';
import RunningStatus from '../../utils/running-status';
import { AppState } from '../../../redux/reducer';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { dynamicSimulationResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';

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
    currentRootNetworkUuid: UUID;
};

const DynamicSimulationResultSynthesis = memo(
    ({ nodeUuid, studyUuid, currentRootNetworkUuid }: DynamicSimulationResultSynthesisProps) => {
        const intl = useIntl();

        const [result, isLoading] = useNodeData(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
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
                    colId: 'status',
                    field: 'status',
                    width: MEDIUM_COLUMN_WIDTH,
                    cellRenderer: StatusCellRender,
                }),
            ],
            [intl]
        );

        // messages to show when no data
        const dynamicSimulationStatus = useSelector(
            (state: AppState) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
        );
        const messages = useIntlResultStatusMessages(intl, true);
        const overlayMessage = useMemo(
            () => getNoRowsMessage(messages, result, dynamicSimulationStatus, !isLoading),
            [messages, result, dynamicSimulationStatus, isLoading]
        );

        const rowDataToShow = useMemo(() => (overlayMessage ? [] : result), [result, overlayMessage]);

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
