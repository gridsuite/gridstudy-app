export enum OptionalServices {
    SecurityAnalysis = 'SecurityAnalysis',
    SensitivityAnalysis = 'SensitivityAnalysis',
    DynamicSimulation = 'DynamicSimulation',
    ShortCircuit = 'ShortCircuit',
    VoltageInit = 'VoltageInit',
}

export const getOptionalServiceByServerName = (
    serverName: string
): OptionalServices | undefined => {
    switch (serverName) {
        case 'security-analysis-server':
            return OptionalServices.SecurityAnalysis;
        case 'sensitivity-analysis-server':
            return OptionalServices.SensitivityAnalysis;
        case 'dynamic-simulation-server':
            return OptionalServices.DynamicSimulation;
        case 'shortcircuit-server':
            return OptionalServices.ShortCircuit;
        case 'voltage-init-server':
            return OptionalServices.VoltageInit;
        default:
            return;
    }
};
