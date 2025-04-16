/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import CheckboxNullableInput from '../../../utils/rhf-inputs/boolean-nullable-input';
import { TOPOLOGY_MODIFICATION_TABLE } from '../../../utils/field-constants';
import { useIntl } from 'react-intl';

export const BooleanNullableCellRenderer = (props: any) => {
    const intl = useIntl();
    return (
        <CheckboxNullableInput
            name={`${TOPOLOGY_MODIFICATION_TABLE}[${props.node.rowIndex}].${props.colDef.field}`}
            label={
                props.data.currentConnectionStatus !== null
                    ? intl.formatMessage({ id: props.data.currentConnectionStatus ? 'Open' : 'Close' })
                    : intl.formatMessage({ id: 'NoModification' })
            }
        />
    );
};
