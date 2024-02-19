/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { isBlankOrEmpty } from '../components/utils/validation-functions';
import { roundToDefaultPrecision } from './rounding';

export const unitToMicroUnit = (num: any) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num * 1e6);
export const microUnitToUnit = (num: any) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num / 1e6);
export const kiloUnitToUnit = (num: any) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num * 1e3);
export const unitToKiloUnit = (num: any) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num / 1e3);
