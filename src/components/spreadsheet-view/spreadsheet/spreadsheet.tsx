/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import { rowIndexColumnDefinition } from '../columns/common-column-definitions';
import { SpreadsheetTabDefinition } from '../types/spreadsheet.type';
import { isSecurityModificationNode, CurrentTreeNode } from 'components/graph/tree-node.type';
import { AgGridReact } from 'ag-grid-react';
import { SpreadsheetContent } from './spreadsheet-content/spreadsheet-content';
import { SpreadsheetToolbar } from './spreadsheet-toolbar/spreadsheet-toolbar';
import { mapColumns } from '../columns/utils/column-mapper';
import { useFilteredRowCounterInfo } from './spreadsheet-toolbar/row-counter/use-filtered-row-counter';
import type { UUID } from 'node:crypto';
import { useSnackMessage, ComputingType, MuiStyles } from '@gridsuite/commons-ui';
import { CustomColDef } from '../../../types/custom-aggrid-types';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { Alert } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface SpreadsheetProps {
    panelId: UUID;
    currentNode: CurrentTreeNode;
    tableDefinition: SpreadsheetTabDefinition;
    disabled: boolean;
    active: boolean;
}

const styles = {
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
} as const satisfies MuiStyles;

export const Spreadsheet = memo(({ panelId, currentNode, tableDefinition, disabled, active }: SpreadsheetProps) => {
    const gridRef = useRef<AgGridReact>(null);
    const { snackError } = useSnackMessage();
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const columnsDefinitions = useMemo(
        () => mapColumns(tableDefinition, snackError, loadFlowStatus, isSecurityModificationNode(currentNode)),
        [tableDefinition, snackError, loadFlowStatus, currentNode]
    );

    // Refresh cells to apply styles when column definitions change (e.g. formula edit, load flow status)
    useEffect(() => {
        gridRef.current?.api?.refreshCells({ force: true, suppressFlash: true });
    }, [columnsDefinitions]);

    const rowCounterInfos = useFilteredRowCounterInfo({
        gridRef,
        tableDefinition,
        disabled,
    });

    const displayedColsDefs = useMemo(() => {
        const columns = tableDefinition?.columns;
        const visibleColDefs =
            columns?.map((column) => {
                return columnsDefinitions.reduce((acc, curr) => {
                    if (curr.colId === column.id) {
                        return curr;
                    }
                    return acc;
                }, {} as CustomColDef);
            }) || [];

        // Return row index column first, followed by visible columns
        // Pass the table UUID to the rowIndexColumnDefinition
        return [rowIndexColumnDefinition(tableDefinition?.uuid || ''), ...visibleColDefs];
    }, [columnsDefinitions, tableDefinition?.columns, tableDefinition?.uuid]);

    return (
        <>
            <SpreadsheetToolbar
                gridRef={gridRef}
                tableDefinition={tableDefinition}
                rowCounterInfos={rowCounterInfos}
                columns={displayedColsDefs}
                disabled={disabled}
            />
            {disabled ? (
                <Alert sx={styles.invalidNode} severity="warning">
                    <FormattedMessage id={'InvalidNode'} />
                </Alert>
            ) : (
                <SpreadsheetContent
                    panelId={panelId}
                    gridRef={gridRef}
                    currentNode={currentNode}
                    tableDefinition={tableDefinition}
                    columns={displayedColsDefs}
                    registerRowCounterEvents={rowCounterInfos.registerRowCounterEvents}
                    active={active}
                />
            )}
        </>
    );
});
