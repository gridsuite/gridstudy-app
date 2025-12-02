/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { QuickSearch } from '../../../report-viewer/QuickSearch';
import { SimpleTreeView } from '@mui/x-tree-view';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { Dispatch, RefObject, SetStateAction, useCallback, useMemo, useState } from 'react';
import { FORMULA } from '../column-creation-form';
import { useFormulaQuickSearch } from './use-formula-quicksearch';
import { buildTreeData, sortData } from './utils/json-schema-parser';
import { JSONSchema4 } from 'json-schema';
import { UseFormReturn } from 'react-hook-form';
import { renderTreeData } from './utils/render-tree-data';
import { usePopoverToggle } from './utils/use-popover-toggle';
import { useIntl } from 'react-intl';
import { SpreadsheetEquipmentType } from 'components/spreadsheet-view/types/spreadsheet.type';

interface TreeviewSearchableProps {
    properties: JSONSchema4 | null;
    formMethods: UseFormReturn<any>;
    setAnchorEl: Dispatch<SetStateAction<Element | null>>;
    inputRef: RefObject<HTMLInputElement | null>;
    equipmentType: SpreadsheetEquipmentType;
    formulaCursorPosition: number;
    formulaTextRef: RefObject<HTMLTextAreaElement | null>;
}

export const TreeviewSearchable = ({
    properties,
    formMethods,
    setAnchorEl,
    inputRef,
    equipmentType,
    formulaCursorPosition,
    formulaTextRef,
}: TreeviewSearchableProps) => {
    const intl = useIntl();
    const [pendingSelection, setPendingSelection] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const treeData = useMemo(
        () => sortData(buildTreeData(properties, properties, intl, equipmentType)),
        [equipmentType, intl, properties]
    );
    const { currentResultIndex, matches, handleSearch, handleNavigate, handleResetSearch, itemRefs, filter } =
        useFormulaQuickSearch(treeData, setExpandedItems);

    const { getValues, setValue } = formMethods;

    const handleConfirm = useCallback(() => {
        if (pendingSelection) {
            const currentFormulaValue = getValues(FORMULA) || '';
            const before = currentFormulaValue.slice(0, formulaCursorPosition);
            const after = currentFormulaValue.slice(formulaCursorPosition);
            const newFormulaValue = before + pendingSelection + after;
            const newFormulaCursorPosition = formulaCursorPosition + pendingSelection.length;

            setValue(FORMULA, newFormulaValue, { shouldValidate: true });

            setPendingSelection(null);
            setAnchorEl(null);

            // Focus and set cursor on formula text field
            requestAnimationFrame(() => {
                if (formulaTextRef.current) {
                    formulaTextRef.current.focus();
                    formulaTextRef.current.setSelectionRange(newFormulaCursorPosition, newFormulaCursorPosition);
                }
            });
        } else {
            setPendingSelection(null);
            setAnchorEl(null);
        }
    }, [getValues, pendingSelection, setAnchorEl, setValue, formulaTextRef, formulaCursorPosition]);

    const { handleKeyDown, handleTreeviewKeyDown } = usePopoverToggle(properties, setAnchorEl, handleConfirm);

    return (
        <>
            <Box sx={{ p: 1 }}>
                <QuickSearch
                    currentResultIndex={currentResultIndex}
                    resultCount={matches.length}
                    onSearch={handleSearch}
                    onNavigate={handleNavigate}
                    resetSearch={handleResetSearch}
                    placeholder={'LookForEquipmentField'}
                    sx={{ width: '100%' }}
                    inputRef={inputRef}
                />
            </Box>
            <Box sx={{ overflow: 'auto', maxHeight: '45vh', px: 1 }} onKeyDown={handleKeyDown}>
                <SimpleTreeView
                    expandedItems={expandedItems}
                    onExpandedItemsChange={(_, ids) => setExpandedItems(ids)}
                    onKeyDown={handleTreeviewKeyDown}
                    onItemFocus={(e, itemId) => setPendingSelection(itemId)}
                    slots={{
                        expandIcon: ChevronRight,
                        collapseIcon: ExpandMore,
                    }}
                >
                    {renderTreeData(treeData, filter, itemRefs, matches, currentResultIndex)}
                </SimpleTreeView>
            </Box>
            <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Button variant="contained" size="small" disabled={!pendingSelection} onClick={handleConfirm}>
                    {intl.formatMessage({ id: 'Insert' })}
                </Button>
            </Box>
        </>
    );
};
