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
import { getNoRowsMessage, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/utils/custom-aggrid-header-utils';
import { DefaultCellRenderer } from '../../custom-aggrid/cell-renderers';
import { COL_STATUS, StatusCellRender } from '../common/result-cell-renderers';
import { UUID } from 'crypto';
import { AppState } from '../../../redux/reducer';
import { CustomAGGrid, ComputingType } from '@gridsuite/commons-ui';
import { dynamicSimulationResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';
import { AGGRID_LOCALES } from '../../../translations/not-intl/aggrid-locales';

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

        const { result, isLoading } = useNodeData({
            studyUuid,
            nodeUuid,
            rootNetworkUuid: currentRootNetworkUuid,
            fetcher: fetchDynamicSimulationStatus,
            invalidations: dynamicSimulationResultInvalidations,
            resultConverter: (status: string | null) => {
                return status === null
                    ? undefined
                    : [
                          {
                              [COL_STATUS]: status,
                          },
                      ];
            },
        });

        const columnDefs = useMemo(
            () => [
                makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({
                        id: COL_STATUS,
                    }),
                    colId: COL_STATUS,
                    field: COL_STATUS,
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
                    overrideLocales={AGGRID_LOCALES}
                />
            </>
        );
    }
);

export default DynamicSimulationResultSynthesis;
