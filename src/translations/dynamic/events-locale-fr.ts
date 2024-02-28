/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const events_locale_fr = {
    // Used in edition dialog and list of dynamic simulation events with format `Event{eventType}{equipmentType}`
    EventDisconnectLine: 'Trip line {computedLabel}',
    EventDisconnect2WTransformer: 'Trip transformer {computedLabel}',
    EventDisconnect3WTransformer: 'Trip transformer {computedLabel}',
    EventDisconnectLoad: 'Trip load {computedLabel}',
    EventDisconnectGenerator: 'Trip generator {computedLabel}',
    EventNodeFaultBus: 'Node fault on bus {computedLabel}',
};

export default events_locale_fr;
