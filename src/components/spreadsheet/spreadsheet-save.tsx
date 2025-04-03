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
import CustomSpreadsheetSaveDialog from './custom-spreadsheet/custom-spreadsheet-save-dialog';
import { useStateBoolean } from '@gridsuite/commons-ui';
import { useCsvExport } from './csv-export/use-csv-export';
import { CsvExportProps } from './csv-export/csv-export.type';
import { spreadsheetStyles } from './utils/style';
import { SpreadsheetCollectionSaveDialog } from './custom-spreadsheet/spreadsheet-collection-save-dialog';
import { NodeAlias } from './custom-columns/node-alias.type';

enum SpreadsheetSaveOptionId {
    SAVE_MODEL = 'SAVE_MODEL',
    SAVE_COLLECTION = 'SAVE_COLLECTION',
    EXPORT_CSV = 'EXPORT_CSV',
}

interface SpreadsheetSaveOption {
    id: SpreadsheetSaveOptionId;
    label: string;
    action: () => void;
    disabled?: boolean;
}

interface SpreadsheetSaveProps extends CsvExportProps {
    tabIndex: number;
    dataSize?: number;
    nodeAliases: NodeAlias[] | undefined;
}

export default function SpreadsheetSave({
    tabIndex,
    gridRef,
    columns,
    tableName,
    disabled,
    dataSize,
    nodeAliases,
}: Readonly<SpreadsheetSaveProps>) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
            },
            [SpreadsheetSaveOptionId.SAVE_COLLECTION]: {
                id: SpreadsheetSaveOptionId.SAVE_COLLECTION,
                label: 'spreadsheet/save/options/collection',
                action: saveCollectionDialogOpen.setTrue,
            },
            [SpreadsheetSaveOptionId.EXPORT_CSV]: {
                id: SpreadsheetSaveOptionId.EXPORT_CSV,
                label: 'spreadsheet/save/options/csv',
                action: () => {
                    // Filter out the rowIndex column before exporting to CSV
                    const columnsForExport = columns.filter((col) => col.colId !== 'rowIndex');
                    downloadCSVData({ gridRef, columns: columnsForExport, tableName });
                },
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
            return (
                <MenuItem key={option.id} onClick={() => handleMenuItemClick(option.id)} disabled={option?.disabled}>
                    <FormattedMessage id={option.label} />
                </MenuItem>
            );
        },
        [handleMenuItemClick]
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
            <SpreadsheetCollectionSaveDialog open={saveCollectionDialogOpen} nodeAliases={nodeAliases} />
        </>
    );
}
