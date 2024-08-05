import { Button, CircularProgress } from '@mui/material';
import { NAME } from 'components/utils/field-constants';
import { FieldValues, useFormContext } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

interface SelectionCreationPanelSubmitButtonProps<T> {
    handleValidate: (formData: T) => void;
    pendingState: boolean;
}
export const SelectionCreationPanelSubmitButton = <T extends FieldValues>(
    props: SelectionCreationPanelSubmitButtonProps<T>
) => {
    const { handleValidate, pendingState } = props;
    const {
        handleSubmit,
        formState: { errors, isDirty },
    } = useFormContext<T>();

    const nameError = errors[NAME];
    const isValidating = errors.root?.isValidating;
    return (
        <Button
            onClick={handleSubmit(handleValidate)}
            disabled={!isDirty || pendingState || !!nameError || !!isValidating}
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
