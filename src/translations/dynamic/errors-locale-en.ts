/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const errors_locale_en = {
    // Computed translations used in the snackbars
    // LoadFlow
    fetchDefaultLoadFlowProviderError: 'An error occured when fetching default load flow provider',
    fetchLoadFlowParametersError: 'An error occured when fetching the load flow parameters',
    fetchLoadFlowProviderError: 'An error occured when fetching the load flow provider',
    fetchLoadFlowProvidersError: 'An error occurred while fetching the load flow providers',
    fetchLoadFlowSpecificParametersError: 'An error occured when fetching the load flow specific parameters',
    updateLoadFlowParametersError: 'An error occurred while updating the load flow parameters',
    updateLoadFlowProviderError: 'An error occurred while updating the load flow provider',
    // SecurityAnalysis
    fetchDefaultSecurityAnalysisProviderError: 'An error occured when fetching default security analysis provider',
    fetchSecurityAnalysisParametersError: 'An error occured when fetching the security analysis parameters',
    fetchSecurityAnalysisProviderError: 'An error occured when fetching security analysis provider',
    fetchSecurityAnalysisProvidersError: 'An error occured when fetching security analysis provider list',
    updateSecurityAnalysisParametersError: 'An error occurred while updating the security analysis parameters',
    updateSecurityAnalysisProviderError: 'An error occured when updating security analysis provider',
    // SensitivityAnalysis
    fetchDefaultSensitivityAnalysisProviderError:
        'An error occured when fetching default sensitivity analysis provider',
    fetchSensitivityAnalysisParametersError: 'An error occured when fetching the sensitivity analysis parameters',
    fetchSensitivityAnalysisProviderError: 'An error occured when fetching sensitivity analysis provider',
    fetchSensitivityAnalysisProvidersError: 'An error occured when fetching sensitivity analysis provider list',
    updateSensitivityAnalysisParametersError: 'An error occurred while updating the sensitivity analysis parameters',
    updateSensitivityAnalysisProviderError: 'An error occured when updating sensitivity analysis provider',
    getSensitivityAnalysisFactorsCountError: 'An error occured while estimating sensitivity analysis computations',
    // NonEvacuatedEnergy
    fetchNonEvacuatedEnergyProviderError: 'An error occured when fetching non evacuated energy provider',
    fetchNonEvacuatedEnergyProvidersError: 'An error occured when fetching non evacuated energy provider list',
    updateNonEvacuatedEnergyParametersError: 'An error occurred while updating the non evacuated energy parameters',
    // DynamicSimulation
    fetchDynamicSimulationParametersError: 'An error occured when fetching the dynamic simulation parameters',
    fetchDynamicSimulationProvidersError: 'An error occured when fetching dynamic simulation provider list',
    // VoltageInit
    updateVoltageInitParametersError: 'An error occurred while updating the voltage profile initialization parameters',
    // Other
    resetLoadFlowParametersWarning:
        'Impossible to retrieve the load flow parameters defined in the user profile (default values are used)',
    //State estimation
    updateStateEstimationParametersError: 'An error occurred while updating the state estimation parameters',
};

export default errors_locale_en;
