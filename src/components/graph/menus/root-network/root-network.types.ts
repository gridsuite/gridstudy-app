/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';

export interface Modification {
    modificationUuid: UUID;
    impactedEquipmentId: string;
    messageValues: string;
    messageType: string;
}

export interface ModificationsSearchResult {
    nodeUuid: UUID;
    modifications: Modification[];
}
