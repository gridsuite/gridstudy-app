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

const sldMetadataSchema = object({
    diagramId: string().required(),
    navigationHistory: array(string()).optional(),
});

const nadMetadataSchema = object({
    nadConfigUuid: string().optional(),
    filterUuid: string().optional(),
    savedWorkspaceConfigUuid: string().optional(),
    initialVoltageLevelIds: array(string()).optional(),
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
    isPinned: boolean().required(),
    restorePosition: panelPositionSchema.optional(),
    restoreSize: panelSizeSchema.optional(),
}).required();

const workspaceSchema = object({
    id: string().required(),
    name: string().required(),
    panels: yup.lazy((obj) => object(Object.fromEntries(Object.keys(obj || {}).map((key) => [key, panelStateSchema])))),
    focusedPanelId: string().nullable().required(),
    nextZIndex: number().required(),
}).required();

const workspacesStateSchema = object({
    workspaces: yup.lazy((obj) =>
        object(Object.fromEntries(Object.keys(obj || {}).map((key) => [key, workspaceSchema])))
    ),
    activeWorkspaceId: string().required(),
}).required();

export const loadWorkspacesFromStorage = (studyUuid: string | null): Partial<WorkspacesState> | null => {
    try {
        const key = getStorageKey(studyUuid);
        const data = localStorage.getItem(key);
        if (!data) {
            return null;
        }

        const parsedData = JSON.parse(data);
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
