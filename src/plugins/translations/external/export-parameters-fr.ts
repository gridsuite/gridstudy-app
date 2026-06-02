/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// private rte extensions in powsybl-rte-core
const export_parameters_fr = {
    'iidm.export.xml.extensions.currentLimitsPerSeason': 'Limites de courant par saison',
    'iidm.export.xml.extensions.observabilityArea': "Zone d'observabilité",

    // not implemented yet in Gridsuite :
    'iidm.export.xml.extensions.CongestionManagement': 'gestion des congestions des batteries',
    'iidm.export.xml.extensions.StateOfCharge': 'Etat de charge de la batterie',
    'iidm.export.xml.extensions.activeSeason': 'Saison active',
};

export default export_parameters_fr;
