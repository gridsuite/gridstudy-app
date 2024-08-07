import { Button, CircularProgress } from '@mui/material';
import { NAME, SELECTION_TYPE } from 'components/utils/field-constants';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SELECTION_TYPES } from './selection-types';
import { SelectionCreationPaneFields } from './selection-creation-panel';

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

    const watchSelectionType = useWatch<SelectionCreationPaneFields>({
        name: SELECTION_TYPE,
    });

    return (
        <Button
            onClick={handleSubmit(handleValidate)}
            disabled={
                // when watchSelectionType is equal to SELECTION_TYPES.NAD, button is never disabled
                watchSelectionType !== SELECTION_TYPES.NAD &&
                (!isDirty || pendingState || !!nameError || !!isValidating)
            }
            variant="outlined"
            type={'submit'}
            size={'large'}
        >
            {(pendingState && <CircularProgress size={24} />) || <FormattedMessage id="save" />}
        </Button>
    );
};
