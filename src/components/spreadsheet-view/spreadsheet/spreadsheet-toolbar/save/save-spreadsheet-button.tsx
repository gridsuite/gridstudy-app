/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type MouseEvent, type RefObject, useCallback, useMemo, useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import SaveIcon from '@mui/icons-material/Save';
import SaveSpreadsheetDialog from './save-spreadsheet-dialog';
import {
    copyToClipboard,
    CsvDownloadProps,
    EquipmentType,
    FILTER_EQUIPMENTS,
    useCsvExport,
    useSnackMessage,
    useStateBoolean,
} from '@gridsuite/commons-ui';
import { ROW_INDEX_COLUMN_ID } from '../../../constants';
import { type SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import type { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { spreadsheetStyles } from '../../../spreadsheet.style';
import { useSelector } from 'react-redux';
import type { AppState } from '../../../../../redux/reducer';
import SaveNamingFilterDialog from './save-naming-filter-dialog';

enum SpreadsheetSaveOptionId {
    SAVE_MODEL = 'SAVE_MODEL',
    COPY_CSV = 'COPY_CSV',
    EXPORT_CSV = 'EXPORT_CSV',
    SAVE_FILTER = 'SAVE_FILTER',
}

interface SpreadsheetSaveOption {
    id: SpreadsheetSaveOptionId;
    label: string;
    action: () => void;
    disabled?: boolean;
}

interface SaveSpreadsheetButtonProps {
    gridRef: RefObject<AgGridReact | null>;
    columns: ColDef[];
    disabled: boolean;
    tableDefinition: SpreadsheetTabDefinition;
    dataSize: number;
}

export default function SaveSpreadsheetButton({
    tableDefinition,
    gridRef,
    columns,
    disabled,
    dataSize,
}: Readonly<SaveSpreadsheetButtonProps>) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const customSaveDialogOpen = useStateBoolean(false);
    const saveFilterDialogOpen = useStateBoolean(false);
    const language = useSelector((state: AppState) => state.computedLanguage);

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget), []);
    const handleClose = useCallback(() => setAnchorEl(null), []);

    const { snackInfo, snackError } = useSnackMessage();
    const { getData } = useCsvExport();

    const onClipboardCopy = useCallback(() => {
        snackInfo({ headerId: 'spreadsheet/save/options/csv/clipboard/success' });
    }, [snackInfo]);

    const onClipboardError = useCallback(() => {
        snackError({ headerId: 'spreadsheet/save/options/csv/clipboard/error' });
    }, [snackError]);

    const getCsvProps = useCallback(
        (csvCase: SpreadsheetSaveOptionId.COPY_CSV | SpreadsheetSaveOptionId.EXPORT_CSV) => {
            const gridCsvFunction =
                csvCase === SpreadsheetSaveOptionId.COPY_CSV
                    ? gridRef.current?.api.getDataAsCsv
                    : gridRef.current?.api.exportDataAsCsv;
            if (!gridCsvFunction) {
                console.error('Csv API is not available.');
                return;
            }
            // No active calculation: 1 pinned row (default empty line); some calculations: > 1 pinned rows
            const calculationRowNumber = gridRef.current?.api.getGridOption('pinnedBottomRowData')?.length ?? 0;
            return {
                // Filter out the rowIndex column and the hidden columns before exporting to CSV
                columns: columns.filter((col) => col.colId !== ROW_INDEX_COLUMN_ID && !col.hide),
                tableName: tableDefinition.name,
                language: language,
                getData: gridCsvFunction,
                skipPinnedBottom: calculationRowNumber === 1,
            } as CsvDownloadProps;
        },
        [columns, gridRef, language, tableDefinition.name]
    );

    const spreadsheetOptions = useMemo<Record<SpreadsheetSaveOptionId, SpreadsheetSaveOption>>(
        () => ({
            [SpreadsheetSaveOptionId.SAVE_MODEL]: {
                id: SpreadsheetSaveOptionId.SAVE_MODEL,
                label: 'spreadsheet/save/options/model',
                action: customSaveDialogOpen.setTrue,
            },
            [SpreadsheetSaveOptionId.COPY_CSV]: {
                id: SpreadsheetSaveOptionId.COPY_CSV,
                label: 'spreadsheet/save/options/csv/clipboard',
                // fix sonnar issue : Promise-returning function provided to property where a void return was expected.
                action: () => {
                    (async () => {
                        const csvProps = getCsvProps(SpreadsheetSaveOptionId.COPY_CSV);
                        if (csvProps) {
                            csvProps.isCopyCsv = true;
                            let data = await getData(csvProps);
                            copyToClipboard(data ?? '', onClipboardCopy, onClipboardError);
                        }
                    })();
                },
                disabled: dataSize === 0,
            },
            [SpreadsheetSaveOptionId.EXPORT_CSV]: {
                id: SpreadsheetSaveOptionId.EXPORT_CSV,
                label: 'spreadsheet/save/options/csv/export',
                // fix sonnar issue : Promise-returning function provided to property where a void return was expected.
                action: () => {
                    (async () => {
                        const csvProps = getCsvProps(SpreadsheetSaveOptionId.EXPORT_CSV);
                        if (csvProps) {
                            await getData(csvProps);
                        }
                    })();
                },
                disabled: dataSize === 0,
            },
            [SpreadsheetSaveOptionId.SAVE_FILTER]: {
                id: SpreadsheetSaveOptionId.SAVE_FILTER,
                label: 'spreadsheet/save/options/filter',
                action: saveFilterDialogOpen.setTrue,
                disabled: dataSize === 0 || !FILTER_EQUIPMENTS[tableDefinition.type as unknown as EquipmentType],
            },
        }),
        [
            customSaveDialogOpen.setTrue,
            dataSize,
            saveFilterDialogOpen.setTrue,
            tableDefinition.type,
            getCsvProps,
            getData,
            onClipboardCopy,
            onClipboardError,
        ]
    );

    const handleMenuItemClick = useCallback(
        (optionId: SpreadsheetSaveOptionId) => {
            spreadsheetOptions[optionId].action();
            handleClose();
        },
        [spreadsheetOptions, handleClose]
    );

    return (
        <>
            <Button sx={spreadsheetStyles.spreadsheetButton} size={'small'} onClick={handleClick} disabled={disabled}>
                <SaveIcon />
                <FormattedMessage id="spreadsheet/save/button" />
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {Object.values(spreadsheetOptions).map((option) => (
                    <MenuItem
                        key={option.id}
                        onClick={() => handleMenuItemClick(option.id)}
                        disabled={option?.disabled}
                    >
                        <FormattedMessage id={option.label} />
                    </MenuItem>
                ))}
            </Menu>
            <SaveSpreadsheetDialog tableDefinition={tableDefinition} open={customSaveDialogOpen} />
            <SaveNamingFilterDialog open={saveFilterDialogOpen} gridRef={gridRef} tableDefinition={tableDefinition} />
        </>
    );
}
