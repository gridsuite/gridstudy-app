/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { backendFetchJson } from './utils';

export const PREFIX_VOLTAGE_INIT_QUERIES = import.meta.env.VITE_API_GATEWAY + '/voltage-init';

export function getVoltageInitUrl() {
    return `${PREFIX_VOLTAGE_INIT_QUERIES}/v1/`;
}

export function getVoltageInitParameters(parameterUuid: UUID) {
    console.info('get voltage init parameters');
    const getVoltageInitParams = getVoltageInitUrl() + 'parameters/' + encodeURIComponent(parameterUuid);
    console.debug(getVoltageInitParams);
    return backendFetchJson(getVoltageInitParams);
}
