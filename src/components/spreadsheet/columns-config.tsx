/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Checkbox, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { SelectOptionsDialog } from 'utils/dialogs';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { AppState } from '../../redux/reducer';
import { changeDisplayedColumns, changeLockedColumns } from 'redux/actions';
import { spreadsheetStyles } from './utils/style';

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
    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState<boolean>(false);

    const allDisplayedColumnsNames = useSelector((state: AppState) => state.tables.columnsNames);
    const formattedDisplayedColumnsNames = useMemo(
        () => allDisplayedColumnsNames[tabIndex],
        [allDisplayedColumnsNames, tabIndex]
    );
    const allLockedColumnsNames = useSelector((state: AppState) => state.allLockedColumnsNames);
    const formattedLockedColumnsNames: Set<string> = useMemo(
        () => new Set(allLockedColumnsNames[tabIndex] ? JSON.parse(allLockedColumnsNames[tabIndex]) : []),
        [allLockedColumnsNames, tabIndex]
    );

    const [selectedColumnsNames, setSelectedColumnsNames] = useState(formattedDisplayedColumnsNames);
    const [lockedColumnsNames, setLockedColumnsNames] = useState<Set<string>>(formattedLockedColumnsNames);

    const dispatch = useDispatch();

    const intl = useIntl();

    const handleOpenPopupSelectColumnNames = useCallback(() => {
        setPopupSelectColumnNames(true);
    }, []);

    const handleCloseColumnsSettingDialog = useCallback(() => {
        setPopupSelectColumnNames(false);
    }, []);

    useEffect(() => {
        setSelectedColumnsNames(formattedDisplayedColumnsNames);
        setLockedColumnsNames(formattedLockedColumnsNames);
    }, [formattedDisplayedColumnsNames, formattedLockedColumnsNames]);

    const handleCancelPopupSelectColumnNames = useCallback(() => {
        setSelectedColumnsNames(formattedDisplayedColumnsNames);
        setLockedColumnsNames(formattedLockedColumnsNames);
        handleCloseColumnsSettingDialog();
    }, [formattedDisplayedColumnsNames, formattedLockedColumnsNames, handleCloseColumnsSettingDialog]);

    const handleSaveSelectedColumnNames = useCallback(() => {
        dispatch(changeDisplayedColumns({ index: tabIndex, value: selectedColumnsNames }));
        dispatch(changeLockedColumns({ index: tabIndex, value: lockedColumnsNames }));
        handleCloseColumnsSettingDialog();
    }, [tabIndex, lockedColumnsNames, handleCloseColumnsSettingDialog, selectedColumnsNames, dispatch]);

    const handleToggle = (value: string) => () => {
        setSelectedColumnsNames((prevSelectedColumnsNames) => {
            const idx = prevSelectedColumnsNames.findIndex((col) => col.colId === value);
            const newColumns = [...prevSelectedColumnsNames];
            newColumns[idx] = {
                colId: newColumns[idx].colId,
                visible: !newColumns[idx].visible,
            };
            return newColumns;
        });
        setLockedColumnsNames((prevLockedColumnsNames) => {
            const newLockedColumns = new Set(prevLockedColumnsNames);
            newLockedColumns.delete(value);
            return newLockedColumns;
        });
    };

    const handleToggleAll = () => {
        let isAllChecked = selectedColumnsNames.filter((col) => !col.visible).length === 0;
        // If all columns are selected/checked, then we hide all of them.
        setSelectedColumnsNames((prevSelectedColumnsNames) => {
            return prevSelectedColumnsNames.map((col) => {
                return {
                    colId: col.colId,
                    visible: !isAllChecked,
                };
            });
        });
        if (isAllChecked) {
            setLockedColumnsNames(new Set());
        }
    };

    const handleClickOnLock = (value: string) => () => {
        if (selectedColumnsNames.filter((col) => col.colId === value && col.visible).length === 0) {
            return;
        }
        const newLocked = new Set(lockedColumnsNames.values());
        if (lockedColumnsNames.has(value)) {
            newLocked.delete(value);
        } else {
            if (lockedColumnsNames.size < MAX_LOCKS_PER_TAB) {
                newLocked.add(value);
            }
        }
        setLockedColumnsNames(newLocked);
    };

    const handleDrag = useCallback(
        ({ source, destination }: DropResult) => {
            if (destination) {
                let reorderedTableDefinitionIndexesTemp = [...selectedColumnsNames];
                const [reorderedItem] = reorderedTableDefinitionIndexesTemp.splice(source.index, 1);
                reorderedTableDefinitionIndexesTemp.splice(destination.index, 0, reorderedItem);
                setSelectedColumnsNames(reorderedTableDefinitionIndexesTemp);
            }
        },
        [selectedColumnsNames]
    );

    const renderColumnConfigLockIcon = (value: string) => {
        if (lockedColumnsNames?.has(value)) {
            return <LockIcon sx={styles.columnConfigClosedLock} />;
        }
        return <LockOpenIcon sx={styles.columnConfigOpenLock} />;
    };

    const checkListColumnsNames = () => {
        let isAllChecked = selectedColumnsNames.filter((col) => !col.visible).length === 0;
        let isSomeChecked = selectedColumnsNames.filter((col) => col.visible).length !== 0;

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
                                {[...selectedColumnsNames].map(({ colId, visible }, index) => (
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
                                                        onClick={handleClickOnLock(colId)}
                                                        style={{
                                                            minWidth: 0,
                                                            width: '20px',
                                                        }}
                                                    >
                                                        {renderColumnConfigLockIcon(colId)}
                                                    </ListItemIcon>
                                                    <ListItemIcon onClick={handleToggle(colId)}>
                                                        <Checkbox checked={visible} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        onClick={handleToggle(colId)}
                                                        primary={intl.formatMessage({
                                                            id: `${colId}`,
                                                        })}
                                                    />
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
