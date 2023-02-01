import { Button } from '@mui/material';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
} from 'components/refactor/utils/field-constants';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

const CreateRuleDialogSubmitButton = ({ handleSave, allowNegativeValues }) => {
    const { handleSubmit } = useFormContext();
    const [lowTapPositionWatcher, highTapPositionWatcher] = useWatch({
        name: [LOW_TAP_POSITION, HIGH_TAP_POSITION],
    });

    const isTapValuesInvalid = useCallback(() => {
        console.log(highTapPositionWatcher, lowTapPositionWatcher);
        return (
            !highTapPositionWatcher ||
            !lowTapPositionWatcher ||
            (!allowNegativeValues && highTapPositionWatcher <= 0) ||
            (!allowNegativeValues && lowTapPositionWatcher <= 0) ||
            highTapPositionWatcher === lowTapPositionWatcher
        );
    }, [lowTapPositionWatcher, highTapPositionWatcher, allowNegativeValues]);

    return (
        <Button
            onClick={handleSubmit(handleSave)}
            disabled={isTapValuesInvalid()}
        >
            <FormattedMessage id="validate" />
        </Button>
    );
};

export default CreateRuleDialogSubmitButton;
