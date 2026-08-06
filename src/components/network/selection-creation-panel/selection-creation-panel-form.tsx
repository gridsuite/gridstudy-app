/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SelectInput, TextInput, Nullable } from '@gridsuite/commons-ui';
import { Stack } from '@mui/material';
import { NAME, SELECTION_TYPE } from 'components/utils/field-constants';

import { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { ContingencyFilterCreationFields } from './contingency-filter-creation/contingency-filter-creation-fields';
import { SELECTION_TYPES, selectionTypeToLabel } from './selection-types';
import { SelectionCreationPaneFields } from './selection-creation-schema';
import { GridSection } from '../../dialogs/commons/grid-section';

interface SelectionCreationPanelFormProps {
    pendingState: boolean;
}

export const SelectionCreationPanelForm: FC<SelectionCreationPanelFormProps> = (props) => {
    const { pendingState } = props;
    const watchSelectionType = useWatch<Nullable<SelectionCreationPaneFields>, typeof SELECTION_TYPE>({
        name: SELECTION_TYPE,
    });

    const isFilterOrContingenciesSelected =
        watchSelectionType === SELECTION_TYPES.FILTER || watchSelectionType === SELECTION_TYPES.CONTIGENCY_LIST;
    const isNadSelected = watchSelectionType === SELECTION_TYPES.NAD;

    return (
        <Stack spacing={2}>
            <GridSection title="createNewSelection" />
            <SelectInput
                name={SELECTION_TYPE}
                options={Object.values(SELECTION_TYPES).map((value) => ({
                    id: value,
                    label: selectionTypeToLabel(value),
                }))}
                label={SELECTION_TYPE}
                fullWidth
                size={'medium'}
                disableClearable={true}
                disabled={pendingState}
            />
            {isFilterOrContingenciesSelected && (
                <ContingencyFilterCreationFields selectionType={watchSelectionType} pendingState={pendingState} />
            )}
            {isNadSelected && (
                <TextInput
                    name={NAME}
                    label={'Name'}
                    formProps={{
                        variant: 'standard',
                        disabled: pendingState,
                    }}
                />
            )}
        </Stack>
    );
};
