/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const menu_locale_en = {
    // Used in the right click menus on the map and SLD
    EnergiseOnOneEndLine: 'Energise on one end ({substation})',
    Lockout2WTransformer: 'Lock out the transformer',
    Lockout3WTransformer: 'Lock out the transformer',
    LockoutLine: 'Lock out the line',
    LockoutHvdcLine: 'Lock out the HVDC line',
    SwitchOnLine: 'Switch on the line',
    Trip2WTransformer: 'Trip the transformer',
    Trip3WTransformer: 'Trip the transformer',
    TripLine: 'Trip the line',
    TripBusbarSection: 'Trip the bus bar section',
    TripHvdcLine: 'Trip the HVDC line',
    UnableToEnergiseOnOneEndLine: 'Unable to energise the line end',
    UnableToLockout2WTransformer: 'Unable to lockout the transformer',
    UnableToLockout3WTransformer: 'Unable to lockout the transformer',
    UnableToLockoutLine: 'Unable to lockout the line',
    UnableToSwitchOnLine: 'Unable to switch on the line',
    UnableToLockoutHvdcLine: 'Unable to lockout the HVDC line',
    UnableToTrip2WTransformer: 'Unable to trip the transformer',
    UnableToTrip3WTransformer: 'Unable to trip the transformer',
    UnableToTripLine: 'Unable to trip the line',
    UnableToTripBusbarSection: 'Unable to trip the bus bar section',
    UnableToTripHvdcLine: 'Unable to trip the HVDC line',

    // Dynamic simulation events with format `{eventType}{equipmentType}`
    Disconnect2WTransformer: 'Trip the transformer',
    Disconnect3WTransformer: 'Trip the transformer',
    DisconnectGenerator: 'Trip the generator',
    DisconnectLine: 'Trip the line',
    DisconnectLoad: 'Trip the load',
    NodeFaultBus: 'Node fault on bus',
};

export default menu_locale_en;
