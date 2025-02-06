/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { RunningStatus } from '../../../utils/running-status';

export interface NonEvacuatedEnergyTabProps {
    studyUuid: UUID;
    nodeUuid: UUID | undefined;
    currentRootNetworkUuid: UUID;
}
export interface NonEvacuatedEnergyResultProps {
    result: object;
    status: RunningStatus;
}
