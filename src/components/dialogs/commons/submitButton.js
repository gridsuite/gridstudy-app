/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button } from '@mui/material';
import { useFormState } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

const SubmitButton = ({ onClick, disabled = false }) => {
    const { isDirty } = useFormState();
    // const { isDirty, defaultValues } = useFormState();
    /*    const { getValues } = useFormContext();
    console.log('MMT isdirty', isDirty);
    console.log('MMT defaultValues', defaultValues);
    console.log('MMT getValues', getValues());*/

    return (
        <Button onClick={onClick} disabled={!isDirty || disabled}>
            <FormattedMessage id="validate" />
        </Button>
    );
};

export default SubmitButton;
