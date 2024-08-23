/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const menu_locale_fr = {
    // Used in the right click menus on the map and SLD
    EnergiseOnOneEndLine: 'Mettre sous tension à vide depuis {substation}',
    Lockout2WTransformer: 'Consigner le transformateur',
    Lockout3WTransformer: 'Consigner le transformateur',
    LockoutLine: 'Consigner la ligne',
    LockoutHvdcLine: 'Consigner la ligne HVDC',
    SwitchOnLine: 'Mettre en service la ligne',
    Trip2WTransformer: 'Déclencher le transformateur',
    Trip3WTransformer: 'Déclencher le transformateur',
    TripLine: 'Déclencher la ligne',
    TripBusbarSection: 'Déclencher la section de jeu de barre',
    TripHvdcLine: 'Déclencher la ligne HVDC',
    UnableToEnergiseOnOneEndLine: 'Impossible de mettre sous tension à vide',
    UnableToLockout2WTransformer: 'Impossible de consigner le transformateur',
    UnableToLockout3WTransformer: 'Impossible de consigner le transformateur',
    UnableToLockoutLine: 'Impossible de consigner la ligne',
    UnableToLockoutHvdcLine: 'Impossible de consigner la ligne HVDC',
    UnableToSwitchOnLine: 'Impossible de mettre la ligne en service',
    UnableToTrip2WTransformer: 'Impossible de déclencher le transformateur',
    UnableToTrip3WTransformer: 'Impossible de déclencher le transformateur',
    UnableToTripLine: 'Impossible de déclencher la ligne',
    UnableToTripBusbarSection: 'Impossible de déclencher la section de jeu de barre',
    UnableToTripHvdcLine: 'Impossible de déclencher la ligne HVDC',

    // Dynamic simulation events with format {eventType}{equipmentType}`
    Disconnect2WTransformer: 'Déclencher le transformateur',
    Disconnect3WTransformer: 'Déclencher le transformateur',
    DisconnectGenerator: 'Déclencher le groupe',
    DisconnectLine: 'Déclencher la ligne',
    DisconnectLoad: 'Déclencher la consommation',
    NodeFaultBus: 'Court-circuit sur le bus',
};

export default menu_locale_fr;
