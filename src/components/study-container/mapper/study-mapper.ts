export const UPDATE_TYPE_ERROR_MAPPER = {
    loadflow_failed: 'LoadFlowError',
    buildFailed: 'NodeBuildingError',
    securityAnalysis_failed: 'securityAnalysisError',
    sensitivityAnalysis_failed: 'sensitivityAnalysisError',
    nonEvacuatedEnergy_failed: 'nonEvacuatedEnergyAnalysisError',
    shortCircuitAnalysis_failed: 'ShortCircuitAnalysisError',
    oneBusShortCircuitAnalysis_failed: 'ShortCircuitAnalysisError',
    dynamicSimulation_failed: 'DynamicSimulationRunError',
    voltageInit_failed: 'voltageInitError',
};
