/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fetchStudyMetadata } from '@gridsuite/commons-ui';

export async function fetchSubstationPropertiesGlobalFilters(): Promise<{
    substationPropertiesGlobalFilters?: Map<string, string[]>;
}> {
    const { substationPropertiesGlobalFilters } = await fetchStudyMetadata();
    const definedSubstationPropertiesGlobalFilters: Map<string, string[]> = substationPropertiesGlobalFilters
        ? new Map(Object.entries(substationPropertiesGlobalFilters))
        : new Map<string, string[]>();
    return {
        substationPropertiesGlobalFilters: definedSubstationPropertiesGlobalFilters,
    };
}
