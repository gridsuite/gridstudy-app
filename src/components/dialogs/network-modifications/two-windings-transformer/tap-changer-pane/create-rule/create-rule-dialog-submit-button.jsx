/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button } from '@mui/material';
import { HIGH_TAP_POSITION, LOW_TAP_POSITION } from 'components/utils/field-constants';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

const CreateRuleDialogSubmitButton = ({ handleSave, allowNegativeValues }) => {
    const { handleSubmit } = useFormContext();
    const [lowTapPositionWatcher, highTapPositionWatcher] = useWatch({
        name: [LOW_TAP_POSITION, HIGH_TAP_POSITION],
    });

    const isTapValuesInvalid = useCallback(() => {
        return (
            !highTapPositionWatcher ||
            !lowTapPositionWatcher ||
            (!allowNegativeValues && highTapPositionWatcher <= 0) ||
            (!allowNegativeValues && lowTapPositionWatcher <= 0) ||
            highTapPositionWatcher === lowTapPositionWatcher
        );
    }, [lowTapPositionWatcher, highTapPositionWatcher, allowNegativeValues]);

    return (
        <Button onClick={handleSubmit(handleSave)} variant="outlined" disabled={isTapValuesInvalid()}>
            <FormattedMessage id="validate" />
        </Button>
    );
};

export default CreateRuleDialogSubmitButton;
