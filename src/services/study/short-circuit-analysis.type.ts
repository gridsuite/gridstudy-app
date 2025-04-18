/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ShortCircuitParametersDto } from 'components/dialogs/parameters/shortcircuit/short-circuit-parameters.type';
import { PREDEFINED_PARAMETERS } from 'components/utils/constants';

export interface ShortCircuitParametersInfos {
    parameters: ShortCircuitParametersDto;
    predefinedParameters: PREDEFINED_PARAMETERS;
    cei909VoltageRanges?: any;
}
