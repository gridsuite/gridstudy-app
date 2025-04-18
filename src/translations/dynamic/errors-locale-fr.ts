/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const errors_locale_fr = {
    // Computed translations used in the snackbars
    // LoadFlow
    fetchDefaultLoadFlowProviderError:
        'Une erreur est survenue lors de la récupération du fournisseur de calcul de répartition par défaut',
    fetchLoadFlowParametersError:
        'Une erreur est survenue lors de la récupération des paramètres de calcul de répartition',
    fetchLoadFlowProviderError:
        'Une erreur est survenue lors de la récupération du fournisseur de calcul de répartition',
    fetchLoadFlowProvidersError:
        'Une erreur est survenue lors de la récupération des fournisseurs de calcul de répartition',
    fetchLoadFlowSpecificParametersError:
        'Une erreur est survenue lors de la récupération des paramètres spécifiques de calcul de répartition',
    updateLoadFlowParametersError:
        'Une erreur est survenue lors de la mise à jour des paramètres de calcul de répartition',
    updateLoadFlowProviderError:
        'Une erreur est survenue lors de la mise à jour du fournisseur courant de calcul de répartition',
    // SecurityAnalysis
    fetchDefaultSecurityAnalysisProviderError:
        "Une erreur est survenue lors de la récupération du fournisseur d'analyse de sécurité par défaut",
    fetchSecurityAnalysisParametersError:
        "Une erreur est survenue lors de la récupération des paramètres de l'analyse de sécurité",
    fetchSecurityAnalysisProviderError:
        "Une erreur est survenue lors de la récupération du fournisseur courant d'analyse de sécurité",
    fetchSecurityAnalysisProvidersError:
        "Une erreur est survenue lors de la récupération des fournisseurs d'analyse de sécurité",
    updateSecurityAnalysisParametersError:
        "Une erreur est survenue lors de la mise a jour des paramètres de l'analyse de sécurité",
    updateSecurityAnalysisProviderError:
        "Une erreur est survenue lors de la mise a jour du fournisseur courant d'analyse de sécurité",
    // SensitivityAnalysis
    fetchDefaultSensitivityAnalysisProviderError:
        "Une erreur est survenue lors de la récupération du fournisseur d'analyse de sensibilité par défaut",
    fetchSensitivityAnalysisParametersError:
        "Une erreur est survenue lors de la récupération des paramètres de l'analyse de sensibilité",
    fetchSensitivityAnalysisProviderError:
        "Une erreur est survenue lors de la récupération du fournisseur courant d'analyse de sensibilité",
    fetchSensitivityAnalysisProvidersError:
        "Une erreur est survenue lors de la récupération des fournisseurs d'analyse de sensibilité",
    updateSensitivityAnalysisParametersError:
        "Une erreur est survenue lors de la mise a jour des paramètres de l'analyse de sensibilité",
    updateSensitivityAnalysisProviderError:
        "Une erreur est survenue lors de la mise a jour du fournisseur courant d'analyse de sensibilité",
    getSensitivityAnalysisFactorsCountError: "Une erreur est survenue lors de l'estimation du nombre de calculs",
    // NonEvacuatedEnergy
    fetchNonEvacuatedEnergyProviderError:
        "Une erreur est survenue lors de la récupération du fournisseur d'analyse d'énergie non évacuée",
    fetchNonEvacuatedEnergyProvidersError:
        "Une erreur est survenue lors de la récupération des fournisseurs d'analyse d'énergie non évacuée",
    updateNonEvacuatedEnergyParametersError:
        "Une erreur est survenue lors de la mise a jour des paramètres de l'analyse d'énergie non évacuée",
    // DynamicSimulation
    fetchDynamicSimulationParametersError:
        'Une erreur est survenue lors de la récupération des paramètres de la simulation dynamique',
    fetchDynamicSimulationProvidersError:
        'Une erreur est survenue lors de la récupération des fournisseurs de la simulation dynamique',
    // VoltageInit
    updateVoltageInitParametersError:
        "Une erreur est survenue lors de la mise a jour des paramètres de l'initialisation du plan de tension",
    // Other
    resetLoadFlowParametersWarning:
        'Impossible de récupérer les paramètres de calcul de répartition définis dans le profil utilisateur (les valeurs par défaut sont appliquées)',
    //State estimation
    updateStateEstimationParametersError:
        "Une erreur est survenue lors de la mise a jour des paramètres de l'estimateur d'état",
};

export default errors_locale_fr;
