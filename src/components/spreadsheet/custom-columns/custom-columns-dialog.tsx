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
    IconButton,
    List,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddCircle as AddCircleIcon,
    Close as CloseIcon,
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
import { useEffect } from 'react';
import { ColumnWithFormula } from './custom-columns.types';

export type CustomColumnsDialogProps = {
    open: UseStateBooleanReturn;
    indexTab: number;
};

export default function CustomColumnsDialog({
    indexTab,
    open,
}: CustomColumnsDialogProps) {
    const intl = useIntl();
    const allDefinitions = useSelector(
        (state: ReduxState) =>
            state.allCustomColumnsDefinitions[TABLES_NAMES[indexTab]]
    );
    let columnsDefinitions: ColumnWithFormula[] = [];
    const contentModified = useStateBoolean(false); //TODO
    useEffect(() => {
        if (open.value) {
            columnsDefinitions = allDefinitions.map((def) => ({ ...def }));
            contentModified.setFalse();
        }
    }, [open.value]);
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
                    >
                        <FormattedMessage id="spreadsheet/custom_column/dialog/add_column" />
                    </Button>
                    <Button
                        onClick={undefined /*TODO*/}
                        color="inherit"
                        variant="outlined"
                        startIcon={<ImportExportIcon />}
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
            <List></List>
            {/*<DialogTitle id="custom-columns-dialog-title">
                    <FormattedMessage
                        id="TODO"
                        defaultMessage="Manage formulas"
                    />
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={dialogOpen.setFalse}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <DialogContentText id="custom-columns-description">
                        TODO
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={dialogOpen.setFalse}
                        variant="outlined"
                        color={contentModified.value ? 'warning' : 'inherit'}
                        startIcon={<CloseIcon />}
                    >
                        <FormattedMessage id="TODO" defaultMessage="Close" />
                    </Button>
                    <Button
                        onClick={dialogOpen.setFalse}
                        variant="outlined"
                        disabled={!contentModified.value}
                        color="primary"
                        startIcon={<SaveIcon />}
                        autoFocus
                    >
                        <FormattedMessage id="TODO" defaultMessage="Close" />
                    </Button>
                </DialogActions>*/}
        </Dialog>
    );
}
