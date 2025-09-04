/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { JSONSchema4 } from 'json-schema';

export type TreeNode = {
    id: string;
    label: string;
    type?: string;
    children?: TreeNode[];
};

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
        Object.values(schema.properties).forEach((v) => collectSchemas(v as JSONSchema4, registry));
    }

    if (schema.items) {
        if (Array.isArray(schema.items)) {
            schema.items.forEach((s) => collectSchemas(s as JSONSchema4, registry));
        } else {
            collectSchemas(schema.items as JSONSchema4, registry);
        }
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        collectSchemas(schema.additionalProperties as JSONSchema4, registry);
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
        return buildTreeData(resolved, rootSchema, parentKey, registry);
    }

    if (schema.type?.includes('array') && schema.items) {
        return buildTreeData(schema.items as JSONSchema4, rootSchema, `${parentKey}[]`);
    }

    if (schema.additionalProperties) {
        return buildTreeData(schema.additionalProperties as JSONSchema4, rootSchema, parentKey);
    }

    if (schema.type === 'object' || schema.properties) {
        return Object.entries(schema.properties ?? {}).map(([key, value]) => {
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
            return {
                id: nodeId,
                label: key,
                type: type.length > 0 ? type[0] : 'object',
                children: buildTreeData(childSchema, rootSchema, nodeId),
            };
        });
    }

    return [];
}
