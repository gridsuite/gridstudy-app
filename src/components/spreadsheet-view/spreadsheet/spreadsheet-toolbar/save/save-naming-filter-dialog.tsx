/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    createFilter,
    ElementSaveDialog,
    ElementType,
    type IElementCreationDialog,
    type IElementUpdateDialog,
    type NewFilterType,
    saveFilter,
    snackWithFallback,
    useSnackMessage,
    type UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { type RefObject, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
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

    const getFilterFromGrid = useCallback(
        (filterId: string | null): NewFilterType | null => {
            const api = gridRef.current?.api;
            if (!api) {
                return null;
            }
            const ids: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => {
                if (!isCalculationRow(node.data?.rowType) && node.data?.id) {
                    ids.push(node.data.id);
                }
            });
            return {
                id: filterId,
                type: 'IDENTIFIER_LIST',
                equipmentType: tableDefinition.type,
                filterEquipmentsAttributes: ids.map((eqId) => ({ equipmentID: eqId })),
            };
        },
        [gridRef, tableDefinition.type]
    );

    const handleSave = useCallback(
        ({ name, description, folderId }: IElementCreationDialog) => {
            const filter = getFilterFromGrid(null);
            if (!filter) {
                return;
            }
            createFilter(filter, name, description, folderId)
                .then(() => {
                    snackInfo({ messageTxt: intl.formatMessage({ id: 'FilterCreationSuccess' }) });
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'FilterCreationError' });
                });
        },
        [getFilterFromGrid, snackInfo, snackError, intl]
    );

    const handleUpdate = useCallback(
        ({ id, name, description }: IElementUpdateDialog) => {
            const filter = getFilterFromGrid(id);
            if (!filter) {
                return;
            }
            saveFilter(filter, name, description)
                .then(() => {
                    snackInfo({ messageTxt: intl.formatMessage({ id: 'FilterUpdateSuccess' }) });
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'FilterUpdateError' });
                });
        },
        [getFilterFromGrid, snackInfo, snackError, intl]
    );

    return studyUuid ? (
        <ElementSaveDialog
            open={open.value}
            onClose={handleClose}
            onSave={handleSave}
            OnUpdate={handleUpdate}
            type={ElementType.FILTER}
            titleId={'spreadsheet/save/filter_dialog_title'}
            studyUuid={studyUuid}
            selectorTitleId="spreadsheet/save/select_filter"
            createLabelId="spreadsheet/save/create_new_filter"
            updateLabelId="spreadsheet/save/replace_existing_filter"
        />
    ) : null;
}
