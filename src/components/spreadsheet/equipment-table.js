/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useCallback } from 'react';
import { useTheme } from '@mui/material';
import { ALLOWED_KEYS } from './utils/config-tables';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import { useIntl } from 'react-intl';
import { modifyGenerator } from 'services/study/network-modifications';
import { REGULATION_TYPES } from 'components/network/constants';
import { useSnackMessage } from '@gridsuite/commons-ui';
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
    handleRowEditing,
    handleCellEditing,
    handleEditingStarted,
    handleEditingStopped,
    handleGridReady,
    handleRowDataUpdated,
    fetched,
    network,
    shouldHidePinnedHeaderRightBorder,
    onCellClicked,
}) => {
    const theme = useTheme();
    const { snackError } = useSnackMessage();
    const [clickedCellData, setClickedCellData] = React.useState({});
    const [generatorId, setGeneratorId] = React.useState('');
    const [
        popupGeneratorEditRegulatingTerminalFields,
        setPopupGeneratorEditRegulatingTerminalFields,
    ] = React.useState(false);
    const onRegulatingTerminalPopupClose = () => {
        setPopupGeneratorEditRegulatingTerminalFields(false);
    };
    const handleSavePopupGeneratorEditRegulatingTerminalFields = (
        voltageRegulationGenerator
    ) => {
        setGeneratorId(clickedCellData.data.id);

        const isDistantRegulation =
            voltageRegulationGenerator.voltageRegulationType ===
            REGULATION_TYPES.DISTANT.id;

        modifyGenerator(
            studyUuid,
            currentNode.id,
            generatorId,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            null,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            voltageRegulationGenerator.voltageRegulationType,
            isDistantRegulation
                ? voltageRegulationGenerator.equipment.id
                : null,
            isDistantRegulation
                ? voltageRegulationGenerator.equipment?.type
                : null,
            isDistantRegulation
                ? voltageRegulationGenerator.voltageLevel?.id
                : null,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'GeneratorModificationError',
            });
        });
    };

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
            isEditing: topPinnedData ? true : false,
        };
    }, [network, topPinnedData]);
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

    const handleOnClickOnCell = (params) => {
        if (onCellClicked != null) {
            if (onCellClicked.name === 'onCellGeneratorCellClicked') {
                onCellClicked(params, () => {
                    setGeneratorId(params.data.id);
                    setPopupGeneratorEditRegulatingTerminalFields(
                        !popupGeneratorEditRegulatingTerminalFields
                    );
                    setClickedCellData(params);
                });
            }
        }
    };
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
                editType={'fullRow'}
                onCellValueChanged={handleCellEditing}
                onRowValueChanged={handleRowEditing}
                onRowDataUpdated={handleRowDataUpdated}
                onRowEditingStarted={handleEditingStarted}
                onRowEditingStopped={handleEditingStopped}
                onColumnMoved={handleColumnDrag}
                suppressDragLeaveHidesColumns={true}
                suppressColumnVirtualisation={true}
                suppressClickEdit={true}
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
                onCellClicked={handleOnClickOnCell}
            />
            <RegulatingTerminalModificationDialog
                open={popupGeneratorEditRegulatingTerminalFields}
                onClose={onRegulatingTerminalPopupClose}
                currentNode={currentNode}
                studyUuid={studyUuid}
                onModifyRegulatingTeminalGenerator={(
                    updatedRegulatedTerminal
                ) => {
                    handleSavePopupGeneratorEditRegulatingTerminalFields(
                        updatedRegulatedTerminal
                    );
                }}
                data={clickedCellData.data}
            />
        </>
    );
};
