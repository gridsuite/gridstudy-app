/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { getStudyUrl } from './index';
import type { PanelState } from '../../components/workspace/types/workspace.types';
import { getClientId } from '../../utils/client-id';
import type { DiagramConfigPosition } from '../explore';

interface WorkspaceDTO {
    id: UUID;
    name: string;
    panels: PanelState[];
}

export interface WorkspaceMetadata {
    id: UUID;
    name: string;
}

export function getWorkspace(studyUuid: UUID, workspaceId: UUID): Promise<WorkspaceDTO> {
    console.info('get workspace');
    const url = `${getStudyUrl(studyUuid)}/workspaces/${workspaceId}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function getWorkspacesMetadata(studyUuid: UUID): Promise<WorkspaceMetadata[]> {
    console.info('get workspaces metadata');
    const url = `${getStudyUrl(studyUuid)}/workspaces`;
    console.debug(url);
    return backendFetchJson(url);
}

export function renameWorkspace(studyUuid: UUID, workspaceId: UUID, name: string): Promise<void> {
    console.info('rename workspace');
    const url = `${getStudyUrl(studyUuid)}/workspaces/${workspaceId}/name`;
    console.debug(url);
    return backendFetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/plain',
            clientId: getClientId(),
        },
        body: name,
    }).then(() => {});
}

export function updatePanels(studyUuid: UUID, workspaceId: UUID, panels: PanelState[]): Promise<void> {
    console.info('update panels');
    const url = `${getStudyUrl(studyUuid)}/workspaces/${workspaceId}/panels`;
    console.debug(url);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            clientId: getClientId(),
        },
        body: JSON.stringify(panels),
    }).then(() => {});
}

export function deletePanels(studyUuid: UUID, workspaceId: UUID, panelIds?: UUID[]): Promise<void> {
    console.info('delete panels');
    const url = `${getStudyUrl(studyUuid)}/workspaces/${workspaceId}/panels`;
    console.debug(url);

    return backendFetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            clientId: getClientId(),
        },
        body: panelIds ? JSON.stringify(panelIds) : undefined,
    }).then(() => {});
}

export function getPanels(studyUuid: UUID, workspaceId: UUID, panelIds?: UUID[]): Promise<PanelState[]> {
    console.info('fetch panels');
    const urlSearchParams = new URLSearchParams();
    panelIds?.forEach((id) => urlSearchParams.append('panelIds', id));
    const queryString = urlSearchParams.toString();
    const baseUrl = `${getStudyUrl(studyUuid)}/workspaces/${workspaceId}/panels`;
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    console.debug(url);
    return backendFetchJson(url);
}

export function saveNadConfig(
    studyUuid: UUID,
    workspaceId: UUID,
    panelId: UUID,
    config: {
        id?: UUID | null;
        scalingFactor?: number;
        voltageLevelIds: string[];
        positions: DiagramConfigPosition[];
    }
): Promise<UUID> {
    console.info('save NAD config');
    const url = `${getStudyUrl(studyUuid)}/workspaces/${workspaceId}/panels/${panelId}/current-nad-config`;
    console.debug(url);
    return backendFetchJson(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            clientId: getClientId(),
        },
        body: JSON.stringify(config),
    });
}

export function deleteNadConfig(studyUuid: UUID, workspaceId: UUID, panelId: UUID): Promise<void> {
    console.info('delete NAD config');
    const url = `${getStudyUrl(studyUuid)}/workspaces/${workspaceId}/panels/${panelId}/current-nad-config`;
    console.debug(url);
    return backendFetch(url, {
        method: 'DELETE',
        headers: {
            clientId: getClientId(),
        },
    }).then(() => {});
}
