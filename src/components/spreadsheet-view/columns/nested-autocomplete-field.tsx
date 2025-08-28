/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Popover, Slide, Tooltip } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { UseFormReturn } from 'react-hook-form';
import { FORMULA } from './column-creation-form';
import Button from '@mui/material/Button';
import LoupeIcon from '@mui/icons-material/Loupe';
import { fetchSpreadsheetEquipmentTypeSchema } from '../../../services/study/network';
import { SpreadsheetEquipmentType } from '../types/spreadsheet.type';
import { JSONSchema7 } from 'json-schema';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import NumbersIcon from '@mui/icons-material/Numbers';
import ToggleOnIcon from '@mui/icons-material/ToggleOn'; // boolean
import DataObjectIcon from '@mui/icons-material/DataObject';
import DataArrayIcon from '@mui/icons-material/DataArray';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TextField from '@mui/material/TextField';

interface FormulaAutocompleteFieldProps {
    children: ReactNode;
    formMethods: UseFormReturn<any>;
    spreadsheetEquipmentType: SpreadsheetEquipmentType;
}

type TreeNode = {
    id: string;
    label: string;
    type?: string;
    children?: TreeNode[];
};

type TreeLabelProps = {
    text: string;
    type?: string;
};

function TreeLabel({ text, type }: TreeLabelProps) {
    let icon: ReactNode;
    switch (type) {
        case 'string':
            icon = <FormatColorTextIcon fontSize="small" />;
            break;
        case 'number':
        case 'integer':
            icon = <NumbersIcon fontSize="small" />;
            break;
        case 'boolean':
            icon = <ToggleOnIcon fontSize="small" />;
            break;
        case 'object':
            icon = <DataObjectIcon fontSize="small" />;
            break;
        case 'array':
            icon = <DataArrayIcon fontSize="small" />;
            break;
        case 'enum':
            icon = <FormatListBulletedIcon fontSize="small" />;
            break;
        default:
            icon = null;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span>{text}</span>
            {icon && <span>{icon}</span>}
        </div>
    );
}

export function NestedAutocompleteField({
    children,
    formMethods,
    spreadsheetEquipmentType,
}: Readonly<FormulaAutocompleteFieldProps>) {
    const lastShiftTime = useRef(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [pendingSelection, setPendingSelection] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const open = Boolean(anchorEl);

    const { setValue, getValues } = formMethods;
    const [properties, setProperties] = useState<JSONSchema7 | null>(null);

    function resolveRef(ref: string, rootSchema: JSONSchema7): JSONSchema7 | null {
        if (!ref.startsWith('#/$defs/')) {
            return null;
        }
        const defKey = ref.replace('#/$defs/', '');
        return rootSchema.$defs?.[defKey] as JSONSchema7;
    }

    function buildTreeData(
        schema: JSONSchema7 | null,
        rootSchema: JSONSchema7 | null,
        parentKey: string = ''
    ): TreeNode[] {
        if (!schema || !rootSchema) {
            return [];
        }

        // --- Handle $ref
        if (schema.$ref) {
            const resolved = resolveRef(schema.$ref, rootSchema);
            if (resolved) {
                return buildTreeData(resolved, rootSchema, parentKey);
            }
        }

        // --- Handle anyOf
        if (schema.anyOf) {
            return schema.anyOf.flatMap((subSchema) => buildTreeData(subSchema as JSONSchema7, rootSchema, parentKey));
        }

        // --- Handle oneOf
        if (schema.oneOf) {
            return schema.oneOf.flatMap((subSchema) => buildTreeData(subSchema as JSONSchema7, rootSchema, parentKey));
        }

        // --- Handle arrays
        if (schema.type?.includes('array') && schema.items) {
            return buildTreeData(schema.items as JSONSchema7, rootSchema, `${parentKey}[]`);
        }

        // --- Handle map type
        if (schema.additionalProperties) {
            if ((schema.additionalProperties as JSONSchema7).$ref) {
                return buildTreeData(schema.additionalProperties as JSONSchema7, rootSchema, parentKey);
            }
        }

        // --- Handle enums (leaf node)
        if (schema.enum) {
            return [
                {
                    id: parentKey,
                    label: parentKey,
                    type: 'enum',
                },
            ];
        }

        // --- Handle objects with properties
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
                // Normal property (object, string, etc.)
                let type: (string | undefined)[] = Array.isArray(childSchema.type)
                    ? Object.values(childSchema.type).filter((t) => t !== 'null')
                    : [childSchema.type];

                type = type.filter(Boolean);
/*                if (type.includes('array')) {
                    nodeId += '[]';
                }*/
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

    function renderTreeData(nodes: TreeNode[]): React.ReactNode {
        return nodes.map((node) => (
            <TreeItem key={node.id} itemId={node.id} label={<TreeLabel text={node.label} type={node.type} />}>
                {node.children && renderTreeData(node.children)}
            </TreeItem>
        ));
    }

    const treeData = useMemo(() => buildTreeData(properties, properties), [buildTreeData, properties]);

    // --- filter function that keeps parent chain if a child matches
    function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
        if (!query) {
            return nodes;
        }
        return nodes
            .map((node) => {
                const match = node.label.toLowerCase().includes(query.toLowerCase());
                const filteredChildren = node.children ? filterTree(node.children, query) : [];
                if (match || filteredChildren.length > 0) {
                    return {
                        ...node,
                        children: filteredChildren,
                    };
                }
                return null;
            })
            .filter(Boolean) as TreeNode[];
    }

    const filteredTreeData = useMemo(() => filterTree(treeData, filter), [filter, filterTree, treeData]);

    useEffect(() => {
        fetchSpreadsheetEquipmentTypeSchema(spreadsheetEquipmentType).then((result) => setProperties(result));
    }, [spreadsheetEquipmentType]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (properties !== null) {
            const now = Date.now();
            if (e.key === 'Shift' && now - lastShiftTime.current < 300) {
                setAnchorEl(e.currentTarget.parentElement?.parentElement as HTMLElement);
            }
            if (e.key === 'Shift') {
                lastShiftTime.current = now;
            }
            if (e.code === 'Escape') {
                setAnchorEl(null);
            }
        }
    };

    const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (properties !== null) {
            const now = Date.now();
            if (e.key === 'Shift' && now - lastShiftTime.current < 300) {
                setAnchorEl(null);
            }
            if (e.key === 'Shift') {
                lastShiftTime.current = now;
            }
            if (e.code === 'Escape') {
                setAnchorEl(null);
            }
        }
    };

    const handleTreeviewKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        e.preventDefault();
        if (e.key === 'Enter') {
            handleConfirm();
        }
    };

    const handleConfirm = () => {
        if (pendingSelection) {
            const newValue = getValues(FORMULA) ? `${getValues(FORMULA)}${pendingSelection}` : pendingSelection;
            setValue(FORMULA, newValue, { shouldValidate: true });
        }
        setPendingSelection(null);
        setAnchorEl(null);
    };
    const filterInputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Box onKeyDown={handleKeyDown} sx={{ position: 'relative' }}>
                {children}
                <Tooltip
                    title={
                        "Ouvre la liste des champs disponibles pour l'équipement associé à la feuille, peut également être ouverte via une double pression de la touche Shift du clavier"
                    }
                >
                    <span>
                        <Button
                            sx={{ position: 'absolute', right: '-5vh', top: 0 }}
                            onClick={(e) =>
                                setAnchorEl(
                                    e.currentTarget.parentElement?.parentElement?.parentElement
                                        ?.parentElement as HTMLElement
                                )
                            }
                            disabled={properties === null}
                        >
                            <LoupeIcon />
                        </Button>
                    </span>
                </Tooltip>
            </Box>
            <Popover
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                TransitionComponent={Slide}
                TransitionProps={{
                    mountOnEnter: true,
                    onEntered: () => {
                        filterInputRef.current?.focus();
                    },
                }}
                sx={{ position: 'absolute', left: '5vh', maxHeight: '60vh' }}
            >
                <Box sx={{ p: 1 }}>
                    <TextField
                        key="tree-filter" // stable key
                        size="small"
                        placeholder="Filter fields..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        fullWidth
                        inputRef={filterInputRef}
                        onKeyDown={handleFilterKeyDown}
                    />
                </Box>
                <Box sx={{ flex: 1, overflow: 'auto', maxHeight: '45vh', px: 1 }} onKeyDown={handleFilterKeyDown}>
                    <SimpleTreeView
                        onKeyDown={handleTreeviewKeyDown}
                        onSelectedItemsChange={(event, itemIds) => {
                            const lastId = Array.isArray(itemIds) ? itemIds[itemIds.length - 1] : itemIds;
                            setPendingSelection(lastId);
                        }}
                        slots={{
                            expandIcon: ChevronRight,
                            collapseIcon: ExpandMore,
                        }}
                    >
                        {renderTreeData(filteredTreeData)}
                    </SimpleTreeView>
                </Box>
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Button variant="contained" size="small" disabled={!pendingSelection} onClick={handleConfirm}>
                        Insert
                    </Button>
                </Box>
            </Popover>
        </>
    );
}
