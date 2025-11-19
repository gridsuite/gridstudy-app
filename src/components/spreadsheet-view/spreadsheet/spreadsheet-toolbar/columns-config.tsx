/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Checkbox, ListItem, ListItemButton } from '@mui/material';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { SelectOptionsDialog } from 'utils/dialogs';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { DropResult } from '@hello-pangea/dnd';
import { updateTableDefinition } from 'redux/actions';
import type { UUID } from 'node:crypto';
import { type MuiStyles, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { spreadsheetStyles } from '../../spreadsheet.style';
import { updateColumnStates } from 'services/study/study-config';
import { AppState } from 'redux/reducer';
import { ColumnState } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { ROW_INDEX_COLUMN_STATE } from '../../constants';
import { DroppableColumnsList } from './droppable-columns-list';

const MAX_LOCKS_PER_TAB = 5;

const styles = {
    checkboxSelectAll: (theme) => ({
        padding: theme.spacing(0, 3, 2, 2),
        fontWeight: 'bold',
        cursor: 'pointer',
    }),
    checkboxItem: {
        cursor: 'pointer',
    },
    columnConfigClosedLock: (theme) => ({
        fontSize: '1.2em',
        color: theme.palette.action.active,
    }),
    columnConfigOpenLock: (theme) => ({
        fontSize: '1.2em',
        color: theme.palette.action.disabled,
    }),
} as const satisfies MuiStyles;

interface ColumnsConfigProps {
    gridRef: React.RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
    disabled: boolean;
}

export const ColumnsConfig: FunctionComponent<ColumnsConfigProps> = ({ tableDefinition, disabled, gridRef }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [localColumns, setLocalColumns] = useState(tableDefinition?.columns);
    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState<boolean>(false);

    const handleOpenPopupSelectColumnNames = useCallback(() => {
        setPopupSelectColumnNames(true);
    }, []);

    const handleCloseColumnsSettingDialog = useCallback(() => {
        setPopupSelectColumnNames(false);
    }, []);

    useEffect(() => {
        setLocalColumns(tableDefinition?.columns);
    }, [tableDefinition?.columns]);

    const applyColumnState = useCallback(
        (columns: typeof localColumns) => {
            const api = gridRef.current?.api;
            if (!api) {
                return;
            }

            const columnStates: ColumnState[] = [
                ROW_INDEX_COLUMN_STATE,
                ...columns.map((col) => ({
                    colId: col.id || col.uuid,
                    hide: !col.visible,
                    pinned: col.locked && col.visible ? ('left' as const) : null,
                })),
            ];

            api.applyColumnState({
                state: columnStates,
                applyOrder: true,
                defaultState: { pinned: null, hide: false },
            });
        },
        [gridRef]
    );

    // Restore AG Grid column state to match the original tableDefinition.columns
    const resetColumnState = useCallback(() => {
        if (gridRef.current?.api) {
            applyColumnState(tableDefinition.columns);
        }
    }, [applyColumnState, gridRef, tableDefinition.columns]);

    const handleCancelPopupSelectColumnNames = useCallback(() => {
        setLocalColumns(tableDefinition?.columns);
        resetColumnState();
        handleCloseColumnsSettingDialog();
    }, [tableDefinition?.columns, resetColumnState, handleCloseColumnsSettingDialog]);

    const handleSaveSelectedColumnNames = useCallback(() => {
        // check if columns state has changed
        const hasColsStatesChanged = tableDefinition.columns.some(
            (col, index) => col.uuid !== localColumns[index].uuid || col.visible !== localColumns[index].visible
        );

        let updatePromise = Promise.resolve();

        if (hasColsStatesChanged && studyUuid) {
            const updatedColumnsState = localColumns.map((col, index) => ({
                columnId: col.uuid,
                visible: Boolean(col.visible),
                order: index,
            }));
            updatePromise = updateColumnStates(studyUuid, tableDefinition.uuid, updatedColumnsState);
        }

        updatePromise
            .then(() => {
                dispatch(
                    updateTableDefinition({
                        ...tableDefinition,
                        columns: localColumns,
                    })
                );
                // Apply the final state to AG Grid
                applyColumnState(localColumns);
            })
            .catch((error) => {
                resetColumnState();
                snackWithFallback(snackError, error, { headerId: 'spreadsheet/reorder_columns/error' });
            });

        handleCloseColumnsSettingDialog();
    }, [
        tableDefinition,
        studyUuid,
        handleCloseColumnsSettingDialog,
        localColumns,
        dispatch,
        applyColumnState,
        resetColumnState,
        snackError,
    ]);

    const handleToggle = (value: UUID) => {
        const newLocalColumns = localColumns.map((col) => {
            if (col.uuid === value) {
                gridRef.current?.api.setColumnsVisible([col.id], !col.visible);
                return {
                    ...col,
                    visible: !col.visible,
                    locked: col.locked && !col.visible,
                };
            }
            return col;
        });
        setLocalColumns(newLocalColumns);
        applyColumnState(newLocalColumns);
    };

    const handleToggleAll = () => {
        let isAllChecked = localColumns?.filter((col) => !col.visible).length === 0;
        // If all columns are selected/checked, then we hide all of them.
        const newLocalColumns = localColumns.map((col) => {
            return {
                ...col,
                visible: !isAllChecked,
                locked: col.locked && !col.visible,
            };
        });
        setLocalColumns(newLocalColumns);
        applyColumnState(newLocalColumns);
    };

    const handleClickOnLock = (value: UUID) => {
        // Early return if column is not visible
        const targetColumn = localColumns?.find((col) => col.uuid === value);
        if (!targetColumn?.visible) {
            return;
        }

        const lockedColumnsCount = localColumns.filter((col) => col.locked).length;

        const newLocalColumns = localColumns.map((col) => {
            if (col.uuid !== value) {
                return col;
            }

            // Allow unlocking always, but only allow locking if under limit
            const canToggleLock = col.locked || (!col.locked && lockedColumnsCount < MAX_LOCKS_PER_TAB);
            if (canToggleLock) {
                return {
                    ...col,
                    locked: !col.locked,
                };
            }

            return col;
        });

        setLocalColumns(newLocalColumns);
        applyColumnState(newLocalColumns);
    };

    const handleDragEnd = useCallback(
        ({ source, destination }: DropResult) => {
            if (destination) {
                let reorderedTableDefinitionIndexesTemp = [...localColumns];
                const [reorderedItem] = reorderedTableDefinitionIndexesTemp.splice(source.index, 1);
                reorderedTableDefinitionIndexesTemp.splice(destination.index, 0, reorderedItem);
                gridRef.current?.api.applyColumnState({
                    state: reorderedTableDefinitionIndexesTemp.map((col) => ({
                        colId: col.id,
                    })),
                    applyOrder: true,
                });
                setLocalColumns(reorderedTableDefinitionIndexesTemp);
                applyColumnState(reorderedTableDefinitionIndexesTemp);
            }
        },
        [applyColumnState, gridRef, localColumns]
    );

    const checkListColumnsNames = () => {
        let isAllChecked = localColumns?.filter((col) => !col.visible).length === 0;
        let isSomeChecked = localColumns?.filter((col) => col.visible).length !== 0;

        return (
            <>
                <ListItem sx={styles.checkboxSelectAll}>
                    <ListItemButton role={undefined} onClick={handleToggleAll} dense>
                        <Checkbox style={{ marginLeft: '21px' }} checked={isAllChecked} indeterminate={isSomeChecked} />
                        <FormattedMessage id="spreadsheet/column/dialog/check_all" />
                    </ListItemButton>
                </ListItem>
                <DroppableColumnsList
                    tableDefinition={tableDefinition}
                    columns={localColumns}
                    onDragEnd={handleDragEnd}
                    onToggle={handleToggle}
                    onClickOnLock={handleClickOnLock}
                    isLocked={(uuid: UUID) => localColumns?.find((col) => col.uuid === uuid)?.locked || false}
                />
            </>
        );
    };

    return (
        <>
            <Button
                sx={spreadsheetStyles.spreadsheetButton}
                disabled={disabled}
                size={'small'}
                onClick={handleOpenPopupSelectColumnNames}
            >
                <ViewColumnIcon />
                <FormattedMessage id="spreadsheet/column/button" />
            </Button>

            <SelectOptionsDialog
                open={popupSelectColumnNames}
                onClose={handleCancelPopupSelectColumnNames}
                onClick={handleSaveSelectedColumnNames}
                title={intl.formatMessage({
                    id: 'spreadsheet/column/dialog/title',
                })}
                child={checkListColumnsNames()}
                //Replacing overflow default value 'auto' by 'visible' in order to prevent a @hello-pangea/dnd warning related to nested scroll containers
                style={{
                    '& .MuiPaper-root': {
                        overflowY: 'visible',
                    },
                }}
            />
        </>
    );
};
