/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, ButtonProps } from '@mui/material';
import { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { WithRequired } from 'utils/ts-utils';

export interface LabelledButtonProps
    extends WithRequired<ButtonProps, 'onClick'> {
    label: string;
}

export const LabelledButton: FunctionComponent<LabelledButtonProps> = ({
    onClick,
    label,
    ...props
}) => {
    return (
        <Button onClick={onClick} {...props}>
            <FormattedMessage id={label} />
        </Button>
    );
};
