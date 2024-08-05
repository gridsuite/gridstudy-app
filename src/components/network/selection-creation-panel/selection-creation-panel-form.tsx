import { SelectInput } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { GridSection } from 'components/dialogs/dialogUtils';
import { SELECTION_TYPE } from 'components/utils/field-constants';

import { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { ContingencyFilterCreationList } from './contingency-filter-creation-fields';
import { SELECTION_TYPES, selectionTypeToLabel } from './selection-types';

interface SelectionCreationPanelForm {
    pendingState: boolean;
}

export const SelectionCreationPanelForm: FC<SelectionCreationPanelForm> = (
    props
) => {
    const { pendingState } = props;
    const watchSelectionType = useWatch({
        name: SELECTION_TYPE,
    });

    const isFilterOrContingenciesSelected =
        watchSelectionType === SELECTION_TYPES.FILTER ||
        watchSelectionType === SELECTION_TYPES.CONTIGENCY_LIST;

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
                <ContingencyFilterCreationList
                    selectionType={watchSelectionType}
                    pendingState={pendingState}
                />
            )}
        </Grid>
    );
};
