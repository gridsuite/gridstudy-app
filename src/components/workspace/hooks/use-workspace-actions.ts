/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { UUID } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { updatePanels, deletePanels } from '../../../redux/slices/workspace-slice';
import { setFocusedPanel, setTempData } from '../../../redux/slices/workspace-session-slice';
import { selectPanels } from '../../../redux/slices/workspace-selectors';
import { PanelType } from '../types/workspace.types';
import type { PanelState, NADPanel, SLDVoltageLevelPanel, SLDSubstationPanel } from '../types/workspace.types';
import { getPanelConfig } from '../constants/workspace.constants';
import type { AppDispatch } from '../../../redux/store';
import { EquipmentType } from '@gridsuite/commons-ui';

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
    return panels.find((p) => isSLDPanel(p) && p.diagramId === diagramId);
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

    return useMemo(() => {
        const updatePanelById = (panelId: UUID, updater: (panel: PanelState) => Partial<PanelState>) =>
            dispatch((dispatch, getState) => {
                const panels = selectPanels(getState());
                const panel = findPanelById(panels, panelId);
                if (!panel) return;

                dispatch(updatePanels([{ ...panel, ...updater(panel) } as PanelState]));
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
                        dispatch(updatePanels([{ ...existing, isMinimized: false }]));
                        dispatch(setFocusedPanel(existing.id));
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
                        dispatch(setFocusedPanel(newPanel.id));
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

                    // Store initialization data in session (temporary)
                    if (initialVoltageLevelIds) {
                        dispatch(setTempData({ panelId, data: { initialVoltageLevelIds } }));
                    }

                    const newPanel: NADPanel = {
                        ...createPanelBase(PanelType.NAD),
                        id: panelId,
                        type: PanelType.NAD,
                        title: name || config.title,
                        nadConfigUuid,
                        filterUuid,
                        currentFilterUuid: filterUuid,
                        navigationHistory: [],
                    };
                    dispatch(updatePanels([newPanel]));
                    dispatch(setFocusedPanel(newPanel.id));
                }),

            togglePanel: (panelType: PanelType) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const existing = findPanelByType(panels, panelType);

                    if (existing) {
                        dispatch(updatePanels([{ ...existing, isMinimized: !existing.isMinimized }]));
                        if (existing.isMinimized) {
                            dispatch(setFocusedPanel(existing.id));
                        }
                    } else {
                        const config = getPanelConfig(panelType);
                        const newPanel: PanelState = {
                            ...createPanelBase(panelType),
                            type: panelType,
                            title: config.title,
                        } as PanelState;
                        dispatch(updatePanels([newPanel]));
                        dispatch(setFocusedPanel(newPanel.id));
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
                }),

            deletePanels: (panelIds: UUID[]) => dispatch(deletePanels(panelIds)),

            focusPanel: (panelId: UUID) => dispatch(setFocusedPanel(panelId)),

            updatePanelGeometry: (
                panelId: UUID,
                updates: {
                    position?: { x: number; y: number };
                    size?: { width: number; height: number };
                }
            ) => updatePanelById(panelId, () => updates),

            toggleMinimize: (panelId: UUID) =>
                updatePanelById(panelId, (panel) => ({ isMinimized: !panel.isMinimized })),

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
                    }
                }),

            toggleMaximize: (panelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const panel = findPanelById(panels, panelId);
                    if (!panel) return;

                    if (panel.isMaximized) {
                        // Restore to previous size/position
                        dispatch(
                            updatePanels([
                                {
                                    ...panel,
                                    isMaximized: false,
                                    position: panel.restorePosition || panel.position,
                                    size: panel.restoreSize || panel.size,
                                    restorePosition: undefined,
                                    restoreSize: undefined,
                                },
                            ])
                        );
                    } else {
                        // Maximize and save current position/size
                        dispatch(
                            updatePanels([
                                {
                                    ...panel,
                                    isMaximized: true,
                                    restorePosition: panel.position,
                                    restoreSize: panel.size,
                                },
                            ])
                        );
                    }
                }),

            togglePin: (panelId: UUID) => updatePanelById(panelId, (panel) => ({ isPinned: !panel.isPinned })),

            openPanel: (panelId: UUID) => updatePanelById(panelId, () => ({ isMinimized: false })),

            openSldAndAssociateToNad: ({ voltageLevelId, nadPanelId }: { voltageLevelId: string; nadPanelId: UUID }) =>
                dispatch((dispatch, _getState) => {
                    const newPanel: SLDVoltageLevelPanel = {
                        ...createPanelBase(PanelType.SLD_VOLTAGE_LEVEL),
                        type: PanelType.SLD_VOLTAGE_LEVEL,
                        title: voltageLevelId,
                        diagramId: voltageLevelId,
                        parentNadPanelId: nadPanelId,
                        navigationHistory: [],
                    };
                    dispatch(updatePanels([newPanel]));
                }),

            associateSldToNad: ({ sldPanelId, nadPanelId }: { sldPanelId: UUID; nadPanelId: UUID }) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const sldPanel = findPanelById(panels, sldPanelId);
                    if (!sldPanel || sldPanel.type !== PanelType.SLD_VOLTAGE_LEVEL) return;

                    dispatch(updatePanels([{ ...sldPanel, parentNadPanelId: nadPanelId }]));
                }),

            dissociateSldFromNad: (sldPanelId: UUID) =>
                dispatch((dispatch, getState) => {
                    const panels = selectPanels(getState());
                    const sldPanel = findPanelById(panels, sldPanelId);
                    if (!sldPanel || sldPanel.type !== PanelType.SLD_VOLTAGE_LEVEL) return;

                    dispatch(updatePanels([{ ...sldPanel, parentNadPanelId: undefined }]));
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

                    // Store initialization data in session (temporary)
                    dispatch(setTempData({ panelId, data: { initialVoltageLevelIds: [voltageLevelId] } }));

                    const newNadPanel: NADPanel = {
                        ...createPanelBase(PanelType.NAD),
                        id: panelId,
                        type: PanelType.NAD,
                        title: voltageLevelName || config.title,
                    };

                    const sldPanel = findPanelById(panels, sldPanelId);
                    if (!sldPanel || sldPanel.type !== PanelType.SLD_VOLTAGE_LEVEL) return;

                    dispatch(updatePanels([newNadPanel, { ...sldPanel, parentNadPanelId: newNadPanel.id }]));
                    dispatch(setFocusedPanel(newNadPanel.id));
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
                    const spreadsheetPanel = findPanelByType(panels, PanelType.SPREADSHEET);

                    if (spreadsheetPanel) {
                        // Store scroll command in tempData (component will read and clear after scrolling)
                        dispatch(
                            setTempData({
                                panelId: spreadsheetPanel.id,
                                data: { targetEquipmentId: equipmentId, targetEquipmentType: equipmentType },
                            })
                        );
                        // Restore if minimized and focus
                        if (spreadsheetPanel.isMinimized) {
                            dispatch(updatePanels([{ ...spreadsheetPanel, isMinimized: false }]));
                        }
                        dispatch(setFocusedPanel(spreadsheetPanel.id));
                    } else {
                        const panelId = uuidv4() as UUID;
                        dispatch(
                            setTempData({
                                panelId,
                                data: { targetEquipmentId: equipmentId, targetEquipmentType: equipmentType },
                            })
                        );
                        const newPanel: PanelState = {
                            ...createPanelBase(PanelType.SPREADSHEET),
                            id: panelId,
                            type: PanelType.SPREADSHEET,
                            title: 'Spreadsheet',
                        };
                        dispatch(updatePanels([newPanel]));
                        dispatch(setFocusedPanel(panelId));
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
                        dispatch(setFocusedPanel(panelsToUpdate[0].id));
                    }
                }),
        };
    }, [dispatch]);
};
