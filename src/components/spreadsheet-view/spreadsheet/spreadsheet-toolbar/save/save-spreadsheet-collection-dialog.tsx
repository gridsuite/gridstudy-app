/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Checkbox, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSelector } from 'react-redux';
import {
    ElementSaveDialog,
    ElementType,
    type IElementCreationDialog,
    type IElementUpdateDialog,
    type MuiStyles,
    useSnackMessage,
    type UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { AppState } from '../../../../../redux/reducer';
import { SelectOptionsDialog } from '../../../../../utils/dialogs';
import {
    ColumnDefinitionDto,
    SpreadsheetCollection,
    SpreadsheetConfig,
    SpreadsheetEquipmentType,
} from '../../../types/spreadsheet.type';
import { v4 as uuid4 } from 'uuid';
import { saveSpreadsheetCollection, updateSpreadsheetCollection } from '../../../../../services/explore';
import { NodeAlias } from '../../../types/node-alias.type';
import { SPREADSHEET_STORE_FIELD } from 'utils/store-sort-filter-fields';
import { GlobalFilter } from '../../../../results/common/global-filter/global-filter-types';

interface SaveSpreadsheetCollectionDialogProps {
    open: UseStateBooleanReturn;
    nodeAliases: NodeAlias[] | undefined;
}

const styles = {
    checkboxForFilters: (theme) => ({
        padding: theme.spacing(0, 3, 0, 2),
        fontWeight: 'bold',
        cursor: 'pointer',
    }),
    checkboxSelectAll: (theme) => ({
        padding: theme.spacing(0, 3, 2, 2),
        fontWeight: 'bold',
        cursor: 'pointer',
    }),
    checkboxItem: {
        cursor: 'pointer',
        padding: '0 16px',
    },
} as const satisfies MuiStyles;

interface TableState {
    name: string;
    type: SpreadsheetEquipmentType;
    selected: boolean;
    index: number;
}

export const SaveSpreadsheetCollectionDialog: FunctionComponent<SaveSpreadsheetCollectionDialogProps> = ({
    open,
    nodeAliases,
}) => {
    const { snackError, snackInfo } = useSnackMessage();
    const intl = useIntl();
    const tables = useSelector((state: AppState) => state.tables.definitions);
    const tablesFilters = useSelector((state: AppState) => state[SPREADSHEET_STORE_FIELD]);
    const tablesFiltersState = useSelector((state: AppState) => state.globalFilterSpreadsheetState);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [localTablesState, setLocalTablesState] = useState<TableState[]>([]);
    const [selectedConfigs, setSelectedConfigs] = useState<SpreadsheetConfig[]>([]);
    const [showElementCreationDialog, setShowElementCreationDialog] = useState(false);
    const [areFiltersIncluded, setAreFiltersIncluded] = useState(false);

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
            setAreFiltersIncluded(false);
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

    const handleToggleFilters = useCallback(() => {
        setAreFiltersIncluded((prev) => !prev);
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
                    const columnFilter: Partial<ColumnDefinitionDto> = {};
                    if (areFiltersIncluded) {
                        const filter = tablesFilters[table.uuid]?.find((f) => f.column === column.id);
                        if (filter) {
                            columnFilter.filterDataType = filter.dataType;
                            columnFilter.filterTolerance = filter.tolerance;
                            columnFilter.filterType = filter.type;
                            columnFilter.filterValue = JSON.stringify(filter.value);
                        }
                    }
                    const dto: ColumnDefinitionDto = {
                        uuid: column.uuid ?? uuid4(),
                        id: column.id,
                        name: column.name,
                        type: column.type,
                        precision: column.precision,
                        formula: column.formula || '',
                        dependencies: column.dependencies?.length ? JSON.stringify(column.dependencies) : undefined,
                        ...columnFilter,
                        visible: true,
                    };
                    return dto;
                })
                .filter((col): col is ColumnDefinitionDto => col !== null);
        },
        [areFiltersIncluded, tables, tablesFilters]
    );

    const getTableGlobalFilters = useCallback(
        (tableIndex: number): GlobalFilter[] => {
            const tableUuid = tables[tableIndex].uuid;
            return tablesFiltersState[tableUuid] ?? [];
        },
        [tablesFiltersState, tables]
    );

    const handleNext = useCallback(() => {
        const configs: SpreadsheetConfig[] = localTablesState
            .filter((table) => table.selected)
            .map((table) => ({
                name: table.name,
                sheetType: table.type,
                columns: getReorderedColumns(table.index),
                globalFilters: areFiltersIncluded ? getTableGlobalFilters(table.index) : undefined,
            }));

        setSelectedConfigs(configs);
        handleClose();
        setShowElementCreationDialog(true);
    }, [localTablesState, handleClose, getReorderedColumns, areFiltersIncluded, getTableGlobalFilters]);

    const handleSaveCollection = useCallback(
        async (element: IElementCreationDialog) => {
            try {
                const collection: SpreadsheetCollection = {
                    spreadsheetConfigs: selectedConfigs,
                    nodeAliases: nodeAliases?.map((n) => n.alias),
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
        [selectedConfigs, snackInfo, snackError, nodeAliases]
    );

    const handleUpdateCollection = useCallback(
        async ({ id, name, description, elementFullPath }: IElementUpdateDialog) => {
            try {
                const collection: SpreadsheetCollection = {
                    spreadsheetConfigs: selectedConfigs,
                    nodeAliases: nodeAliases?.map((n) => n.alias),
                };

                await updateSpreadsheetCollection(id, collection, name, description);
                snackInfo({
                    headerId: 'spreadsheet/collection/update/success',
                    headerValues: {
                        item: elementFullPath,
                    },
                });
                setShowElementCreationDialog(false);
            } catch (error) {
                snackError({
                    headerId: 'spreadsheet/collection/update/error',
                    headerValues: {
                        item: elementFullPath,
                    },
                    messageTxt: error instanceof Error ? error.message : String(error),
                });
            }
        },
        [selectedConfigs, nodeAliases, snackInfo, snackError]
    );

    const isAllChecked = localTablesState.length > 0 && localTablesState.every((table) => table.selected);
    const isSomeChecked = localTablesState.some((table) => table.selected);

    const checkListContent = (
        <>
            <ListItem sx={styles.checkboxForFilters}>
                <ListItemButton role={undefined} onClick={handleToggleFilters} dense>
                    <Checkbox style={{ marginLeft: '21px' }} checked={areFiltersIncluded} />
                    <FormattedMessage id="spreadsheet/column/dialog/include_filters" />
                </ListItemButton>
            </ListItem>
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
                <ElementSaveDialog
                    open={showElementCreationDialog}
                    onClose={() => setShowElementCreationDialog(false)}
                    onSave={handleSaveCollection}
                    OnUpdate={handleUpdateCollection}
                    type={ElementType.SPREADSHEET_CONFIG_COLLECTION}
                    titleId={'spreadsheet/collection/save/collection_name_dialog_title'}
                    studyUuid={studyUuid}
                    selectorTitleId="spreadsheet/create_new_spreadsheet/select_spreadsheet_collection"
                    createLabelId="spreadsheet/collection/save/create"
                    updateLabelId="spreadsheet/collection/save/replace"
                />
            )}
        </>
    );
};
