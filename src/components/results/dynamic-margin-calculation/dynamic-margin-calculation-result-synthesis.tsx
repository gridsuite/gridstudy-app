/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getNoRowsMessage, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/utils/custom-aggrid-header-utils';
import { ComputingType, CustomAGGrid, DefaultCellRenderer, type MuiStyles } from '@gridsuite/commons-ui';
import { COL_STATUS, StatusCellRender } from '../common/result-cell-renderers';
import type { UUID } from 'node:crypto';
import { AppState } from '../../../redux/reducer';
import { fetchDynamicMarginCalculationStatus } from '../../../services/study/dynamic-margin-calculation';
import { MEDIUM_COLUMN_WIDTH } from '../dynamicsimulation/utils/dynamic-simulation-result-utils';
import { dynamicMarginCalculationResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';
import { AGGRID_LOCALES } from '../../../translations/not-intl/aggrid-locales';

const styles = {
    loader: {
        height: '4px',
    },
} as const satisfies MuiStyles;

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

type DynamicMarginCalculationResultSynthesisProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
};

const DynamicMarginCalculationResultSynthesis = memo(
    ({ nodeUuid, studyUuid, currentRootNetworkUuid }: DynamicMarginCalculationResultSynthesisProps) => {
        const intl = useIntl();

        const { result, isLoading } = useNodeData({
            studyUuid,
            nodeUuid,
            rootNetworkUuid: currentRootNetworkUuid,
            fetcher: fetchDynamicMarginCalculationStatus,
            invalidations: dynamicMarginCalculationResultInvalidations,
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
        const dynamicMarginCalculationStatus = useSelector(
            (state: AppState) => state.computingStatus[ComputingType.DYNAMIC_MARGIN_CALCULATION]
        );
        const messages = useIntlResultStatusMessages(intl, true);
        const overlayMessage = useMemo(
            () => getNoRowsMessage(messages, result, dynamicMarginCalculationStatus, !isLoading),
            [messages, result, dynamicMarginCalculationStatus, isLoading]
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

export default DynamicMarginCalculationResultSynthesis;
