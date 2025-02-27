/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Theme } from '@mui/material';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSelector } from 'react-redux';
import {
    ElementType,
    UseStateBooleanReturn,
    useSnackMessage,
    IElementCreationDialog,
    ElementCreationDialog,
} from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer';
import { SelectOptionsDialog } from '../../../utils/dialogs';
import {
    SpreadsheetConfig,
    SpreadsheetCollection,
    ColumnDefinitionDto,
    SpreadsheetEquipmentType,
} from '../config/spreadsheet.type';
import { v4 as uuid4 } from 'uuid';
import { saveSpreadsheetCollection } from '../../../services/explore';

interface SpreadsheetCollectionSaveDialogProps {
    open: UseStateBooleanReturn;
}

const styles = {
    checkboxSelectAll: (theme: Theme) => ({
        padding: theme.spacing(0, 3, 2, 2),
        fontWeight: 'bold',
        cursor: 'pointer',
    }),
    checkboxItem: {
        cursor: 'pointer',
        padding: '0 16px',
    },
};

interface TableState {
    name: string;
    type: SpreadsheetEquipmentType;
    selected: boolean;
    index: number;
}

export const SpreadsheetCollectionSaveDialog: FunctionComponent<SpreadsheetCollectionSaveDialogProps> = ({ open }) => {
    const { snackError, snackInfo } = useSnackMessage();
    const intl = useIntl();
    const tables = useSelector((state: AppState) => state.tables.definitions);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [localTablesState, setLocalTablesState] = useState<TableState[]>([]);
    const [selectedConfigs, setSelectedConfigs] = useState<SpreadsheetConfig[]>([]);
    const [showElementCreationDialog, setShowElementCreationDialog] = useState(false);

    // Initialize local state when dialog opens
    useEffect(() => {
        if (open.value) {
            setLocalTablesState(
                tables.map((table, index) => ({
                    name: table.name,
                    type: table.type,
                    selected: true,
                    index,
                }))
            );
        }
    }, [open.value, tables]);

    const handleClose = useCallback(() => {
        open.setFalse();
    }, [open]);

    const toggleTableSelection = (prev: TableState[], targetIndex: number) =>
        prev.map((table) => (table.index === targetIndex ? { ...table, selected: !table.selected } : table));

    const handleToggle = useCallback(
        (index: number) => () => {
            setLocalTablesState((prev) => toggleTableSelection(prev, index));
        },
        []
    );

    const handleToggleAll = useCallback(() => {
        setLocalTablesState((prev) => {
            const allSelected = prev.every((table) => table.selected);
            return prev.map((table) => ({
                ...table,
                selected: !allSelected,
            }));
        });
    }, []);

    const handleDrag = useCallback(({ source, destination }: DropResult) => {
        if (destination) {
            setLocalTablesState((prev) => {
                const reordered = [...prev];
                const [removed] = reordered.splice(source.index, 1);
                reordered.splice(destination.index, 0, removed);
                return reordered;
            });
        }
    }, []);

    const getReorderedColumns = useCallback(
        (tableIndex: number): ColumnDefinitionDto[] => {
            const table = tables[tableIndex];

            return table.columns
                .map((state) => {
                    const column = table.columns.find((col) => col.id === state.id);
                    if (!column) {
                        return null;
                    }
                    const dto: ColumnDefinitionDto = {
                        uuid: column.uuid ?? uuid4(),
                        id: column.id,
                        name: column.name,
                        type: column.type,
                        precision: column.precision,
                        formula: column.formula || '',
                        dependencies: column.dependencies?.length ? JSON.stringify(column.dependencies) : undefined,
                    };
                    return dto;
                })
                .filter((col): col is ColumnDefinitionDto => col !== null);
        },
        [tables]
    );

    const handleNext = useCallback(() => {
        const configs: SpreadsheetConfig[] = localTablesState
            .filter((table) => table.selected)
            .map((table) => ({
                name: table.name,
                sheetType: table.type,
                columns: getReorderedColumns(table.index),
            }));

        setSelectedConfigs(configs);
        handleClose();
        setShowElementCreationDialog(true);
    }, [localTablesState, getReorderedColumns, handleClose]);

    const handleSaveCollection = useCallback(
        async (element: IElementCreationDialog) => {
            try {
                const collection: SpreadsheetCollection = {
                    spreadsheetConfigs: selectedConfigs,
                };

                await saveSpreadsheetCollection(collection, element.name, element.description, element.folderId);
                snackInfo({
                    headerId: 'spreadsheet/collection/save/success',
                    headerValues: {
                        folderName: element.folderName,
                    },
                });
                setShowElementCreationDialog(false);
            } catch (error) {
                snackError({
                    headerId: 'spreadsheet/collection/save/error',
                    messageTxt: error instanceof Error ? error.message : String(error),
                });
            }
        },
        [selectedConfigs, snackInfo, snackError]
    );

    const isAllChecked = localTablesState.length > 0 && localTablesState.every((table) => table.selected);
    const isSomeChecked = localTablesState.some((table) => table.selected);

    const checkListContent = (
        <>
            <ListItem sx={styles.checkboxSelectAll}>
                <ListItemButton role={undefined} onClick={handleToggleAll} dense>
                    <Checkbox
                        style={{ marginLeft: '21px' }}
                        checked={isAllChecked}
                        indeterminate={!isAllChecked && isSomeChecked}
                    />
                    <FormattedMessage id="spreadsheet/column/dialog/check_all" />
                </ListItemButton>
            </ListItem>

            <DragDropContext onDragEnd={handleDrag}>
                <Droppable droppableId="spreadsheet-collection-list">
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {localTablesState.map((table, index) => (
                                <Draggable draggableId={`table-${index}`} index={index} key={`table-${index}`}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps}>
                                            <ListItem sx={styles.checkboxItem}>
                                                <IconButton {...provided.dragHandleProps} size={'small'}>
                                                    <DragIndicatorIcon />
                                                </IconButton>
                                                <ListItemIcon onClick={handleToggle(table.index)}>
                                                    <Checkbox checked={table.selected} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    onClick={handleToggle(table.index)}
                                                    primary={table.name}
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

    const hasSelectedTables = useMemo(() => localTablesState.some((table) => table.selected), [localTablesState]);

    return (
        <>
            <SelectOptionsDialog
                open={open.value && !showElementCreationDialog}
                onClose={handleClose}
                onClick={handleNext}
                title={intl.formatMessage({
                    id: 'spreadsheet/collection/save/title',
                })}
                child={checkListContent}
                style={{
                    '& .MuiPaper-root': {
                        overflowY: 'visible',
                    },
                }}
                disabled={!hasSelectedTables}
            />
            {showElementCreationDialog && studyUuid && (
                <ElementCreationDialog
                    open={showElementCreationDialog}
                    onClose={() => setShowElementCreationDialog(false)}
                    onSave={handleSaveCollection}
                    type={ElementType.SPREADSHEET_CONFIG_COLLECTION}
                    titleId={'spreadsheet/collection/save/collection_name_dialog_title'}
                    studyUuid={studyUuid}
                />
            )}
        </>
    );
};
