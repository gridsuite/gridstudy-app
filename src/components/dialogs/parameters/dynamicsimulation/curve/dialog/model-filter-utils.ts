/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DynamicSimulationModelInfos } from '../../../../../../services/study/dynamic-simulation.type';
import { ModelVariable } from '../curve.type';

interface VariableTree {
    [model: string]: {
        [variableOrVariableSet: string]:
            | string
            | {
                  [variable: string]: string;
              };
    };
}

const modelsToVariablesTree = (models: DynamicSimulationModelInfos[]) => {
    return models.reduce<VariableTree>(
        (obj, model) => ({
            ...obj,
            [model.modelName]: {
                ...model.variableDefinitions.reduce(
                    (obj, variable) => ({
                        ...obj,
                        [variable.name]: variable.name,
                    }),
                    {}
                ),
                ...model.variablesSets.reduce(
                    (obj, variablesSet) => ({
                        ...obj,
                        [variablesSet.name]: variablesSet.variableDefinitions.reduce(
                            (obj, variable) => ({
                                ...obj,
                                [variable.name]: variable.name,
                            }),
                            {}
                        ),
                    }),
                    {}
                ),
            },
        }),
        {}
    );
};

const variablesTreeToVariablesArray = (variablesTree: VariableTree | string, parentId?: string) => {
    let result: ModelVariable[] = [];
    Object.entries(variablesTree).map(([key, value]) => {
        const id = parentId ? `${parentId}/${key}` : key;
        if (typeof value === 'object') {
            // make container element
            result = [
                ...result,
                {
                    id: id,
                    name: key,
                    parentId: parentId,
                },
            ];
            // make contained elements
            result = [...result, ...variablesTreeToVariablesArray(value, id)];
        }
        if (typeof value === 'string') {
            result = [
                ...result,
                {
                    id: id,
                    name: value,
                    parentId: parentId,
                    variableId: key,
                },
            ];
        }
        return result;
    });

    return result;
};

export function modelsToVariables(models: DynamicSimulationModelInfos[]) {
    const variablesTree = modelsToVariablesTree(models);
    const variables = variablesTreeToVariablesArray(variablesTree);
    return variables;
}
