/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, MouseEvent, useCallback } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import CustomSpreadsheetSaveDialog from './custom-spreadsheet/custom-spreadsheet-save-dialog';
import { useStateBoolean } from '@gridsuite/commons-ui';
import { useCsvExport } from './csv-export/use-csv-export';
import { CsvExportProps } from './csv-export/csv-export.type';

const SPREADSHEET_SAVE_OPTIONS = {
    SAVE_MODEL: { id: 'SAVE_MODEL', label: 'spreadsheet/save/options/model' },
    EXPORT_CSV: { id: 'EXPORT_CSV', label: 'spreadsheet/save/options/csv' },
};

interface SpreadsheetSaveProps extends CsvExportProps {
    indexTab: number;
}

export default function SpreadsheetSave({
    indexTab,
    gridRef,
    columns,
    tableName,
    disabled,
}: Readonly<SpreadsheetSaveProps>) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);
    const customSaveDialogOpen = useStateBoolean(false);
    const { downloadCSVData } = useCsvExport();

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleMenuItemClick = useCallback(
        (option: { id: string; label: string }) => {
            if (option.id === SPREADSHEET_SAVE_OPTIONS.SAVE_MODEL.id) {
                customSaveDialogOpen.setTrue();
            } else if (option.id === SPREADSHEET_SAVE_OPTIONS.EXPORT_CSV.id) {
                downloadCSVData({ gridRef, columns, tableName });
            }
            handleClose();
        },
        [customSaveDialogOpen, handleClose, downloadCSVData, gridRef, columns, tableName]
    );

    return (
        <>
            <span>
                <FormattedMessage id="spreadsheet/save/button" />
            </span>
            <IconButton aria-label="dialog" onClick={handleClick}>
                <SaveIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {developerMode && (
                    <MenuItem
                        key={SPREADSHEET_SAVE_OPTIONS.SAVE_MODEL.id}
                        onClick={() => handleMenuItemClick(SPREADSHEET_SAVE_OPTIONS.SAVE_MODEL)}
                    >
                        {<FormattedMessage id={SPREADSHEET_SAVE_OPTIONS.SAVE_MODEL.label} />}
                    </MenuItem>
                )}
                <MenuItem
                    key={SPREADSHEET_SAVE_OPTIONS.EXPORT_CSV.id}
                    onClick={() => handleMenuItemClick(SPREADSHEET_SAVE_OPTIONS.EXPORT_CSV)}
                    disabled={disabled}
                >
                    {<FormattedMessage id={SPREADSHEET_SAVE_OPTIONS.EXPORT_CSV.label} />}
                </MenuItem>
            </Menu>
            <CustomSpreadsheetSaveDialog indexTab={indexTab} open={customSaveDialogOpen}></CustomSpreadsheetSaveDialog>
        </>
    );
}
