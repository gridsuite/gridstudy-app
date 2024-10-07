/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { getEnumLabelById } from 'components/utils/utils';
import React from 'react';
import { useIntl } from 'react-intl';
import { EnumOption } from '../utils/config-tables';

interface EnumCellRendererProps {
    value: string;
    enumOptions: EnumOption[];
}

const EnumCellRenderer: React.FC<EnumCellRendererProps> = ({ value, enumOptions }) => {
    const intl = useIntl();

    if (!value) {
        return null;
    }

    const label = getEnumLabelById(enumOptions, value) || value;

    return <span>{intl.formatMessage({ id: label, defaultMessage: label })}</span>;
};

export default EnumCellRenderer;
