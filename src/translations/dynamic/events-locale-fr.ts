/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const events_locale_fr = {
    // Used in edition dialog and list of dynamic simulation events with format `Event{eventType}{equipmentType}`
    EventDisconnect2WTransformer: 'Déclencher le transformateur {computedLabel}',
    EventDisconnect3WTransformer: 'Déclencher le transformateur {computedLabel}',
    EventDisconnectGenerator: 'Déclencher le groupe {computedLabel}',
    EventDisconnectLine: 'Déclencher la ligne {computedLabel}',
    EventDisconnectLoad: 'Déclencher la consommation {computedLabel}',
    EventNodeFaultBus: 'Court-circuit sur le bus {computedLabel}',
};

export default events_locale_fr;
