/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { JSONSchema7 } from 'json-schema';

export type TreeNode = {
    id: string;
    label: string;
    type?: string;
    children?: TreeNode[];
};

function resolveRef(ref: string, rootSchema: JSONSchema7): JSONSchema7 | null {
    if (!ref.startsWith('#/$defs/')) {
        return null;
    }
    const defKey = ref.replace('#/$defs/', '');
    return rootSchema.$defs?.[defKey] as JSONSchema7;
}

export function buildTreeData(
    schema: JSONSchema7 | null,
    rootSchema: JSONSchema7 | null,
    parentKey: string = ''
): TreeNode[] {
    if (!schema || !rootSchema) {
        return [];
    }

    if (schema.$ref) {
        const resolved = resolveRef(schema.$ref, rootSchema);
        if (resolved) {
            return buildTreeData(resolved, rootSchema, parentKey);
        }
    }

    if (schema.anyOf || schema.oneOf) {
        return flattenCombinedSchemas(schema, rootSchema, parentKey);
    }

    if (schema.type?.includes('array') && schema.items) {
        return buildTreeData(schema.items as JSONSchema7, rootSchema, `${parentKey}[]`);
    }

    if (schema.additionalProperties) {
        if ((schema.additionalProperties as JSONSchema7).$ref) {
            return buildTreeData(schema.additionalProperties as JSONSchema7, rootSchema, parentKey);
        }
    }

    if (schema.enum) {
        return [
            {
                id: parentKey,
                label: parentKey,
                type: 'enum',
            },
        ];
    }

    if (schema.type === 'object' || schema.properties) {
        return Object.entries(schema.properties ?? {}).map(([key, value]) => {
            const childSchema = value as JSONSchema7;
            let nodeId = parentKey ? `${parentKey}.${key}` : key;
            // Flatten case: anyOf with $ref to enum
            if (childSchema.anyOf) {
                const refSchema = childSchema.anyOf.find((s: any) => !!s.$ref) as JSONSchema7;
                if (refSchema?.$ref) {
                    const resolved = resolveRef(refSchema.$ref, rootSchema);
                    if (resolved?.enum) {
                        return {
                            id: nodeId,
                            label: key,
                            type: 'enum',
                        };
                    }
                }
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

function flattenCombinedSchemas(schema: JSONSchema7, rootSchema: JSONSchema7, parentKey: string): TreeNode[] {
    const schemas = schema.anyOf ?? schema.oneOf ?? [];
    return schemas.flatMap((s) => buildTreeData(s as JSONSchema7, rootSchema, parentKey));
}
