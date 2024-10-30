/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, ButtonProps } from '@mui/material';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

export type LabelledButtonProps = Omit<ButtonProps, 'onClick'> & {
    callback: NonNullable<ButtonProps['onClick']>;
    label: NonNullable<MessageDescriptor['id']>;
};

export default function LabelledButton({ callback, label, ...props }: Readonly<LabelledButtonProps>) {
    return (
        <Button onClick={callback} {...props}>
            <FormattedMessage id={label} />
        </Button>
    );
}
