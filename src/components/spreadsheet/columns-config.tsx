/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Checkbox, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { FunctionComponent, useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { SelectOptionsDialog } from 'utils/dialogs';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { AppState } from '../../redux/reducer';
import { changeDisplayedColumns, changeLockedColumns, changeReorderedColumns } from 'redux/actions';
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
    reorderedTableDefinitionIndexes: string[];
    setReorderedTableDefinitionIndexes: (indices: string[]) => void;
    selectedColumnsNames: Set<string>;
    setSelectedColumnsNames: (names: Set<string>) => void;
    lockedColumnsNames: Set<string>;
    setLockedColumnsNames: (names: Set<string>) => void;
    disabled: boolean;
}

export const ColumnsConfig: FunctionComponent<ColumnsConfigProps> = ({
    tabIndex,
    reorderedTableDefinitionIndexes,
    setReorderedTableDefinitionIndexes,
    selectedColumnsNames,
    setSelectedColumnsNames,
    lockedColumnsNames,
    setLockedColumnsNames,
    disabled,
}) => {
    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState<boolean>(false);

    const allDisplayedColumnsNames = useSelector((state: AppState) => state.tables.columnsNamesJson);
    const allLockedColumnsNames = useSelector((state: AppState) => state.allLockedColumnsNames);
    const allReorderedTableDefinitionIndexes = useSelector(
        (state: AppState) => state.allReorderedTableDefinitionIndexes
    );
    const tablesNames = useSelector((state: AppState) => state.tables.names);
    const columnsNames = useSelector((state: AppState) => state.tables.columnsNames);

    const dispatch = useDispatch();

    const intl = useIntl();

    const handleOpenPopupSelectColumnNames = useCallback(() => {
        setPopupSelectColumnNames(true);
    }, []);

    const handleCloseColumnsSettingDialog = useCallback(() => {
        setPopupSelectColumnNames(false);
    }, []);

    const handleCancelPopupSelectColumnNames = useCallback(() => {
        const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
        setSelectedColumnsNames(new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : []));
        const allLockedTemp = allLockedColumnsNames[tabIndex];
        setLockedColumnsNames(new Set(allLockedTemp ? JSON.parse(allLockedTemp) : []));
        const allReorderedTemp = allReorderedTableDefinitionIndexes[tabIndex];
        setReorderedTableDefinitionIndexes(allReorderedTemp ? JSON.parse(allReorderedTemp) : []);
        handleCloseColumnsSettingDialog();
    }, [
        allDisplayedColumnsNames,
        tabIndex,
        setSelectedColumnsNames,
        allLockedColumnsNames,
        setLockedColumnsNames,
        allReorderedTableDefinitionIndexes,
        setReorderedTableDefinitionIndexes,
        handleCloseColumnsSettingDialog,
    ]);

    const handleSaveSelectedColumnNames = useCallback(() => {
        const dispatchConfigParameter = (value: any, index: number, dispatchAction: Function) => {
            const columns = new Array(tablesNames.length);
            columns[index] = {
                index: index,
                value: JSON.stringify(value),
            };
            dispatch(dispatchAction(columns));
        };

        const selectedColumnsArray = Array.from(selectedColumnsNames);
        const lockedColumnsToSave = [...lockedColumnsNames].filter((name) => selectedColumnsNames.has(name));

        dispatchConfigParameter(selectedColumnsArray, tabIndex, changeDisplayedColumns);
        dispatchConfigParameter(lockedColumnsToSave, tabIndex, changeLockedColumns);
        dispatchConfigParameter(reorderedTableDefinitionIndexes, tabIndex, changeReorderedColumns);

        handleCloseColumnsSettingDialog();
    }, [
        tabIndex,
        lockedColumnsNames,
        tablesNames,
        reorderedTableDefinitionIndexes,
        handleCloseColumnsSettingDialog,
        selectedColumnsNames,
        dispatch,
    ]);

    const handleToggle = (value: string) => () => {
        const newChecked = new Set(selectedColumnsNames.values());
        const newLocked = new Set(lockedColumnsNames.values());
        if (selectedColumnsNames.has(value)) {
            newChecked.delete(value);
            if (lockedColumnsNames.has(value)) {
                newLocked.delete(value);
            }
        } else {
            newChecked.add(value);
        }
        setSelectedColumnsNames(newChecked);
        setLockedColumnsNames(newLocked);
    };

    const handleToggleAll = () => {
        let isAllChecked = selectedColumnsNames.size === columnsNames[tabIndex].size;
        // If all columns are selected/checked, then we hide all of them.
        setSelectedColumnsNames(isAllChecked ? new Set() : columnsNames[tabIndex]);
        if (isAllChecked) {
            setLockedColumnsNames(new Set());
        }
    };

    const handleClickOnLock = (value: string) => () => {
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
                let reorderedTableDefinitionIndexesTemp = [...reorderedTableDefinitionIndexes];
                const [reorderedItem] = reorderedTableDefinitionIndexesTemp.splice(source.index, 1);
                reorderedTableDefinitionIndexesTemp.splice(destination.index, 0, reorderedItem);
                setReorderedTableDefinitionIndexes(reorderedTableDefinitionIndexesTemp);
            }
        },
        [reorderedTableDefinitionIndexes, setReorderedTableDefinitionIndexes]
    );

    const renderColumnConfigLockIcon = (value: string) => {
        if (selectedColumnsNames.has(value)) {
            if (lockedColumnsNames.has(value)) {
                return <LockIcon sx={styles.columnConfigClosedLock} />;
            } else {
                if (lockedColumnsNames.size < MAX_LOCKS_PER_TAB) {
                    return <LockOpenIcon sx={styles.columnConfigOpenLock} />;
                }
            }
        }
    };

    const checkListColumnsNames = () => {
        let isAllChecked = selectedColumnsNames.size === columnsNames[tabIndex].size;
        let isSomeChecked = selectedColumnsNames.size !== 0 && !isAllChecked;

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
                                {[...reorderedTableDefinitionIndexes].map((value, index) => (
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
                                                        onClick={handleClickOnLock(value)}
                                                        style={{
                                                            minWidth: 0,
                                                            width: '20px',
                                                        }}
                                                    >
                                                        {renderColumnConfigLockIcon(value)}
                                                    </ListItemIcon>
                                                    <ListItemIcon onClick={handleToggle(value)}>
                                                        <Checkbox checked={selectedColumnsNames.has(value)} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        onClick={handleToggle(value)}
                                                        primary={intl.formatMessage({
                                                            id: `${value}`,
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
