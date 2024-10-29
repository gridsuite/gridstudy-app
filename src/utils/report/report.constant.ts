/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ComputingType from '../../components/computing-status/computing-type';

export const GLOBAL_REPORT_NODE_LABEL = 'Logs';

// must be in-sync with ReportType in study-server
export const COMPUTING_AND_NETWORK_MODIFICATION_TYPE = {
    ...ComputingType,
    NETWORK_MODIFICATION: 'NETWORK_MODIFICATION',
};
