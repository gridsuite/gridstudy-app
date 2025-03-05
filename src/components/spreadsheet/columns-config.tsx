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
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { AppState } from '../../redux/reducer';
import { updateTableDefinition } from 'redux/actions';
import { spreadsheetStyles } from './utils/style';
import { UUID } from 'crypto';
import { reorderSpreadsheetColumns } from 'services/study-config';
import { useSnackMessage } from '@gridsuite/commons-ui';

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
    tabIndex: number;
    disabled: boolean;
}

export const ColumnsConfig: FunctionComponent<ColumnsConfigProps> = ({ tabIndex, disabled }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const tableDefinition = useSelector((state: AppState) => state.tables.definitions[tabIndex]);

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

    const handleCancelPopupSelectColumnNames = useCallback(() => {
        setLocalColumns(tableDefinition?.columns);
        handleCloseColumnsSettingDialog();
    }, [tableDefinition?.columns, handleCloseColumnsSettingDialog]);

    const handleSaveSelectedColumnNames = useCallback(() => {
        // check if column order has changed by comparing uuids
        const hasOrderChanged = tableDefinition.columns.some((col, index) => col.uuid !== localColumns[index].uuid);

        // create a Promise chain that conditionally includes the reorder request
        const updatePromise = hasOrderChanged
            ? reorderSpreadsheetColumns(
                  tableDefinition.uuid,
                  localColumns.map((col) => col.uuid)
              )
            : Promise.resolve();

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
                snackError({
                    messageTxt: error,
                    headerId: 'spreadsheet/reorder_columns/error',
                });
            });

        handleCloseColumnsSettingDialog();
    }, [tableDefinition, localColumns, handleCloseColumnsSettingDialog, dispatch, snackError]);

    const handleToggle = (value: UUID) => () => {
        const newLocalColumns = localColumns.map((col) => {
            if (col.uuid === value) {
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

        setLocalColumns(newLocalColumns);
    };

    const handleDrag = useCallback(
        ({ source, destination }: DropResult) => {
            if (destination) {
                let reorderedTableDefinitionIndexesTemp = [...localColumns];
                const [reorderedItem] = reorderedTableDefinitionIndexesTemp.splice(source.index, 1);
                reorderedTableDefinitionIndexesTemp.splice(destination.index, 0, reorderedItem);
                setLocalColumns(reorderedTableDefinitionIndexesTemp);
            }
        },
        [localColumns]
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
                                        draggableId={tabIndex + '-' + index}
                                        index={index}
                                        key={tabIndex + '-' + index}
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
                //Replacing overflow default value 'auto' by 'visible' in order to prevent a react-beautiful-dnd warning related to nested scroll containers
                style={{
                    '& .MuiPaper-root': {
                        overflowY: 'visible',
                    },
                }}
            />
        </>
    );
};
