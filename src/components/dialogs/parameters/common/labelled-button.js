/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import React from 'react';

export const LabelledButton = ({ callback, label, name }) => {
    return (
        <Button onClick={callback} className={name}>
            <FormattedMessage id={label} />
        </Button>
    );
};
