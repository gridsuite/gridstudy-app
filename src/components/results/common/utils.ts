/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { IntlShape } from 'react-intl';

export const PERMANENT_LIMIT_NAME = 'permanent';

export const translateLimitName = (
    limitName: string | null | undefined,
    intl: IntlShape
) =>
    limitName === PERMANENT_LIMIT_NAME
        ? intl.formatMessage({ id: 'PermanentLimitName' })
        : limitName;
