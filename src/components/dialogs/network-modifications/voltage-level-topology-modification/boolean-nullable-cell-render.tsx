/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import CheckboxNullableInput from '../../../utils/rhf-inputs/boolean-nullable-input';
import { useIntl } from 'react-intl';

export const BooleanNullableCellRenderer = (props: { name: string; connected: null }) => {
    const intl = useIntl();
    return (
        <CheckboxNullableInput
            name={props.name}
            label={
                props.connected !== null
                    ? intl.formatMessage({ id: props.connected ? 'Open' : 'Closed' })
                    : intl.formatMessage({ id: 'NoModification' })
            }
        />
    );
};
