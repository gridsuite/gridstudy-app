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

/**
 * Formats node IDs for special cases in the tree structure.
 * Handles "properties" suffixes and operational limits groups with array notation.
 *
 * @param nodeId - The node identifier to format
 * @returns Formatted node ID with special syntax (e.g., properties., operationalLimitsGroup[])
 *
 * @example
 * formatSpecialCases('voltageLevelProperties') // 'voltageLevelProperties.'
 * formatSpecialCases('operationalLimitsGroup1') // 'operationalLimitsGroup1[]'
 */
function formatSpecialCases(nodeId: string): string {
    // Add trailing dot for any property-related nodes
    if (nodeId.includes('roperties')) {
        return `${nodeId}.`;
    }

    // Handle operational limits groups with array notation
    if (wildcardMatch('operationalLimitsGroup*', nodeId)) {
        // Standard group1/group2 get array brackets appended
        if (['operationalLimitsGroup1', 'operationalLimitsGroup2'].includes(nodeId)) {
            return `${nodeId}[]`;
        }
        // Nested groups get brackets inserted before the dot
        return nodeId.replace(/(operationalLimitsGroup[\w\d]*)(\.)/, '$1[]$2');
    }

    return nodeId;
}

/**
 * Filters out redundant or equipment-specific properties that shouldn't be displayed.
 * Different equipment types have different exclusion rules.
 *
 * @param nodeId - The node identifier to check
 * @param equipmentType - The type of spreadsheet equipment
 * @returns true if the property should be included, false if it should be filtered out
 */
function filterRedundantProperties(nodeId: string, equipmentType: SpreadsheetEquipmentType): boolean {
    const exclusionList = [
        'voltageLevels[].substationId',
        'voltageLevels[].substationProperties',
        'voltageLevels[].country',
    ];

    // Lines and transformers don't need the 'type' property
    if ([SpreadsheetEquipmentType.LINE, SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER].includes(equipmentType)) {
        exclusionList.push('type');
    }

    // Two-winding transformers don't need the 'country' property
    if ([SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER].includes(equipmentType)) {
        exclusionList.push('country');
    }

    return !exclusionList.includes(nodeId);
}

/**
 * Checks if a value matches a wildcard pattern.
 * Supports asterisk (*) as a wildcard character.
 *
 * @param pattern - Pattern string with optional wildcards (*)
 * @param value - Value to test against the pattern
 * @returns true if value matches the pattern
 *
 * @example
 * wildcardMatch('operational*', 'operationalLimitsGroup1') // true
 */
function wildcardMatch(pattern: string, value: string): boolean {
    // Convert wildcard pattern to regex: * becomes .*
    const regexStr = `^${pattern.replaceAll('*', '.*')}$`;
    return new RegExp(regexStr).test(value);
}

/**
 * Determines the sort priority for a field ID.
 * Checks for exact matches first, then wildcard patterns, then defaults to middle priority.
 *
 * @param id - The field identifier to get priority for
 * @returns Priority index (lower number = higher priority)
 */
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

/**
 * Recursively sorts tree nodes based on priority order and alphabetically by label.
 *
 * @param treeData - Array of tree nodes to sort
 * @returns Sorted array of tree nodes with recursively sorted children
 */
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
 * Recursively collects all schemas with IDs from a JSON Schema tree.
 * Builds a registry map for efficient $ref resolution.
 *
 * @param schema - The JSON Schema to walk
 * @param registry - Map to store schemas by their ID
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
 * Resolves a $ref reference using the schema registry.
 *
 * @param ref - The $ref string to resolve
 * @param registry - Map of schemas by ID
 * @returns Resolved schema or null if not found
 */
function resolveRef(ref: string, registry: Map<string, JSONSchema4>): JSONSchema4 | null {
    return registry.get(ref) ?? null;
}

/**
 * Creates a length counter node for arrays and objects.
 * This is a custom node type that allows counting elements.
 *
 * @param parentKey - The parent node's key
 * @param intl - Internationalization formatter
 * @returns TreeNode representing the length property
 */
function createLengthNode(parentKey: string, intl: IntlShape): TreeNode {
    return {
        id: `length(${parentKey})`,
        label: intl.formatMessage({ id: 'Length' }),
        type: 'number',
    };
}

/**
 * Extracts and normalizes the type from a JSON Schema.
 * Filters out 'null' types and handles both single types and type arrays.
 *
 * @param schema - JSON Schema to extract type from
 * @returns Array of type strings (without 'null')
 */
function extractSchemaTypes(schema: JSONSchema4): string[] {
    let types: (string | undefined)[] = Array.isArray(schema.type)
        ? schema.type.filter((t) => t !== 'null')
        : [schema.type];

    return types.filter(Boolean) as string[];
}

/**
 * Builds tree nodes from an object schema's properties.
 *
 * @param schema - JSON Schema with properties
 * @param rootSchema - Root schema for reference resolution
 * @param intl - Internationalization formatter
 * @param equipmentType - Type of equipment for filtering
 * @param parentKey - Parent node's key path
 * @param registry - Schema registry for $ref resolution
 * @returns Array of TreeNode objects
 */
function buildObjectPropertyNodes(
    schema: JSONSchema4,
    rootSchema: JSONSchema4,
    intl: IntlShape | null,
    equipmentType: SpreadsheetEquipmentType,
    parentKey: string,
    registry: Map<string, JSONSchema4>
): TreeNode[] {
    const properties = schema.properties ?? {};

    return Object.entries(properties)
        .filter(([key]) => {
            const fullPath = parentKey ? `${parentKey}.${key}` : key;
            return filterRedundantProperties(fullPath, equipmentType);
        })
        .map(([key, value]) => {
            const childSchema = value;
            const nodeId = parentKey ? `${parentKey}.${key}` : key;

            // Handle enum types
            if (childSchema?.enum) {
                return {
                    id: nodeId,
                    label: key,
                    type: 'enum',
                };
            }

            // Extract and normalize types
            const types = extractSchemaTypes(childSchema);
            const primaryType = types.length > 0 ? types[0] : 'object';

            // Recursively build children
            const children = buildTreeData(childSchema, rootSchema, intl, equipmentType, nodeId, registry);

            // Add length node for objects
            if (types.includes('object') && intl) {
                children.push(createLengthNode(nodeId, intl));
            }

            return {
                id: formatSpecialCases(nodeId),
                label: key,
                type: primaryType,
                children,
            };
        });
}

/**
 * Builds tree nodes from an array schema.
 *
 * @param schema - JSON Schema of type array
 * @param rootSchema - Root schema for reference resolution
 * @param intl - Internationalization formatter
 * @param equipmentType - Type of equipment for filtering
 * @param parentKey - Parent node's key path
 * @param registry - Schema registry for $ref resolution
 * @returns Array of TreeNode objects including a length node
 */
function buildArrayNodes(
    schema: JSONSchema4,
    rootSchema: JSONSchema4,
    intl: IntlShape,
    equipmentType: SpreadsheetEquipmentType,
    parentKey: string,
    registry: Map<string, JSONSchema4>
): TreeNode[] {
    if (!schema.items) {
        return [];
    }

    const nodeId = `${parentKey}[]`;
    const children = buildTreeData(schema.items as JSONSchema4, rootSchema, intl, equipmentType, nodeId, registry);

    // Add length counter for arrays
    const lengthNode = createLengthNode(parentKey, intl);

    return [...children, lengthNode];
}

/**
 * Main function to build a tree data structure from a JSON Schema.
 * Recursively processes the schema and creates a hierarchical tree of selectable properties.
 *
 * The function handles:
 * - $ref resolution
 * - Array types with element counting
 * - Object properties with nested children
 * - Enum types
 * - Additional properties
 * - Equipment-specific filtering
 *
 * @param schema - Current JSON Schema to process (can be null)
 * @param rootSchema - Root schema for $ref resolution (can be null)
 * @param intl - Internationalization formatter for labels (can be null)
 * @param equipmentType - Type of spreadsheet equipment for filtering rules
 * @param parentKey - Current path in the schema tree (used for building IDs)
 * @param registry - Cache of schemas by ID for $ref resolution (auto-initialized on first call)
 * @returns Array of TreeNode objects representing the schema structure
 *
 * @example
 * const tree = buildTreeData(schema, schema, intl, SpreadsheetEquipmentType.LINE);
 */
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

    // Initialize schema registry on first call (root level)
    if (!registry) {
        registry = new Map();
        collectSchemas(rootSchema, registry);
    }

    // Handle $ref references by resolving and recursing
    if (schema.$ref) {
        const resolved = resolveRef(schema.$ref, registry);
        if (!resolved) {
            console.warn(`Unresolved $ref during json schema parsing: ${schema.$ref}`);
            return [];
        }
        return buildTreeData(resolved, rootSchema, intl, equipmentType, parentKey, registry);
    }

    // Handle array types
    if (schema.type?.includes('array') && schema.items && intl) {
        return buildArrayNodes(schema, rootSchema, intl, equipmentType, parentKey, registry);
    }

    // Handle additionalProperties (maps/dictionaries)
    if (schema.additionalProperties) {
        return buildTreeData(
            schema.additionalProperties as JSONSchema4,
            rootSchema,
            intl,
            equipmentType,
            parentKey,
            registry
        );
    }

    // Handle object types with properties
    if (schema.type === 'object' || schema.properties) {
        return buildObjectPropertyNodes(schema, rootSchema, intl, equipmentType, parentKey, registry);
    }

    return [];
}
