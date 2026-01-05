/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { updatePanels, deletePanels, setFocusedPanelId } from '../../../redux/slices/workspace-slice';
import { selectFocusedPanelId, selectPanels, selectActiveWorkspaceId } from '../../../redux/slices/workspace-selectors';
import { PanelType } from '../types/workspace.types';
import { syncPanels as syncPanelsAPI, deletePanels as deletePanelsAPI } from '../../../services/study/workspace';
import type {
    PanelState,
    NADPanel,
    SLDVoltageLevelPanel,
    SLDSubstationPanel,
    SpreadsheetPanel,
} from '../types/workspace.types';
import { getPanelConfig, SLD_MAX_NAVIGATION_HISTORY } from '../constants/workspace.constants';
import type { AppDispatch } from '../../../redux/store';
import { EquipmentType } from '@gridsuite/commons-ui';
import { NAD_SLD_CONSTANTS } from '../panel-contents/diagrams/nad/constants';
import { AppState } from 'redux/reducer';

const getDefaultAssociatedSldPositionAndSize = () => ({
    position: {
        x: NAD_SLD_CONSTANTS.CASCADE_START_X,
        y: 1 - NAD_SLD_CONSTANTS.PANEL_DEFAULT_HEIGHT,
    },
    size: {
        width: NAD_SLD_CONSTANTS.PANEL_DEFAULT_WIDTH,
        height: NAD_SLD_CONSTANTS.PANEL_DEFAULT_HEIGHT,
    },
});

const isSLDPanel = (panel: PanelState): panel is SLDVoltageLevelPanel | SLDSubstationPanel =>
    panel.type === PanelType.SLD_VOLTAGE_LEVEL || panel.type === PanelType.SLD_SUBSTATION;

const isNADPanel = (panel: PanelState): panel is NADPanel => panel.type === PanelType.NAD;

const createPanelBase = (panelType: PanelType) => {
    const config = getPanelConfig(panelType);
    return {
        id: uuidv4() as UUID,
        position: config.defaultPosition,
        size: config.defaultSize,
        isMinimized: false,
        isMaximized: false,
        isPinned: false,
    };
};

const findExistingSLD = (panels: PanelState[], diagramId: string) => {
    return panels.find(
        (p) =>
            isSLDPanel(p) && p.diagramId === diagramId && (p.type === PanelType.SLD_SUBSTATION || !p.parentNadPanelId)
    );
};

const findPanelByType = (panels: PanelState[], panelType: PanelType) => {
    return panels.find((p) => p.type === panelType);
};

const findPanelById = (panels: PanelState[], panelId: UUID) => {
    return panels.find((p) => p.id === panelId);
};

const getAssociatedSldIds = (panels: PanelState[], nadPanelId: UUID): UUID[] => {
    const associatedPanels = panels.filter(
        (p) => p.type === PanelType.SLD_VOLTAGE_LEVEL && p.parentNadPanelId === nadPanelId
    );
    return associatedPanels.map((p) => p.id);
};

export const useWorkspaceActions = () => {
    const dispatch = useDispatch<AppDispatch>();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const workspaceId = useSelector(selectActiveWorkspaceId);

    return useMemo(() => {
        // Helper functions to sync with backend
        const syncToBackend = async (panels: PanelState[]) => {
            if (!workspaceId) return;
            try {
                await syncPanelsAPI(studyUuid as UUID, workspaceId, panels);
            } catch (error) {
                console.error('Failed to sync panels to backend:', error);
            }
        };

        const deleteFromBackend = async (panelIds: UUID[]) => {
            if (!workspaceId) return;
            try {
                await deletePanelsAPI(studyUuid as UUID, workspaceId, panelIds);
            } catch (error) {
                console.error('Failed to delete panels from backend:', error);
            }
        };
        // Helper to focus a panel by bumping its zIndex
        const doFocusPanel = (panelId: UUID) =>
            dispatch((dispatch, getState) => {
                const state = getState();
                const panels = selectPanels(state);
                const panel = findPanelById(panels, panelId);
                if (panel) {
                    const nextZ = state.workspace.nextZIndex;
                    dispatch(updatePanels([{ ...panel, zIndex: nextZ }]));
                    dispatch(setFocusedPanelId(panelId));
                }
            });

        return {
            openSLD: ({
                id,
                panelType,
            }: {
                id: string;
                panelType: PanelType.SLD_VOLTAGE_LEVEL | PanelType.SLD_SUBSTATION;
            }) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const existing = findExistingSLD(panels, id);

                    if (existing) {
                        const updated = { ...existing, isMinimized: false };
                        dispatch(updatePanels([updated]));
                        doFocusPanel(existing.id);
                        syncToBackend([updated]);
                    } else {
                        const newPanel: SLDVoltageLevelPanel | SLDSubstationPanel =
                            panelType === PanelType.SLD_VOLTAGE_LEVEL
                                ? {
                                      ...createPanelBase(panelType),
                                      type: panelType,
                                      title: id,
                                      diagramId: id,
                                      parentNadPanelId: undefined,
                                      navigationHistory: [],
                                  }
                                : {
                                      ...createPanelBase(panelType),
                                      type: panelType,
                                      title: id,
                                      diagramId: id,
                                  };
                        dispatch(updatePanels([newPanel]));
                        doFocusPanel(newPanel.id);
                        syncToBackend([newPanel]);
                    }
                }),

            openNAD: ({
                name,
                nadConfigUuid,
                filterUuid,
                initialVoltageLevelIds,
            }: {
                name?: string;
                nadConfigUuid?: UUID;
                filterUuid?: UUID;
                initialVoltageLevelIds?: string[];
            }) =>
                dispatch((dispatch, _getState) => {
                    const config = getPanelConfig(PanelType.NAD);
                    const panelId = uuidv4() as UUID;

                    const newPanel: NADPanel = {
                        ...createPanelBase(PanelType.NAD),
                        id: panelId,
                        type: PanelType.NAD,
                        title: name || config.title,
                        nadConfigUuid,
                        filterUuid,
                        currentFilterUuid: filterUuid,
                        navigationHistory: [],
                        initialVoltageLevelIds, // Store in panel for initial diagram load
                    };
                    dispatch(updatePanels([newPanel]));
                    doFocusPanel(newPanel.id);
                }),

            togglePanel: (panelType: PanelType) =>
                dispatch((dispatch, getState) => {
                    const state = getState();
                    const panels = selectPanels(state);
                    const focusedPanelId = selectFocusedPanelId(state);
                    const existing = findPanelByType(panels, panelType);

                    if (existing) {
                        if (existing.isMinimized) {
                            // If minimized, restore and focus
                            const updated = { ...existing, isMinimized: false };
                            dispatch(updatePanels([updated]));
                            doFocusPanel(existing.id);
                            syncToBackend([updated]);
                        } else if (focusedPanelId === existing.id) {
                            // If already focused, minimize it
                            const updated = { ...existing, isMinimized: true };
                            dispatch(updatePanels([updated]));
                            syncToBackend([updated]);
                        } else {
                            // If not focused, just focus it (zIndex change only, no sync needed)
                            doFocusPanel(existing.id);
                        }
                    } else {
                        // Create new panel and focus
                        const config = getPanelConfig(panelType);
                        const newPanel: PanelState = {
                            ...createPanelBase(panelType),
                            type: panelType,
                            title: config.title,
                        } as PanelState;
                        dispatch(updatePanels([newPanel]));
                        doFocusPanel(newPanel.id);
                        syncToBackend([newPanel]);
                    }
                }),
            deletePanel: (panelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (!panel) return;

                    const toDelete = [panelId];

                    // If deleting NAD, also delete associated SLDs
                    if (panel.type === PanelType.NAD) {
                        const associatedSldIds = getAssociatedSldIds(panels, panelId);
                        toDelete.push(...associatedSldIds);
                    }

                    dispatch(deletePanels(toDelete));
                    deleteFromBackend(toDelete);
                }),

            deletePanels: (panelIds: UUID[]) =>
                dispatch((dispatch) => {
                    dispatch(deletePanels(panelIds));
                    deleteFromBackend(panelIds);
                }),

            focusPanel: doFocusPanel,

            updatePanelGeometry: (
                panelId: UUID,
                updates: {
                    position?: { x: number; y: number };
                    size?: { width: number; height: number };
                },
                skipBackendSync?: boolean
            ) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (!panel) return;

                    const updated = { ...panel, ...updates };
                    dispatch(updatePanels([updated]));
                    if (!skipBackendSync) {
                        syncToBackend([updated]);
                    }
                }),

            toggleMinimize: (panelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (!panel) return;

                    const updated = { ...panel, isMinimized: !panel.isMinimized };
                    dispatch(updatePanels([updated]));
                    syncToBackend([updated]);
                }),

            minimizePanels: (panelIds: UUID[]) =>
                dispatch((dispatch, getState) => {
                    if (panelIds.length === 0) return;

                    const panels = selectPanels(getState());
                    const panelsToUpdate: PanelState[] = [];

                    for (const panelId of panelIds) {
                        const panel = findPanelById(panels, panelId);
                        if (panel && !panel.isMinimized) {
                            panelsToUpdate.push({ ...panel, isMinimized: true });
                        }
                    }

                    if (panelsToUpdate.length > 0) {
                        dispatch(updatePanels(panelsToUpdate));
                        syncToBackend(panelsToUpdate);
                    }
                }),

            toggleMaximize: (panelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (!panel) return;

                    let updated: PanelState;
                    if (panel.isMaximized) {
                        // Restore to previous size/position
                        updated = {
                            ...panel,
                            isMaximized: false,
                            position: panel.restorePosition || panel.position,
                            size: panel.restoreSize || panel.size,
                            restorePosition: undefined,
                            restoreSize: undefined,
                        };
                        dispatch(updatePanels([updated]));
                        syncToBackend([updated]);
                    } else {
                        // Maximize and save current position/size
                        updated = {
                            ...panel,
                            isMaximized: true,
                            restorePosition: panel.position,
                            restoreSize: panel.size,
                        };
                        dispatch(updatePanels([updated]));
                        syncToBackend([updated]);
                    }
                }),

            togglePin: (panelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (!panel) return;

                    const updated = { ...panel, isPinned: !panel.isPinned };
                    dispatch(updatePanels([updated]));
                    syncToBackend([updated]);
                }),

            openPanel: (panelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (!panel) return;

                    const updated = { ...panel, isMinimized: false };
                    dispatch(updatePanels([updated]));
                    syncToBackend([updated]);
                }),

            openSldAndAssociateToNad: ({ voltageLevelId, nadPanelId }: { voltageLevelId: string; nadPanelId: UUID }) =>
                dispatch((dispatch, _getState) => {
                    const newPanel: SLDVoltageLevelPanel = {
                        ...createPanelBase(PanelType.SLD_VOLTAGE_LEVEL),
                        type: PanelType.SLD_VOLTAGE_LEVEL,
                        title: voltageLevelId,
                        diagramId: voltageLevelId,
                        parentNadPanelId: nadPanelId,
                        navigationHistory: [],
                        ...getDefaultAssociatedSldPositionAndSize(),
                    };
                    dispatch(updatePanels([newPanel]));
                    syncToBackend([newPanel]);
                }),

            associateSldToNad: ({ sldPanelId, nadPanelId }: { sldPanelId: UUID; nadPanelId: UUID }) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const sldPanel = findPanelById(panels, sldPanelId);
                    if (!sldPanel || sldPanel.type !== PanelType.SLD_VOLTAGE_LEVEL) return;

                    const updated = {
                        ...sldPanel,
                        ...getDefaultAssociatedSldPositionAndSize(),
                        parentNadPanelId: nadPanelId,
                    };
                    dispatch(updatePanels([updated]));
                    doFocusPanel(nadPanelId);
                    syncToBackend([updated]);
                }),

            dissociateSldFromNad: (sldPanelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const sldPanel = findPanelById(panels, sldPanelId);
                    if (!sldPanel || sldPanel.type !== PanelType.SLD_VOLTAGE_LEVEL) return;

                    const updated = { ...sldPanel, parentNadPanelId: undefined };
                    dispatch(updatePanels([updated]));
                    doFocusPanel(sldPanelId);
                    syncToBackend([updated]);
                }),

            createNadAndAssociateSld: ({
                sldPanelId,
                voltageLevelId,
                voltageLevelName,
            }: {
                sldPanelId: UUID;
                voltageLevelId: string;
                voltageLevelName?: string;
            }) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const config = getPanelConfig(PanelType.NAD);
                    const panelId = uuidv4() as UUID;

                    const sldPanel = findPanelById(panels, sldPanelId);
                    if (!sldPanel || sldPanel.type !== PanelType.SLD_VOLTAGE_LEVEL) return;

                    const newNadPanel: NADPanel = {
                        ...createPanelBase(PanelType.NAD),
                        id: panelId,
                        type: PanelType.NAD,
                        title: voltageLevelName || config.title,
                        initialVoltageLevelIds: [voltageLevelId],
                        size: sldPanel.size,
                        position: sldPanel.position,
                    };

                    const updatedSld = {
                        ...sldPanel,
                        ...getDefaultAssociatedSldPositionAndSize(),
                        parentNadPanelId: newNadPanel.id,
                    };

                    dispatch(updatePanels([newNadPanel, updatedSld]));
                    doFocusPanel(newNadPanel.id);
                    syncToBackend([updatedSld]);
                }),

            navigateSLD: ({
                panelId,
                voltageLevelId,
                skipHistory = false,
            }: {
                panelId: UUID;
                voltageLevelId: string;
                skipHistory?: boolean;
            }) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (!panel || panel.type !== PanelType.SLD_VOLTAGE_LEVEL) return;

                    const history = panel.navigationHistory || [];

                    // Add current voltage level to history if:
                    // 1. Not skipping history (navigating from history itself)
                    // 2. Navigating to a different voltage level
                    // 3. Current voltage level is not already at the first position in history
                    const shouldAddToHistory =
                        !skipHistory && panel.diagramId !== voltageLevelId && history[0] !== panel.diagramId;

                    const updatedHistory = shouldAddToHistory
                        ? [panel.diagramId, ...history].slice(0, SLD_MAX_NAVIGATION_HISTORY)
                        : history;

                    const updated = {
                        ...panel,
                        diagramId: voltageLevelId,
                        title: voltageLevelId,
                        navigationHistory: updatedHistory,
                    };

                    dispatch(updatePanels([updated]));
                    syncToBackend([updated]);
                }),

            addToNadNavigationHistory: ({ panelId, voltageLevelId }: { panelId: UUID; voltageLevelId: string }) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const nadPanel = findPanelById(panels, panelId);
                    if (!nadPanel || !isNADPanel(nadPanel)) return;

                    const currentHistory = nadPanel.navigationHistory || [];
                    const newHistory = [...currentHistory, voltageLevelId];
                    dispatch(updatePanels([{ ...nadPanel, navigationHistory: newHistory }]));
                }),

            showInSpreadsheet: ({
                equipmentId,
                equipmentType,
            }: {
                equipmentId: string;
                equipmentType: EquipmentType;
            }) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const spreadsheetPanel = findPanelByType(panels, PanelType.SPREADSHEET) as
                        | SpreadsheetPanel
                        | undefined;

                    if (spreadsheetPanel) {
                        // Store target equipment in panel and restore if minimized
                        const updatedPanel: SpreadsheetPanel = {
                            ...spreadsheetPanel,
                            targetEquipmentId: equipmentId,
                            targetEquipmentType: equipmentType,
                            isMinimized: false,
                        };
                        dispatch(updatePanels([updatedPanel]));
                        doFocusPanel(spreadsheetPanel.id);
                        syncToBackend([updatedPanel]);
                    } else {
                        const panelId = uuidv4() as UUID;
                        const newPanel: SpreadsheetPanel = {
                            ...createPanelBase(PanelType.SPREADSHEET),
                            id: panelId,
                            type: PanelType.SPREADSHEET,
                            title: 'Spreadsheet',
                            targetEquipmentId: equipmentId,
                            targetEquipmentType: equipmentType,
                        };
                        dispatch(updatePanels([newPanel]));
                        doFocusPanel(panelId);
                        syncToBackend([newPanel]);
                    }
                }),

            openSLDPanels: (panelIds: UUID[]) =>
                dispatch((dispatch, getState) => {
                    if (panelIds.length === 0) return;

                    const panels = selectPanels(getState());
                    const panelsToUpdate: PanelState[] = [];

                    for (const panelId of panelIds) {
                        const panel = findPanelById(panels, panelId);
                        if (panel?.isMinimized) {
                            panelsToUpdate.push({ ...panel, isMinimized: false });
                        }
                    }

                    if (panelsToUpdate.length > 0) {
                        dispatch(updatePanels(panelsToUpdate));
                        doFocusPanel(panelsToUpdate[0].id);
                    }
                }),
            updateZIndexOnly: (panelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const state = getState();
                    const panels = selectPanels(state);
                    const panel = findPanelById(panels, panelId);
                    if (panel) {
                        const nextZ = state.workspace.nextZIndex;
                        dispatch(updatePanels([{ ...panel, zIndex: nextZ }]));
                    }
                }),

            clearTargetEquipment: (panelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (panel && panel.type === PanelType.SPREADSHEET) {
                        const updated = {
                            ...panel,
                            targetEquipmentId: undefined,
                            targetEquipmentType: undefined,
                        };
                        dispatch(updatePanels([updated]));
                        syncToBackend([updated]);
                    }
                }),

            updateNADFields: ({
                panelId,
                fields,
            }: {
                panelId: UUID;
                fields: Partial<
                    Pick<
                        NADPanel,
                        | 'voltageLevelToOmitIds'
                        | 'initialVoltageLevelIds'
                        | 'currentFilterUuid'
                        | 'title'
                        | 'nadConfigUuid'
                        | 'filterUuid'
                        | 'savedWorkspaceConfigUuid'
                    >
                >;
            }) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (panel && isNADPanel(panel)) {
                        const updated = { ...panel, ...fields };
                        dispatch(updatePanels([updated]));
                        syncToBackend([updated]);
                    }
                }),
        };
    }, [dispatch, studyUuid, workspaceId]);
};
