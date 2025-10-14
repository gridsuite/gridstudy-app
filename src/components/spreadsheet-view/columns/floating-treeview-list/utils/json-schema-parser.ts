/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { JSONSchema4 } from 'json-schema';
import { IntlShape } from 'react-intl';
import { fieldsPriorityOrder } from './sort-priority-order';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';

export type TreeNode = {
    id: string;
    label: string;
    type?: string;
    children?: TreeNode[];
};

function formatSpecialCases(nodeId: string) {
    // Matches following cases : properties, voltageLevelProperties, voltageLevelProperties1, voltageLevelProperties2, substationProperties, voltageLevels[].properties...
    if (nodeId.includes('roperties')) {
        return `${nodeId}.`;
    } else if (wildcardMatch('operationalLimitsGroup*', nodeId)) {
        if (['operationalLimitsGroup1', 'operationalLimitsGroup2'].includes(nodeId)) {
            return `${nodeId}[]`;
        }
        return nodeId.replace(/(operationalLimitsGroup[\w\d]*)(\.)/, '$1[]$2');
    }
    return nodeId;
}

function filterRedundantProperties(nodeId: string, equipmentType: SpreadsheetEquipmentType) {
    const exclusionList = ['voltageLevels[].substationId', 'voltageLevels[].substationProperties'];
    if ([SpreadsheetEquipmentType.LINE, SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER].includes(equipmentType)) {
        exclusionList.push('type');
    }
    if ([SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER].includes(equipmentType)) {
        exclusionList.push('country');
    }
    return !exclusionList.includes(nodeId);
}

function wildcardMatch(pattern: string, value: string): boolean {
    // Convert * to regex ".*" and escape other special regex characters
    const regexStr = `^${pattern.replaceAll('*', '.*')}$`;
    return new RegExp(regexStr).test(value);
}

function getPriority(id: string): number {
    const exactIndex = fieldsPriorityOrder.indexOf(id);
    if (exactIndex !== -1) {
        return exactIndex;
    }
    const wildcardIndex = fieldsPriorityOrder.findIndex(
        (pattern) => pattern.includes('*') && wildcardMatch(pattern, id)
    );
    if (wildcardIndex !== -1) {
        return wildcardIndex;
    }

    // If a field isn't in the priority list it get placed in the middle of the fields
    return fieldsPriorityOrder.length / 2;
}

export function sortData(treeData: TreeNode[]) {
    const sorted = [...treeData].sort((a, b) => {
        const pa = getPriority(a.id);
        const pb = getPriority(b.id);

        if (pa !== pb) {
            return pa - pb;
        }
        return a.label.localeCompare(b.label);
    });
    // Recursively sort children if present
    for (const node of sorted) {
        if (node.children) {
            node.children = sortData(node.children);
        }
    }
    return sorted;
}

/**
 * Builds a registry of all schemas found by walking the tree.
 */
function collectSchemas(schema: JSONSchema4, registry: Map<string, JSONSchema4>) {
    if (!schema) {
        return;
    }
    if (schema.id) {
        registry.set(schema.id, schema);
    }

    if (schema.properties) {
        Object.values(schema.properties).forEach((v) => collectSchemas(v, registry));
    }

    if (schema.items) {
        if (Array.isArray(schema.items)) {
            schema.items.forEach((s) => collectSchemas(s, registry));
        } else {
            collectSchemas(schema.items, registry);
        }
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        collectSchemas(schema.additionalProperties, registry);
    }
}

/**
 * Resolves $ref against the registry.
 */
function resolveRef(ref: string, registry: Map<string, JSONSchema4>): JSONSchema4 | null {
    return registry.get(ref) ?? null;
}

export function buildTreeData(
    schema: JSONSchema4 | null,
    rootSchema: JSONSchema4 | null,
    intl: IntlShape | null,
    equipmentType: SpreadsheetEquipmentType,
    parentKey: string = '',
    registry?: Map<string, JSONSchema4>
): TreeNode[] {
    if (!schema || !rootSchema) {
        return [];
    }

    // Build registry once at the root call
    if (!registry) {
        registry = new Map();
        collectSchemas(rootSchema, registry);
    }

    if (schema.$ref) {
        const resolved = resolveRef(schema.$ref, registry);
        if (!resolved) {
            console.warn(`Unresolved $ref during json schema parsing: ${schema.$ref}`);
            return [];
        }
        return buildTreeData(resolved, rootSchema, intl, equipmentType, parentKey, registry);
    }

    if (schema.type?.includes('array') && schema.items && intl) {
        const nodeId = `${parentKey}[]`;
        const children = buildTreeData(schema.items as JSONSchema4, rootSchema, intl, equipmentType, nodeId, registry);

        // For all nodes of array type we add an additionnal custom variable to get the amount of elements
        const lengthNode: TreeNode = {
            id: `length(${parentKey})`,
            label: `${intl.formatMessage({ id: 'Length' })}`,
            type: 'number',
        };
        return [...children, lengthNode];
    }

    if (schema.additionalProperties) {
        return buildTreeData(schema.additionalProperties as JSONSchema4, rootSchema, intl, equipmentType, parentKey);
    }

    if (schema.type === 'object' || schema.properties) {
        return Object.entries(schema.properties ?? {})
            .filter(([key]) => {
                // In case of a substation equipment we filter out substations properties inside voltage level
                return filterRedundantProperties(parentKey ? `${parentKey}.${key}` : key, equipmentType);
            })
            .map(([key, value]) => {
                const childSchema = value as JSONSchema4;
                let nodeId = parentKey ? `${parentKey}.${key}` : key;
                // Flatten case: anyOf with $ref to enum
                if (childSchema?.enum) {
                    return {
                        id: nodeId,
                        label: key,
                        type: 'enum',
                    };
                }

                let type: (string | undefined)[] = Array.isArray(childSchema.type)
                    ? Object.values(childSchema.type).filter((t) => t !== 'null')
                    : [childSchema.type];
                type = type.filter(Boolean);

                const children = buildTreeData(childSchema, rootSchema, intl, equipmentType, nodeId, registry);

                // For all nodes of object type we add an additionnal custom variable to get the amount of elements
                if (type.includes('object') && intl) {
                    children.push({
                        id: `length(${nodeId})`,
                        label: `${intl.formatMessage({ id: 'Length' })}`,
                        type: 'number',
                    });
                }

                return {
                    id: formatSpecialCases(nodeId),
                    label: key,
                    type: type.length > 0 ? type[0] : 'object',
                    children,
                };
            });
    }

    return [];
}
