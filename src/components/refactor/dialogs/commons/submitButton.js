import { Button } from '@mui/material';
import { useFormState } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

const SubmitButton = ({ onClick, disabledSave = false }) => {
    const { isDirty } = useFormState();

    return (
        <Button onClick={onClick} disabled={!isDirty || disabledSave}>
            <FormattedMessage id="validate" />
        </Button>
    );
};

export default SubmitButton;
