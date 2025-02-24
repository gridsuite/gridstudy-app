/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';

export enum SolverTypeInfos {
    IDA = 'IDA',
    SIM = 'SIM',
}

type CommonSolverInfos = {
    id: string;
    name: string;
    type: SolverTypeInfos;
    fNormTolAlg: number;
    initialAddTolAlg: number;
    scStepTolAlg: number;
    mxNewTStepAlg: number;
    msbsetAlg: number;
    mxIterAlg: number;
    printFlAlg: number;
    fNormTolAlgJ: number;
    initialAddTolAlgJ: number;
    scStepTolAlgJ: number;
    mxNewTStepAlgJ: number;
    msbsetAlgJ: number;
    mxIterAlgJ: number;
    printFlAlgJ: number;
    fNormTolAlgInit: number;
    initialAddTolAlgInit: number;
    scStepTolAlgInit: number;
    mxNewTStepAlgInit: number;
    msbsetAlgInit: number;
    mxIterAlgInit: number;
    printFlAlgInit: number;
    maximumNumberSlowStepIncrease: number;
    minimalAcceptableStep: number;
};

type IdaSolverInfos = CommonSolverInfos & {
    name: 'IDA';
    type: SolverTypeInfos.IDA;
    order: number;
    initStep: number;
    minStep: number;
    maxStep: number;
    absAccuracy: number;
    relAccuracy: number;
};

type SimSolverInfos = CommonSolverInfos & {
    name: 'SIM';
    type: SolverTypeInfos.SIM;
    hMin: number;
    hMax: number;
    kReduceStep: number;
    maxNewtonTry: number;
    linearSolverName: string;
    fNormTol: number;
    initialAddTol: number;
    scStepTol: number;
    mxNewTStep: number;
    msbset: number;
    mxIter: number;
    printFl: number;
    optimizeAlgebraicResidualsEvaluations: boolean;
    skipNRIfInitialGuessOK: boolean;
    enableSilentZ: boolean;
    optimizeReInitAlgebraicResidualsEvaluations: boolean;
    minimumModeChangeTypeForAlgebraicRestoration: string;
    minimumModeChangeTypeForAlgebraicRestorationInit: string;
};

type NetworkInfos = Record<string, number | string | boolean>;

type CurveInfos = {
    equipmentType?: string;
    equipmentId: string;
    variableId: string;
};

enum PropertyType {
    ENUM = 'ENUM',
    BOOLEAN = 'BOOLEAN',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    STRING = 'STRING',
}

type EventPropertyInfos = {
    id: UUID;
    name: string;
    value: string;
    type: PropertyType;
};

type EventInfos = {
    id: UUID;
    nodeId: UUID;
    equipmentId: string;
    equipmentType: string;
    eventType: string;
    properties: EventPropertyInfos[];
};

export type SolverInfos = IdaSolverInfos | SimSolverInfos;

export type MappingInfos = {
    name: string;
};

export type DynamicSimulationParametersInfos = {
    provider?: string;
    startTime?: number;
    stopTime?: number;
    mapping?: string;
    solverId: string;
    solvers?: SolverInfos[];
    network?: NetworkInfos;
    curves?: CurveInfos[] | null;
    event?: EventInfos[];
};

export type DynamicSimulationParametersFetchReturn = DynamicSimulationParametersInfos & {
    mappings?: MappingInfos[];
};
