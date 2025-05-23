/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import CheckboxNullableInput from '../../../utils/rhf-inputs/boolean-nullable-input';
import { useIntl } from 'react-intl';

type ConnectionCellRendererProps = {
    name: string;
};

export default function ConnectionCellRenderer({ name }: Readonly<ConnectionCellRendererProps>) {
    const intl = useIntl();
    return (
        <CheckboxNullableInput
            name={name}
            label={(checked: boolean | null) =>
                // cell value presents 'close'
                checked !== null
                    ? intl.formatMessage({ id: checked ? 'Closed' : 'Open' })
                    : intl.formatMessage({ id: 'NoModification' })
            }
        />
    );
}
