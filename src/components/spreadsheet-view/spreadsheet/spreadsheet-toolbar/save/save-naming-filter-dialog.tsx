/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ElementSaveDialog,
    ElementType,
    IElementCreationDialog,
    UseStateBooleanReturn,
    useSnackMessage,
    EquipmentType,
    createFilter,
} from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import { RefObject } from 'react';
import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { isCalculationRow } from '../../../utils/calculation-utils';
import { useIntl } from 'react-intl';

export interface SaveNamingFilterDialogProps {
    open: UseStateBooleanReturn;
    gridRef: RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
}

export default function SaveNamingFilterDialog({
    open,
    gridRef,
    tableDefinition,
}: Readonly<SaveNamingFilterDialogProps>) {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackInfo, snackError } = useSnackMessage();
    const intl = useIntl();

    const handleClose = useCallback(() => {
        open.setFalse();
    }, [open]);

    const handleSave = useCallback(
        ({ name, description, folderId }: IElementCreationDialog) => {
            const api = gridRef.current?.api;
            if (!api) {
                return;
            }
            const ids: string[] = [];
            api.forEachNodeAfterFilter((node) => {
                if (!isCalculationRow(node.data?.rowType) && node.data?.id) {
                    ids.push(node.data.id);
                }
            });
            const filter = {
                id: null,
                type: 'IDENTIFIER_LIST',
                equipmentType: tableDefinition.type as unknown as EquipmentType,
                filterEquipmentsAttributes: ids.map((id) => ({ equipmentID: id })),
            };
            createFilter(filter, name, description, folderId)
                .then(() => {
                    snackInfo({ messageTxt: intl.formatMessage({ id: 'FilterCreationSuccess' }) });
                    handleClose();
                })
                .catch((err) => {
                    console.error('Failed to create filter', err);
                    snackError({ messageTxt: intl.formatMessage({ id: 'FilterCreationError' }) });
                });
        },
        [gridRef, tableDefinition.type, snackInfo, snackError, intl, handleClose]
    );

    return studyUuid ? (
        <ElementSaveDialog
            open={open.value}
            onClose={handleClose}
            onSave={handleSave}
            type={ElementType.FILTER}
            titleId={'spreadsheet/save/filter_dialog_title'}
            studyUuid={studyUuid}
            createOnlyMode
        />
    ) : null;
}
