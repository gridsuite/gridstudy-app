/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// complete individual global filter
import type { UUID } from 'crypto';

// complete individual global filter
export interface GlobalFilter {
    label: string;
    filterType: string;
    filterSubtype?: string; // when filterType needs more precise subcategories
    filterTypeFromMetadata?: string; // only useful for generic filters
    recent?: boolean;
    uuid?: UUID; // only useful for generic filters
    equipmentType?: string; // only useful for generic filters
    path?: string; // only useful for generic filters
}
