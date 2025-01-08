/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { useIntl } from 'react-intl';

export default function useFormatLabelWithUnit() {
    const intl = useIntl();
    return useMemo(() => {
        return (value: string | { label: string; unit?: string }) => {
            if (typeof value === 'string') {
                return value;
            }
            return `${intl.formatMessage({ id: value.label })} ${value.unit ?? ''}`;
        };
    }, [intl]);
}
