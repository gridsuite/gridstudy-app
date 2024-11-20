/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, MouseEvent, useCallback, useMemo } from 'react';
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

enum SpreadsheetSaveOptionId {
    SAVE_MODEL = 'SAVE_MODEL',
    EXPORT_CSV = 'EXPORT_CSV',
}

interface SpreadsheetSaveOption {
    id: SpreadsheetSaveOptionId;
    label: string;
    action: () => void;
    showInDevMode?: boolean;
    disabled?: boolean;
}

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

    const spreadsheetOptions = useMemo(
        () => ({
            [SpreadsheetSaveOptionId.SAVE_MODEL]: {
                id: SpreadsheetSaveOptionId.SAVE_MODEL,
                label: 'spreadsheet/save/options/model',
                action: customSaveDialogOpen.setTrue,
                showInDevMode: true,
            },
            [SpreadsheetSaveOptionId.EXPORT_CSV]: {
                id: SpreadsheetSaveOptionId.EXPORT_CSV,
                label: 'spreadsheet/save/options/csv',
                action: () => downloadCSVData({ gridRef, columns, tableName }),
                disabled: disabled,
            },
        }),
        [customSaveDialogOpen.setTrue, downloadCSVData, gridRef, columns, tableName, disabled]
    );

    const handleMenuItemClick = useCallback(
        (optionId: SpreadsheetSaveOptionId) => {
            spreadsheetOptions[optionId].action();
            handleClose();
        },
        [spreadsheetOptions, handleClose]
    );

    const renderMenuItem = useCallback(
        (option: SpreadsheetSaveOption) => {
            if (option.showInDevMode && !developerMode) {
                return null;
            }
            return (
                <MenuItem key={option.id} onClick={() => handleMenuItemClick(option.id)} disabled={option?.disabled}>
                    <FormattedMessage id={option.label} />
                </MenuItem>
            );
        },
        [developerMode, handleMenuItemClick]
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
                {Object.values(spreadsheetOptions).map(renderMenuItem)}
            </Menu>
            <CustomSpreadsheetSaveDialog indexTab={indexTab} open={customSaveDialogOpen} />
        </>
    );
}
