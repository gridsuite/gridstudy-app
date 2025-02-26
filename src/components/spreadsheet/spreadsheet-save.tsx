/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, MouseEvent, useCallback, useMemo } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import CustomSpreadsheetSaveDialog from './custom-spreadsheet/custom-spreadsheet-save-dialog';
import { useStateBoolean } from '@gridsuite/commons-ui';
import { useCsvExport } from './csv-export/use-csv-export';
import { CsvExportProps } from './csv-export/csv-export.type';
import { spreadsheetStyles } from './utils/style';
import { SpreadsheetCollectionSaveDialog } from './custom-spreadsheet/spreadsheet-collection-save-dialog';

enum SpreadsheetSaveOptionId {
    SAVE_MODEL = 'SAVE_MODEL',
    SAVE_COLLECTION = 'SAVE_COLLECTION',
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
    tabIndex: number;
    dataSize?: number;
}

export default function SpreadsheetSave({
    tabIndex,
    gridRef,
    columns,
    tableName,
    disabled,
    dataSize,
}: Readonly<SpreadsheetSaveProps>) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);
    const customSaveDialogOpen = useStateBoolean(false);
    const saveCollectionDialogOpen = useStateBoolean(false);
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
            [SpreadsheetSaveOptionId.SAVE_COLLECTION]: {
                id: SpreadsheetSaveOptionId.SAVE_COLLECTION,
                label: 'spreadsheet/save/options/collection',
                action: saveCollectionDialogOpen.setTrue,
                showInDevMode: true,
            },
            [SpreadsheetSaveOptionId.EXPORT_CSV]: {
                id: SpreadsheetSaveOptionId.EXPORT_CSV,
                label: 'spreadsheet/save/options/csv',
                action: () => downloadCSVData({ gridRef, columns, tableName }),
                disabled: dataSize === 0,
            },
        }),
        [
            customSaveDialogOpen.setTrue,
            saveCollectionDialogOpen.setTrue,
            dataSize,
            downloadCSVData,
            gridRef,
            columns,
            tableName,
        ]
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
            <Button sx={spreadsheetStyles.spreadsheetButton} size={'small'} onClick={handleClick} disabled={disabled}>
                <SaveIcon />
                <FormattedMessage id="spreadsheet/save/button" />
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {Object.values(spreadsheetOptions).map(renderMenuItem)}
            </Menu>
            <CustomSpreadsheetSaveDialog tabIndex={tabIndex} open={customSaveDialogOpen} />
            <SpreadsheetCollectionSaveDialog open={saveCollectionDialogOpen} />
        </>
    );
}
