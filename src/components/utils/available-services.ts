interface AvailableServices {
    'security-analysis-server': string,
    'sensitivity-analysis-server': string,
    'dynamic-simulation-server': string,
    'shortcircuit-server': string,
    'voltage-init-server': string,
}

export const AVAILABLE_SERVICES: AvailableServices = {
    'security-analysis-server': 'SecurityAnalysis',
    'sensitivity-analysis-server': 'SensitivityAnalysis',
    'dynamic-simulation-server': 'DynamicSimulation',
    'shortcircuit-server': 'ShortCircuit',
    'voltage-init-server': 'VoltageInit',
};