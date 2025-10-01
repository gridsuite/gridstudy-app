/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const errors_locale_fr = {
    //State estimation
    updateStateEstimationParametersError:
        "Une erreur est survenue lors de la mise a jour des paramètres de l'estimateur d'état",

    // DynamicSimulation
    fetchDynamicSimulationParametersError:
        'Une erreur est survenue lors de la récupération des paramètres de la simulation dynamique',
    fetchDynamicSimulationProvidersError:
        'Une erreur est survenue lors de la récupération des fournisseurs de la simulation dynamique',
    // Other
    resetLoadFlowParametersWarning:
        'Impossible de récupérer les paramètres de calcul de répartition définis dans le profil utilisateur (les valeurs par défaut sont appliquées)',
};

export default errors_locale_fr;
