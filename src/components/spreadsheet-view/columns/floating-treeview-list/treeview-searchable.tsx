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
import { MouseEvent, Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { FORMULA } from '../column-creation-form';
import { useFormulaQuickSearch } from './use-formula-quicksearch';
import { buildTreeData } from './utils/json-schema-parser';
import { JSONSchema4 } from 'json-schema';
import { UseFormReturn } from 'react-hook-form';
import { renderTreeData } from './utils/render-tree-data';
import { usePopoverToggle } from './utils/use-popover-toggle';
import { useIntl } from 'react-intl';

interface TreeviewSearchableProps {
    properties: JSONSchema4 | null;
    formMethods: UseFormReturn<any>;
    setAnchorEl: Dispatch<SetStateAction<Element | null>>;
}

const MOUSE_EVENT_DETAIL_DOUBLE_CLICK = 2;

export const TreeviewSearchable = ({ properties, formMethods, setAnchorEl }: TreeviewSearchableProps) => {
    const intl = useIntl();
    const [pendingSelection, setPendingSelection] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const treeData = useMemo(() => buildTreeData(properties, properties), [properties]);
    const { currentResultIndex, matches, handleSearch, handleNavigate, handleResetSearch, itemRefs, filter } =
        useFormulaQuickSearch(treeData, setExpandedItems);

    const { getValues, setValue } = formMethods;

    const handleConfirm = useCallback(() => {
        if (pendingSelection) {
            const newValue = getValues(FORMULA) ? `${getValues(FORMULA)}${pendingSelection}` : pendingSelection;
            setValue(FORMULA, newValue, { shouldValidate: true });
        }
        setPendingSelection(null);
        setAnchorEl(null);
    }, [getValues, pendingSelection, setAnchorEl, setPendingSelection, setValue]);

    const { handleKeyDown, handleTreeviewKeyDown } = usePopoverToggle(properties, setAnchorEl, handleConfirm);

    const handleDoubleClick = useCallback(
        (e: MouseEvent) => {
            if (e.detail === MOUSE_EVENT_DETAIL_DOUBLE_CLICK) {
                handleConfirm();
            }
        },
        [handleConfirm]
    );

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
                />
            </Box>
            <Box sx={{ overflow: 'auto', maxHeight: '45vh', px: 1 }} onKeyDown={handleKeyDown}>
                <SimpleTreeView
                    expandedItems={expandedItems}
                    onExpandedItemsChange={(_, ids) => setExpandedItems(ids)}
                    onKeyDown={handleTreeviewKeyDown}
                    onItemFocus={(e, itemId) => setPendingSelection(itemId)}
                    onItemClick={handleDoubleClick}
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
