/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SelectInput } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { SELECTION_TYPE } from 'components/utils/field-constants';

import { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { ContingencyFilterCreationFields } from './contingency-filter-creation/contingency-filter-creation-fields';
import { SELECTION_TYPES, selectionTypeToLabel } from './selection-types';
import { SelectionCreationPaneFields } from './selection-creation-schema';
import { Nullable } from 'components/utils/ts-utils';
import GridSection from '../../dialogs/commons/grid-section';

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

    return (
        <Grid container rowGap={2}>
            <GridSection title="createNewSelection" />
            <Grid container>
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
            </Grid>
            {isFilterOrContingenciesSelected && (
                <ContingencyFilterCreationFields selectionType={watchSelectionType} pendingState={pendingState} />
            )}
        </Grid>
    );
};
