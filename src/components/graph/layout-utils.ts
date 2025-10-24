/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SecurityGroupMembersMap } from './layout.type';

export function addMember(map: SecurityGroupMembersMap, key: string, member: string) {
    const group = map.get(key);
    if (group) {
        group.push(member);
    } else {
        map.set(key, [member]);
    }
}
