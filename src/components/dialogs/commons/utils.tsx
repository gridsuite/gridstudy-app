/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Option } from '@gridsuite/commons-ui';

// trick to have a conditional return type by argument value nullish state
export function getIdOrValue(value: Option): string;
export function getIdOrValue(value: Option | null): string | null;
export function getIdOrValue(value: Option | null | undefined): string | null {
    return typeof value === 'string' ? value : value?.id ?? null;
}

export function getLabelOrValue(value: Option): string {
    return typeof value === 'string' ? value : value?.label;
}
