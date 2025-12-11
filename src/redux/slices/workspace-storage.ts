/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { object, string, number, boolean, array, mixed } from 'yup';
import yup from '../../components/utils/yup-config';
import { PanelType, type WorkspacesState } from '../../components/workspace/types/workspace.types';

const STORAGE_KEY_PREFIX = 'gridstudy-workspaces';

const getStorageKey = (studyUuid: string | null) =>
    studyUuid ? `${STORAGE_KEY_PREFIX}-${studyUuid}` : STORAGE_KEY_PREFIX;

// Yup schemas for validation
const panelPositionSchema = object({
    x: number().required(),
    y: number().required(),
}).required();

const panelSizeSchema = object({
    width: number().required(),
    height: number().required(),
}).required();

const optionalPanelPositionSchema = object({
    x: number().notRequired(),
    y: number().notRequired(),
});

const optionalPanelSizeSchema = object({
    width: number().notRequired(),
    height: number().notRequired(),
});

const sldMetadataSchema = object({
    diagramId: string().required(),
    navigationHistory: array(string()).optional(),
});

const nadMetadataSchema = object({
    nadConfigUuid: string().optional(),
    filterUuid: string().optional(),
    savedWorkspaceConfigUuid: string().optional(),
});

const panelMetadataSchema = yup.lazy((value) => {
    if (!value) {
        return object({}).optional();
    }
    if ('diagramId' in value) {
        return sldMetadataSchema;
    }
    if ('nadConfigUuid' in value || 'filterUuid' in value || 'savedWorkspaceConfigUuid' in value) {
        return nadMetadataSchema;
    }
    return object({}).optional();
});

const panelStateSchema = object({
    id: string().required(),
    type: mixed<PanelType>().oneOf(Object.values(PanelType)).required(),
    title: string().required(),
    metadata: panelMetadataSchema.optional(),
    position: panelPositionSchema,
    size: panelSizeSchema,
    zIndex: number().required(),
    isMinimized: boolean().required(),
    isMaximized: boolean().required(),
    isPinned: boolean().default(false),
    isClosed: boolean().default(false),
    restorePosition: optionalPanelPositionSchema.notRequired(),
    restoreSize: optionalPanelSizeSchema.notRequired(),
}).required();

const workspaceSchema = object({
    id: string().required(),
    name: string().required(),
    panels: yup.lazy((obj) => object(Object.fromEntries(Object.keys(obj || {}).map((key) => [key, panelStateSchema])))),
    focusedPanelId: string().nullable().notRequired(),
    nextZIndex: number().required(),
}).required();

const workspacesStateSchema = object({
    workspaces: array().of(workspaceSchema).required(),
    activeWorkspaceId: string().required(),
}).required();

// Validates if panel values are in the expected relative format (0-1)
const hasValidRelativeValues = (data: any): boolean => {
    try {
        for (const workspace of data.workspaces || []) {
            for (const panel of Object.values(workspace.panels || {})) {
                const p = panel as any;
                // Check if any position/size value is > 1 (likely old pixel format)
                if (p?.position?.x > 1 || p?.position?.y > 1 || p?.size?.width > 1 || p?.size?.height > 1) {
                    return false;
                }
            }
        }
        return true;
    } catch {
        return false;
    }
};

export const loadWorkspacesFromStorage = (studyUuid: string | null): Partial<WorkspacesState> | null => {
    try {
        const key = getStorageKey(studyUuid);
        const data = localStorage.getItem(key);
        if (!data) {
            return null;
        }

        const parsedData = JSON.parse(data);

        // If data has old pixel-based values, clear it and return null to use defaults
        if (!hasValidRelativeValues(parsedData)) {
            console.warn('Detected old pixel-based workspace layout. Resetting to defaults.');
            localStorage.removeItem(key);
            return null;
        }

        const validatedData = workspacesStateSchema.validateSync(parsedData) as WorkspacesState;
        return validatedData;
    } catch (error) {
        console.error('Failed to load or validate workspaces from storage - Local storage has been cleared:', error);
        // Clear invalid data to prevent future errors
        try {
            const key = getStorageKey(studyUuid);
            localStorage.removeItem(key);
        } catch (clearError) {
            console.warn('Failed to clear invalid workspace data:', clearError);
        }
        return null;
    }
};

export const saveWorkspacesToStorage = (state: WorkspacesState, studyUuid: string | null) => {
    try {
        const key = getStorageKey(studyUuid);
        localStorage.setItem(
            key,
            JSON.stringify({
                workspaces: state.workspaces,
                activeWorkspaceId: state.activeWorkspaceId,
            })
        );
    } catch (error) {
        console.warn('Failed to save workspaces to storage:', error);
    }
};
