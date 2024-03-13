export enum OptionalServicesNames {
    SecurityAnalysis = 'SecurityAnalysis',
    SensitivityAnalysis = 'SensitivityAnalysis',
    DynamicSimulation = 'DynamicSimulation',
    ShortCircuit = 'ShortCircuit',
    VoltageInit = 'VoltageInit',
}
export enum OptionalServicesStatus {
    Up = 'UP',
    Down = 'DOWN',
    Pending = 'PENDING',
}

export interface IOptionalService {
    name: OptionalServicesNames;
    status: OptionalServicesStatus;
}
export const getOptionalServiceByServerName = (
    serverName: string,
): OptionalServicesNames | undefined => {
    switch (serverName) {
        case 'security-analysis-server':
            return OptionalServicesNames.SecurityAnalysis;
        case 'sensitivity-analysis-server':
            return OptionalServicesNames.SensitivityAnalysis;
        case 'dynamic-simulation-server':
            return OptionalServicesNames.DynamicSimulation;
        case 'shortcircuit-server':
            return OptionalServicesNames.ShortCircuit;
        case 'voltage-init-server':
            return OptionalServicesNames.VoltageInit;
        default:
            return;
    }
};
