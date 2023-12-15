/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useCallback, useState } from 'react';
import { useTheme } from '@mui/material';
import { ALLOWED_KEYS } from './utils/config-tables';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import { useIntl } from 'react-intl';
import { REGULATION_TYPES } from 'components/network/constants';
import RegulatingTerminalModificationDialog from 'components/dialogs/network-modifications/generator/modification/regulating-terminal-modification-dialog';

const PINNED_ROW_HEIGHT = 42;
const DEFAULT_ROW_HEIGHT = 28;

export const EquipmentTable = ({
    rowData,
    topPinnedData,
    columnData,
    gridRef,
    studyUuid,
    currentNode,
    handleColumnDrag,
    handleCellEditingStarted,
    handleCellEditingStopped,
    handleGridReady,
    handleRowDataUpdated,
    fetched,
    network,
    shouldHidePinnedHeaderRightBorder,
    editingData,
    setEditingData,
    editingDataRef,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const getRowStyle = useCallback(
        (params) => {
            if (params.rowIndex === 0 && params.node.rowPinned === 'top') {
                return {
                    borderTop: '1px solid ' + theme.palette.primary.main,
                    borderBottom: '1px solid ' + theme.palette.primary.main,
                };
            }
        },
        [theme.palette.primary.main]
    );

    const getRowId = useCallback((params) => params.data.id, []);

    //we filter enter key event to prevent closing or opening edit mode
    const suppressKeyEvent = (params) => {
        return !ALLOWED_KEYS.includes(params.event.key);
    };

    const [popupEditRegulatingTerminal, setPopupEditRegulatingTerminal] =
        useState(false);

    const onRegulatingTerminalPopupClose = () => {
        setPopupEditRegulatingTerminal(false);
    };
    const openGeneratorPopup = () => {
        setPopupEditRegulatingTerminal(true);
    };
    const handleSavePopupRegulatingTerminal = (d) => {
        setPopupEditRegulatingTerminal(false);

        const {
            equipment: { type: equipmentType, id: equipmentId } = {},
            voltageLevel: { id: voltageLevelId } = {},
        } = d || {};

        setEditingData((prevEditingData) => ({
            ...prevEditingData,
            voltageRegulationType: REGULATION_TYPES.DISTANT.id,
            regulatingTerminalConnectableType: equipmentType,
            regulatingTerminalConnectableId: equipmentId,
            regulatingTerminalVlId: voltageLevelId,
        }));
    };

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressKeyboardEvent: (params) => suppressKeyEvent(params),
        }),
        []
    );

    const gridContext = useMemo(() => {
        return {
            network: network,
            editErrors: {},
            dynamicValidation: {},
            isEditing: !!topPinnedData,
            handleCellClick: {
                //functions for handling cell click for Generator Spreadsheet
                openGeneratorDialog: () => {
                    openGeneratorPopup();
                },
            },
            theme,
            lastEditedField: undefined,
        };
    }, [network, theme, topPinnedData]);
    const getRowHeight = useCallback(
        (params) =>
            params.node.rowPinned ? PINNED_ROW_HEIGHT : DEFAULT_ROW_HEIGHT,
        []
    );

    const rowsToShow = useMemo(() => {
        return fetched && rowData.length > 0 ? rowData : [];
    }, [rowData, fetched]);

    const message = useMemo(() => {
        if (!fetched) {
            return intl.formatMessage({ id: 'LoadingRemoteData' });
        }
        if (fetched && rowData.length === 0) {
            return intl.formatMessage({ id: 'grid.noRowsToShow' });
        }
        return undefined;
    }, [rowData, fetched, intl]);

    const loadingOverlayComponent = (props) => {
        return <>{props.loadingMessage}</>;
    };
    const loadingOverlayComponentParams = useMemo(() => {
        return {
            loadingMessage: intl.formatMessage({ id: 'LoadingRemoteData' }),
        };
    }, [intl]);

    return (
        <>
            <CustomAGGrid
                ref={gridRef}
                getRowId={getRowId}
                rowData={rowsToShow}
                pinnedTopRowData={topPinnedData}
                debounceVerticalScrollbar={true}
                getRowStyle={getRowStyle}
                columnDefs={columnData}
                defaultColDef={defaultColDef}
                enableCellTextSelection={true}
                undoRedoCellEditing={true}
                onCellEditingStarted={handleCellEditingStarted}
                onCellEditingStopped={handleCellEditingStopped}
                onRowDataUpdated={handleRowDataUpdated}
                onColumnMoved={handleColumnDrag}
                suppressDragLeaveHidesColumns={true}
                suppressColumnVirtualisation={true}
                suppressClickEdit={!topPinnedData}
                singleClickEdit={true}
                context={gridContext}
                onGridReady={handleGridReady}
                shouldHidePinnedHeaderRightBorder={
                    shouldHidePinnedHeaderRightBorder
                }
                getRowHeight={getRowHeight}
                overlayNoRowsTemplate={message}
                loadingOverlayComponent={loadingOverlayComponent}
                loadingOverlayComponentParams={loadingOverlayComponentParams}
                showOverlay={true}
            />
            {popupEditRegulatingTerminal && (
                <RegulatingTerminalModificationDialog
                    open={popupEditRegulatingTerminal}
                    onClose={onRegulatingTerminalPopupClose}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    onModifyRegulatingTerminalGenerator={(
                        updatedRegulatedTerminal
                    ) => {
                        handleSavePopupRegulatingTerminal(
                            updatedRegulatedTerminal
                        );
                    }}
                    data={editingData}
                    previousData={editingDataRef.current}
                />
            )}
        </>
    );
};
