/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AppBar,
    Badge,
    Button,
    Dialog,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    SxProps,
    Theme,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddCircle as AddCircleIcon,
    Close as CloseIcon,
    DeleteForever as DeleteForeverIcon,
    Edit as EditIcon,
    ImportExport as ImportExportIcon,
    Save as SaveIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useStateBoolean, UseStateBooleanReturn } from '../../../hooks/use-states';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { TABLES_NAMES } from '../utils/config-tables';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnWithFormula, CustomEntry } from './custom-columns.types';
import CustomColumnsImExPort from './custom-columns-port';
import { AppDispatch } from '../../../redux/store';
import { setCustomColumDefinitions } from '../../../redux/actions';
import CustomColumnDialog from './custom-column-dialog';

type CustomColumnItemProps = {
    data: ColumnWithFormula;
    onDelete: () => void;
    onEdit: () => void;
};

const styles: Record<string, SxProps<Theme>> = {
    toolbarBtn: {
        marginRight: 1,
    },
};

function CustomColumnItem({ data, onDelete, onEdit }: Readonly<CustomColumnItemProps>) {
    return (
        <ListItem
            sx={{
                '&.MuiListItem-secondaryAction': {
                    //default of 48px
                    //TODO: get original padding from theme
                    paddingRight: 96,
                },
            }}
            //TODO: maybe use a horizontal grid?
            secondaryAction={
                <>
                    <IconButton aria-label="modify" onClick={onEdit} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={onDelete} color="secondary" edge="end">
                        <DeleteForeverIcon />
                    </IconButton>
                </>
            }
        >
            <ListItemText primary={data.name} secondary={data.formula} />
        </ListItem>
    );
}

function someCheckOnDefs(columns: ColumnWithFormula[]) {
    //help some checks with yup?
    console.error(JSON.stringify(columns));
    if (!(columns instanceof Array)) {
        throw new Error("Column definitions isn't a list of columns");
    }
    const names = new Set<string>();
    for (const column of columns) {
        if (typeof column !== 'object') {
            throw new Error('Column definition must be an object', { cause: column });
        }
        const objKeys = Object.keys(column);
        if (
            objKeys.length !== 2 ||
            (objKeys[0] !== 'name' && objKeys[1] !== 'name') ||
            (objKeys[0] !== 'formula' && objKeys[1] !== 'formula')
        ) {
            throw new Error('Invalid column definition', { cause: column });
        }
        if (!column.name) {
            throw new Error(`Invalid column name "${column.name}"`);
        }
        column.name = column.name.trim();
        if (!column.formula) {
            throw new Error(`Invalid formula "${column.formula}"`);
        }
        column.formula = column.formula.trim();
        if (names.has(column.name)) {
            throw new Error('Formula names not unique');
        } else {
            names.add(column.name);
        }
        //TODO found how to validate formula
    }
    return columns;
}

export type CustomColumnsDialogProps = {
    open: UseStateBooleanReturn;
    indexTab: number;
};

//TODO idea: we can eval formulas with first line to detect common errors in advance and letting the user correcting it
export default function CustomColumnsDialog({ indexTab, open }: Readonly<CustomColumnsDialogProps>) {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const allDefinitions = useSelector((state: AppState) => state.allCustomColumnsDefinitions[TABLES_NAMES[indexTab]]);
    const [columnsDefinitions, setColumnsDefinitions] = useState<CustomEntry>({ filter: { formula: '' }, columns: [] });
    const contentModified = useStateBoolean(false);
    const resetContentModified = contentModified.setFalse;
    const contentIsModified = contentModified.setTrue;
    useEffect(() => {
        if (open.value) {
            setColumnsDefinitions({
                columns: allDefinitions.columns.map((def) => ({ ...def })),
                filter: allDefinitions.filter,
            });
            resetContentModified();
            setDialogColumnWorkingOn(undefined);
        }
    }, [open.value, allDefinitions, resetContentModified]);

    const onImportJson = useCallback(
        (content: unknown) => {
            setColumnsDefinitions((content ?? []) as CustomEntry);
            contentIsModified();
            return true;
        },
        [contentIsModified]
    );
    const dialogImportOpen = useStateBoolean(false);

    const dialogColumnOpen = useStateBoolean(false);
    const [dialogColumnWorkingOn, setDialogColumnWorkingOn] = useState<ColumnWithFormula | undefined>(undefined);
    const onListItemDelete = useCallback(
        (itemIdx: number) => {
            setColumnsDefinitions((prevState) => {
                let tmp = [...prevState.columns];
                tmp.splice(itemIdx, 1);
                return { columns: tmp, filter: prevState.filter };
            });
            contentIsModified();
        },
        [contentIsModified]
    );
    const onListItemEdit = useCallback(
        (itemIdx: number) => {
            setDialogColumnWorkingOn(columnsDefinitions.columns[itemIdx]);
            dialogColumnOpen.setTrue();
        },
        [columnsDefinitions, dialogColumnOpen]
    );
    const onAddColumnClick = useCallback(() => {
        setDialogColumnWorkingOn(undefined);
        dialogColumnOpen.setTrue();
    }, [dialogColumnOpen]);
    const onImportColumn = useCallback(
        (columnDef: ColumnWithFormula) => {
            let newDefs: ColumnWithFormula[];
            if (dialogColumnWorkingOn === undefined) {
                newDefs = [...columnsDefinitions.columns, columnDef];
            } else {
                newDefs = [...columnsDefinitions.columns];
                newDefs.splice(
                    columnsDefinitions.columns.findIndex(
                        (value, index, arr) => value.name === dialogColumnWorkingOn.name
                    ),
                    1,
                    columnDef
                );
                setDialogColumnWorkingOn(undefined); //clean memory
            }
            setColumnsDefinitions({ columns: someCheckOnDefs(newDefs), filter: { formula: '' } });
            contentIsModified();
        },
        [columnsDefinitions, contentIsModified, dialogColumnWorkingOn]
    );

    const onSaveClick = useCallback(() => {
        dispatch(
            setCustomColumDefinitions(TABLES_NAMES[indexTab], columnsDefinitions.columns, columnsDefinitions.filter)
        );
        open.setFalse();
    }, [columnsDefinitions, dispatch, indexTab, open]);
    return (
        <Dialog
            open={open.value}
            onClose={open.setFalse}
            aria-labelledby="custom-columns-dialog-title"
            aria-describedby="custom-columns-description"
            fullScreen
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <Tooltip
                        arrow
                        placement="bottom-end"
                        title={intl.formatMessage(
                            {
                                id: 'spreadsheet/custom_column/dialog/close_tooltip',
                            },
                            { isContentModified: contentModified.value }
                        )}
                    >
                        <IconButton
                            edge="start"
                            onClick={open.setFalse}
                            aria-label="close"
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <Badge
                                badgeContent={contentModified.value ? <WarningIcon color="warning" /> : null}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                            >
                                <CloseIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        <FormattedMessage id="spreadsheet/custom_column/dialog/title" />
                    </Typography>
                    <Button
                        onClick={onAddColumnClick}
                        color="secondary"
                        variant="outlined"
                        startIcon={<AddCircleIcon />}
                        sx={styles.toolbarBtn}
                    >
                        <FormattedMessage id="spreadsheet/custom_column/dialog/add_column" />
                    </Button>
                    <Button
                        onClick={dialogImportOpen.setTrue}
                        color="inherit"
                        variant="outlined"
                        startIcon={<ImportExportIcon />}
                        sx={styles.toolbarBtn}
                    >
                        <FormattedMessage id="spreadsheet/custom_column/dialog/import_export" />
                    </Button>
                    <Button
                        onClick={onSaveClick}
                        variant="outlined"
                        disabled={!contentModified.value}
                        color="primary"
                        startIcon={<SaveIcon />}
                        autoFocus
                    >
                        <FormattedMessage id="spreadsheet/custom_column/save" />
                    </Button>
                </Toolbar>
            </AppBar>
            <List>
                {useMemo(
                    () =>
                        columnsDefinitions.columns.map((data, idx, arr) => (
                            <Fragment key={`table-${indexTab}-item-${data.name}`}>
                                <CustomColumnItem
                                    data={data}
                                    onDelete={() => onListItemDelete(idx)}
                                    onEdit={() => onListItemEdit(idx)}
                                />
                                {idx >= arr.length - 1 ? undefined : <Divider />}
                            </Fragment>
                        )),
                    [columnsDefinitions, indexTab, onListItemDelete, onListItemEdit]
                )}
            </List>
            <CustomColumnsImExPort indexTab={indexTab} open={dialogImportOpen} onImport={onImportJson} />
            <CustomColumnDialog open={dialogColumnOpen} baseData={dialogColumnWorkingOn} onSubmit={onImportColumn} />
        </Dialog>
    );
}
