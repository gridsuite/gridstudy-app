import { Button, CircularProgress } from '@mui/material';
import { NAME, SELECTION_TYPE } from 'components/utils/field-constants';
import { FieldValues, useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SelectionCreationPanelFormFields } from './selection-creation-panel';
import { SELECTION_TYPES } from './selection-types';

interface SelectionCreationPanelSubmitButtonProps<T> {
    handleValidate: (formData: SelectionCreationPanelFormFields) => void;
    pendingState: boolean;
}
export const SelectionCreationPanelSubmitButton = <T extends FieldValues>(
    props: SelectionCreationPanelSubmitButtonProps<T>
) => {
    const { handleValidate, pendingState } = props;
    const {
        handleSubmit,
        formState: { errors, isDirty },
    } = useFormContext<SelectionCreationPanelFormFields>();

    // UniqueNameInput validation is made with those values
    const nameError = errors[NAME];
    const isValidating = errors.root?.isValidating;

    const watchSelectionType = useWatch<SelectionCreationPanelFormFields>({
        name: SELECTION_TYPE,
    });

    const handleClick = () => {
        if (watchSelectionType !== SELECTION_TYPES.NAD) {
            return handleSubmit(handleValidate);
        }

        return handleValidate;
    };

    return (
        <Button
            onClick={handleClick}
            disabled={
                // when watchSelectionType is equal to SELECTION_TYPES.NAD, button is never disabled
                watchSelectionType !== SELECTION_TYPES.NAD &&
                (!isDirty || pendingState || !!nameError || !!isValidating)
            }
            variant="outlined"
            type={'submit'}
            size={'large'}
        >
            {(pendingState && <CircularProgress size={24} />) || (
                <FormattedMessage id="save" />
            )}
        </Button>
    );
};
