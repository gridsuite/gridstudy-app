/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Checkbox, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { SelectOptionsDialog } from 'utils/dialogs';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { updateTableDefinition } from 'redux/actions';
import { UUID } from 'crypto';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { spreadsheetStyles } from '../../spreadsheet.style';
import { updateColumnStates } from 'services/study/study-config';
import { AppState } from 'redux/reducer';
import { ColumnState } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { ROW_INDEX_COLUMN_STATE } from '../../constants';

const MAX_LOCKS_PER_TAB = 5;

const styles = {
    checkboxSelectAll: (theme: Theme) => ({
        padding: theme.spacing(0, 3, 2, 2),
        fontWeight: 'bold',
        cursor: 'pointer',
    }),
    checkboxItem: {
        cursor: 'pointer',
    },
    columnConfigClosedLock: (theme: Theme) => ({
        fontSize: '1.2em',
        color: theme.palette.action.active,
    }),
    columnConfigOpenLock: (theme: Theme) => ({
        fontSize: '1.2em',
        color: theme.palette.action.disabled,
    }),
};

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

    // Restore AG Grid column state to match the original tableDefinition.columns
    const resetColumnState = useCallback(() => {
        if (gridRef.current?.api) {
            gridRef.current.api.applyColumnState({
                state: [
                    ROW_INDEX_COLUMN_STATE,
                    ...tableDefinition.columns.map((col) => ({
                        colId: col.id || col.uuid,
                        hide: !col.visible,
                        pinned: col.locked ? ('left' as const) : null,
                    })),
                ],
                applyOrder: true,
                defaultState: { pinned: null, hide: false },
            });
        }
    }, [gridRef, tableDefinition.columns]);

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
            })
            .catch((error) => {
                resetColumnState();
                snackError({
                    messageTxt: error,
                    headerId: 'spreadsheet/reorder_columns/error',
                });
            });

        handleCloseColumnsSettingDialog();
    }, [
        tableDefinition,
        studyUuid,
        localColumns,
        handleCloseColumnsSettingDialog,
        dispatch,
        resetColumnState,
        snackError,
    ]);

    const handleToggle = (value: UUID) => () => {
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

        const userLockedColumns =
            newLocalColumns.map((column) => {
                return {
                    colId: column.id,
                    hide: isAllChecked,
                    pinned: 'left',
                } as ColumnState;
            }) || [];
        gridRef.current?.api?.applyColumnState({
            state: [ROW_INDEX_COLUMN_STATE, ...userLockedColumns],
            defaultState: { pinned: null },
        });
        setLocalColumns(newLocalColumns);
    };

    const handleClickOnLock = (value: UUID) => () => {
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

        const userLockedColumns =
            newLocalColumns
                ?.filter((column) => column.visible && column.locked)
                ?.map((column) => {
                    return {
                        colId: column.id,
                        pinned: 'left',
                    } as ColumnState;
                }) || [];
        gridRef.current?.api?.applyColumnState({
            state: [ROW_INDEX_COLUMN_STATE, ...userLockedColumns],
            defaultState: { pinned: null },
        });
        setLocalColumns(newLocalColumns);
    };

    const handleDrag = useCallback(
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
            }
        },
        [gridRef, localColumns]
    );

    const renderColumnConfigLockIcon = (value: UUID) => {
        if (localColumns?.find((col) => col.uuid === value)?.locked) {
            return <LockIcon sx={styles.columnConfigClosedLock} />;
        }
        return <LockOpenIcon sx={styles.columnConfigOpenLock} />;
    };

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

                <DragDropContext onDragEnd={handleDrag}>
                    <Droppable droppableId="network-table-columns-list">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {[...localColumns].map(({ uuid, name, visible }, index) => (
                                    <Draggable
                                        draggableId={tableDefinition.uuid + '-' + index}
                                        index={index}
                                        key={tableDefinition.uuid + '-' + index}
                                    >
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                                <ListItem
                                                    sx={styles.checkboxItem}
                                                    style={{
                                                        padding: '0 16px',
                                                    }}
                                                >
                                                    <IconButton {...provided.dragHandleProps} size={'small'}>
                                                        <DragIndicatorIcon spacing={0} edgeMode={'start'} />
                                                    </IconButton>

                                                    <ListItemIcon
                                                        onClick={handleClickOnLock(uuid)}
                                                        style={{
                                                            minWidth: 0,
                                                            width: '20px',
                                                        }}
                                                    >
                                                        {renderColumnConfigLockIcon(uuid)}
                                                    </ListItemIcon>
                                                    <ListItemIcon onClick={handleToggle(uuid)}>
                                                        <Checkbox checked={visible} />
                                                    </ListItemIcon>
                                                    <ListItemText onClick={handleToggle(uuid)} primary={name} />
                                                </ListItem>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
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
