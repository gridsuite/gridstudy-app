/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Grid } from '@mui/material';
import {
    DirectoryItemSelector,
    ElementType,
    type TabularFormActionsContext,
    TabularModificationType,
    type TreeViewFinderNodeProps,
    useStateBoolean,
} from '@gridsuite/commons-ui';
import GeneratePrefilledModelDialog from './generation/generate-prefilled-model-dialog';
import { usePrefilledModelGenerator } from './generation/use-prefilled-model-generator';
import { useFilterCsvGenerator } from './use-filter-csv-generator';

/**
 * Tabular form actions that rely on study data (network content, filters evaluated on the current
 * node) and are therefore only available from gridstudy.
 */
export function TabularStudyActions({
    dialogMode,
    equipmentType,
    csvColumns,
    commentLines,
    predefinedEquipmentProperties,
}: Readonly<TabularFormActionsContext>) {
    const intl = useIntl();
    const generateFromFilterOpen = useStateBoolean(false);
    const prefilledModelDialogOpen = useStateBoolean(false);

    const { handleGeneratePrefilledModel } = usePrefilledModelGenerator({
        equipmentType,
        csvColumns,
        commentLines,
        predefinedEquipmentProperties,
    });

    const { handleGenerateFromFilter } = useFilterCsvGenerator({
        dialogMode,
        equipmentType,
        csvColumns,
        commentLines,
    });

    const handleFilterSelectorClose = useCallback(
        (selected?: TreeViewFinderNodeProps[]) => {
            generateFromFilterOpen.setFalse();
            if (selected?.length) {
                handleGenerateFromFilter(selected);
            }
        },
        [handleGenerateFromFilter, generateFromFilterOpen]
    );

    const isModification = dialogMode === TabularModificationType.MODIFICATION;

    return (
        <>
            {isModification && (
                <Grid>
                    <Button variant="contained" onClick={() => prefilledModelDialogOpen.setTrue()}>
                        <FormattedMessage id="GeneratePrefilledModel" />
                    </Button>
                </Grid>
            )}
            <DirectoryItemSelector
                open={generateFromFilterOpen.value}
                onClose={handleFilterSelectorClose}
                types={[ElementType.FILTER]}
                equipmentTypes={[equipmentType]}
                title={intl.formatMessage({ id: 'Filters' })}
                multiSelect={false}
            />
            {isModification && (
                <GeneratePrefilledModelDialog
                    open={prefilledModelDialogOpen}
                    equipmentType={equipmentType}
                    onGenerate={handleGeneratePrefilledModel}
                />
            )}
        </>
    );
}
