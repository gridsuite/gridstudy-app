/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Box, Button, LinearProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import { ComputingType, CustomAGGrid, DefaultCellRenderer, OverflowableText } from '@gridsuite/commons-ui';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { getPccMinColumns, PccMinResultTableProps } from './pcc-min-result.type';
import { RESULTS_LOADING_DELAY } from 'components/network/constants';
import RunningStatus from 'components/utils/running-status';
import { useOpenLoaderShortWait } from 'components/dialogs/commons/handle-loader';
import { AGGRID_LOCALES } from 'translations/not-intl/aggrid-locales';
import { GridReadyEvent, ICellRendererParams, RowDataUpdatedEvent } from 'ag-grid-community';
import { getColumnHeaderDisplayNames } from 'components/utils/column-constant';
import { resultsStyles } from '../common/utils';
import { openSLD } from '../../../redux/slices/workspace-slice';
import { PanelType } from 'components/workspace/types/workspace.types';
import { updateAgGridFilters } from '../../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';

const styles = {
    gridContainer: { display: 'flex', flexDirection: 'column', height: '100%' },
    grid: { flexGrow: 1, minHeight: 0 },
};

const PccMinResultTable: FunctionComponent<PccMinResultTableProps> = ({
    result,
    isFetching,
    goToFirstPage,
    filters,
    setCsvHeaders,
    setIsCsvButtonDisabled,
}) => {
    const intl = useIntl();
    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);
    const gridRef = useRef<AgGridReact>(null);
    const dispatch = useDispatch();

    const voltageLevelIdRenderer = useCallback(
        (props: ICellRendererParams) => {
            const { value, node } = props || {};
            const onClick = () => {
                const vlId = node?.data?.voltageLevelId;
                if (vlId) {
                    dispatch(openSLD({ id: vlId, panelType: PanelType.SLD_VOLTAGE_LEVEL }));
                }
            };
            if (value) {
                return (
                    <Button sx={resultsStyles.sldLink} onClick={onClick}>
                        <OverflowableText text={value} />
                    </Button>
                );
            }
        },
        [dispatch]
    );

    const columns = useMemo(
        () => getPccMinColumns(intl, voltageLevelIdRenderer, goToFirstPage),
        [goToFirstPage, intl, voltageLevelIdRenderer]
    );

    const statusMessage = useIntlResultStatusMessages(intl, true, filters.length > 0);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            resizable: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const rowsToShow = getRows(result, pccMinStatus);
    const noRowMessage = getNoRowsMessage(statusMessage, result, pccMinStatus, !isFetching);

    const showLoader = useOpenLoaderShortWait({
        isLoading: pccMinStatus === RunningStatus.RUNNING || isFetching,
        delay: RESULTS_LOADING_DELAY,
    });

    const handleRowDataUpdated = useCallback(
        (event: RowDataUpdatedEvent) => {
            if (event?.api) {
                setIsCsvButtonDisabled(event.api.getDisplayedRowCount() === 0);
            }
        },
        [setIsCsvButtonDisabled]
    );

    const handleGridReady = useCallback(
        (event: GridReadyEvent) => {
            if (!event.api || !filters) return;
            event.api.sizeColumnsToFit();
            updateAgGridFilters(event.api, filters);
            setCsvHeaders(getColumnHeaderDisplayNames(event.api));
        },
        [filters, setCsvHeaders]
    );

    return (
        <Box sx={styles.gridContainer}>
            {showLoader && <LinearProgress sx={{ height: 4 }} />}

            <Box sx={styles.grid}>
                <CustomAGGrid
                    ref={gridRef}
                    rowData={rowsToShow}
                    defaultColDef={defaultColDef}
                    columnDefs={columns}
                    onRowDataUpdated={handleRowDataUpdated}
                    onGridReady={handleGridReady}
                    overlayNoRowsTemplate={noRowMessage}
                    overrideLocales={AGGRID_LOCALES}
                    onModelUpdated={({ api }) => {
                        if (api.getDisplayedRowCount()) api.hideOverlay();
                        else api.showNoRowsOverlay();
                    }}
                />
            </Box>
        </Box>
    );
};

export default PccMinResultTable;
