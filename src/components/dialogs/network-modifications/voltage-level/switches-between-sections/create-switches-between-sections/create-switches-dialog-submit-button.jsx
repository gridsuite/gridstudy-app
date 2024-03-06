/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

const CreateSwitchesDialogSubmitButton = ({ handleSave }) => {
    const { handleSubmit } = useFormContext();

    return (
        <Button onClick={handleSubmit(handleSave)} variant="outlined">
            <FormattedMessage id="validate" />
        </Button>
    );
};

export default CreateSwitchesDialogSubmitButton;
