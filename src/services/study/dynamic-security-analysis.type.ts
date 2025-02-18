/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type DynamicSecurityAnalysisParametersInfos = {
    provider?: string;
    scenarioDuration?: number;
    contingenciesStartTime?: number;
    contingencyListIds?: string[];
};

export type DynamicSecurityAnalysisParametersFetchReturn = Exclude<
    DynamicSecurityAnalysisParametersInfos,
    'contingencyListIds'
> & {
    contingencyListInfos?: { id: string; name: string }[];
};
