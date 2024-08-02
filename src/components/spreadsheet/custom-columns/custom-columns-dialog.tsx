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
import {
    useStateBoolean,
    UseStateBooleanReturn,
} from '../../../hooks/use-states';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import { TABLES_NAMES } from '../utils/config-tables';
import { useEffect, useState } from 'react';
import { ColumnWithFormula } from './custom-columns.types';

type CustomColumnItemProps = {
    key: string;
    data: ColumnWithFormula;
};

const styles: Record<string, SxProps<Theme>> = {
    toolbarBtn: {
        marginRight: 1,
    },
};

function CustomColumnItem({ key, data }: Readonly<CustomColumnItemProps>) {
    console.log('CustomColumnItem', key, data);
    return (
        <ListItem
            key={`item-${key}`}
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
                    <IconButton
                        aria-label="modify"
                        onClick={undefined /*TODO*/}
                        color="primary"
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        aria-label="delete"
                        onClick={undefined /*TODO*/}
                        color="secondary"
                        edge="end"
                    >
                        <DeleteForeverIcon />
                    </IconButton>
                </>
            }
        >
            <ListItemText
                id={`custom-column-line-${key}`}
                primary={data.name}
                secondary={data.formula}
            />
        </ListItem>
    );
}

export type CustomColumnsDialogProps = {
    open: UseStateBooleanReturn;
    indexTab: number;
};

export default function CustomColumnsDialog({
    indexTab,
    open,
}: Readonly<CustomColumnsDialogProps>) {
    const intl = useIntl();
    const allDefinitions = useSelector(
        (state: ReduxState) =>
            state.allCustomColumnsDefinitions[TABLES_NAMES[indexTab]]
    );
    const [columnsDefinitions, setColumnsDefinitions] = useState<
        ColumnWithFormula[]
    >([]);
    const contentModified = useStateBoolean(false); //TODO
    const resetContentModified = contentModified.setFalse;
    useEffect(() => {
        if (open.value) {
            setColumnsDefinitions(allDefinitions.map((def) => ({ ...def })));
            resetContentModified();
        }
    }, [open.value, allDefinitions, resetContentModified]);
    //const dialogImportOpen = useStateBoolean(false);
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
                                badgeContent={
                                    contentModified.value ? (
                                        <WarningIcon color="warning" />
                                    ) : null
                                }
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                            >
                                <CloseIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Typography
                        sx={{ ml: 2, flex: 1 }}
                        variant="h6"
                        component="div"
                    >
                        <FormattedMessage id="spreadsheet/custom_column/dialog/title" />
                    </Typography>
                    <Button
                        onClick={undefined /*TODO*/}
                        color="secondary"
                        variant="outlined"
                        startIcon={<AddCircleIcon />}
                        sx={styles.toolbarBtn}
                    >
                        <FormattedMessage id="spreadsheet/custom_column/dialog/add_column" />
                    </Button>
                    <Button
                        onClick={undefined /*TODO*/}
                        color="inherit"
                        variant="outlined"
                        startIcon={<ImportExportIcon />}
                        sx={styles.toolbarBtn}
                    >
                        <FormattedMessage id="spreadsheet/custom_column/dialog/import_export" />
                    </Button>
                    <Button
                        onClick={open.setFalse}
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
                {columnsDefinitions.map((data, idx, arr) => (
                    <>
                        <CustomColumnItem key={data.name} data={data} />
                        {idx >= arr.length - 1 ? undefined : <Divider />}
                    </>
                ))}
            </List>
        </Dialog>
    );
}
