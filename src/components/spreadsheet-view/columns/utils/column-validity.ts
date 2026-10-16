/*
 * Copyright © 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { RunningStatus } from '@gridsuite/commons-ui';
import { ColumnDefinition, SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import { extractFormulaPaths, FormulaPath } from './formula-references';

// Equipment fields whose values are only valid when a loadflow has succeeded.
// - equipmentTypes: undefined means the group applies to all equipment types
// - securityNodeOnly: true means the group only applies when on a security analysis node
const LOADFLOW_DEPENDENT_FIELD_GROUPS: {
    fields: string[];
    equipmentTypes?: SpreadsheetEquipmentType[];
    securityNodeOnly?: boolean;
}[] = [
    { fields: ['p', 'p1', 'p2', 'p3', 'q', 'q1', 'q2', 'q3'] },
    { fields: ['v', 'angle'], equipmentTypes: [SpreadsheetEquipmentType.BUS] },
    {
        fields: ['ratioTapChanger.tapPosition', 'phaseTapChanger.tapPosition'],
        equipmentTypes: [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER, SpreadsheetEquipmentType.BRANCH],
        securityNodeOnly: true,
    },
    { fields: ['sectionCount'], equipmentTypes: [SpreadsheetEquipmentType.SHUNT_COMPENSATOR], securityNodeOnly: true },
];

const getInvalidFields = (equipmentType: SpreadsheetEquipmentType, isSecurityNode: boolean): Set<string> =>
    new Set(
        LOADFLOW_DEPENDENT_FIELD_GROUPS.filter(
            (group) =>
                (!group.equipmentTypes || group.equipmentTypes.includes(equipmentType)) &&
                (!group.securityNodeOnly || isSecurityNode)
        ).flatMap((group) => group.fields)
    );

export type NodeValidity = {
    loadFlowStatus: RunningStatus;
    isSecurityNode: boolean;
};

// A row mixes values from the current node and from the aliased ones, each with its own loadflow
export type SpreadsheetValidity = {
    currentNode: NodeValidity;
    nodesByAlias: Record<string, NodeValidity>;
};

type NodeRead = { node: NodeValidity; field: string };

const resolvePath = ([head, ...rest]: FormulaPath, validity: SpreadsheetValidity): NodeRead => {
    const aliasedNode = rest.length > 0 ? validity.nodesByAlias[head] : undefined;
    return aliasedNode
        ? { node: aliasedNode, field: rest.join('.') }
        : { node: validity.currentNode, field: [head, ...rest].join('.') };
};

export const computeInvalidColumnIds = (
    columns: ColumnDefinition[],
    equipmentType: SpreadsheetEquipmentType,
    validity: SpreadsheetValidity
): Set<string> => {
    const invalidOnSecurityNode = getInvalidFields(equipmentType, true);
    const invalidOnOtherNode = getInvalidFields(equipmentType, false);
    const readsUnreliableValue = ({ node, field }: NodeRead) =>
        node.loadFlowStatus !== RunningStatus.SUCCEED &&
        (node.isSecurityNode ? invalidOnSecurityNode : invalidOnOtherNode).has(field);

    const readersByColumnId = new Map<string, string[]>();
    const invalidIdsToVisit: string[] = [];

    for (const col of columns) {
        const declaredDependencies = new Set(col.dependencies ?? []);
        // a dependency name resolves to that column's value, not to the field of the same name
        const readsColumn = (path: FormulaPath) => declaredDependencies.has(path[0]);
        const paths = extractFormulaPaths(col.formula);

        paths
            .filter(readsColumn)
            .forEach((path) => readersByColumnId.set(path[0], [...(readersByColumnId.get(path[0]) ?? []), col.id]));
        const readsUnreliable = paths
            .filter((path) => !readsColumn(path))
            .map((path) => resolvePath(path, validity))
            .some(readsUnreliableValue);
        if (readsUnreliable) {
            invalidIdsToVisit.push(col.id);
        }
    }

    const result = new Set<string>();
    while (invalidIdsToVisit.length > 0) {
        const id = invalidIdsToVisit.pop();
        if (id === undefined || result.has(id)) continue;
        result.add(id);
        invalidIdsToVisit.push(...(readersByColumnId.get(id) ?? []));
    }

    return result;
};
