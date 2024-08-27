/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Button, CircularProgress } from '@mui/material';
import { NAME, SELECTION_TYPE } from 'components/utils/field-constants';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SELECTION_TYPES } from './selection-types';
import { SelectionCreationPaneFields } from './selection-creation-schema';
import { Nullable } from 'components/utils/ts-utils';

interface SelectionCreationPanelSubmitButtonProps {
    handleValidate: (formData: SelectionCreationPaneFields) => void;
    pendingState: boolean;
}
export const SelectionCreationPanelSubmitButton = (props: SelectionCreationPanelSubmitButtonProps) => {
    const { handleValidate, pendingState } = props;
    const {
        handleSubmit,
        formState: { errors, isDirty },
    } = useFormContext<SelectionCreationPaneFields>();

    // UniqueNameInput validation is made with those values
    const nameError = errors[NAME];
    const isValidating = errors.root?.isValidating;

    const watchSelectionType = useWatch<Nullable<SelectionCreationPaneFields>, typeof SELECTION_TYPE>({
        name: SELECTION_TYPE,
    });

    const isNadGeneration = watchSelectionType === SELECTION_TYPES.NAD;
    const submitLabel = isNadGeneration ? 'generateNad' : 'save';

    return (
        <Button
            onClick={handleSubmit(handleValidate)}
            disabled={
                // when watchSelectionType is equal to SELECTION_TYPES.NAD, button is never disabled
                !isNadGeneration && (!isDirty || pendingState || !!nameError || !!isValidating)
            }
            variant="outlined"
            type={'submit'}
            size={'large'}
        >
            {(pendingState && <CircularProgress size={24} />) || <FormattedMessage id={submitLabel} />}
        </Button>
    );
};
