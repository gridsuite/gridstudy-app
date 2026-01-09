/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import {
    updatePanels,
    deletePanels as deletePanelsRedux,
    setFocusedPanelId,
} from '../../../redux/slices/workspace-slice';
import {
    selectFocusedPanelId,
    selectActiveWorkspaceId,
    selectPanel,
    selectPanelByType,
    selectExistingSLD,
    selectAssociatedPanels,
    selectVisibleAssociatedSldPanels,
} from '../../../redux/slices/workspace-selectors';
import { PanelType } from '../types/workspace.types';
import type { PanelState, NADPanel, SpreadsheetPanel } from '../types/workspace.types';
import { store, type AppDispatch } from '../../../redux/store';
import { EquipmentType } from '@gridsuite/commons-ui';
import { AppState } from 'redux/reducer';
import {
    getDefaultAssociatedSldPositionAndSize,
    isNADPanel,
    isSLDVoltageLevelPanel,
    updateNavigationHistory,
    createPanelBase,
    createSLDPanel,
    createNADPanel,
} from './workspace-panel-utils';
import { getPanelConfig } from '../constants/workspace.constants';
import { panelSyncManager } from '../utils/panel-sync-manager';

export const useWorkspaceActions = () => {
    const dispatch = useDispatch<AppDispatch>();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const workspaceId = useSelector(selectActiveWorkspaceId);

    return useMemo(() => {
        // Core helpers - use store.getState() for state access without subscriptions
        const getState = () => store.getState();

        const savePanels = (panels: PanelState[], syncToBackend = true) => {
            dispatch(updatePanels(panels));
            if (syncToBackend && workspaceId) {
                panelSyncManager.queueSync(studyUuid as UUID, workspaceId, panels);
            }
        };

        const saveAndFocus = (panel: PanelState, syncToBackend = true) => {
            savePanels([panel], syncToBackend);
            focusPanel(panel.id);
        };

        const savePanel = (panelId: UUID, transform: (panel: PanelState) => PanelState, syncToBackend = true) => {
            const panel = selectPanel(getState(), panelId);
            if (panel) {
                savePanels([transform(panel)], syncToBackend);
            }
        };

        const deletePanels = (panelIds: UUID[]) => {
            dispatch(deletePanelsRedux(panelIds));
            if (workspaceId) {
                panelSyncManager.queueDelete(studyUuid as UUID, workspaceId, panelIds);
            }
        };

        const focusPanel = (panelId: UUID) => {
            const state = getState();
            const panel = selectPanel(state, panelId);
            if (panel) {
                const nextZ = state.workspace.nextZIndex;
                dispatch(updatePanels([{ ...panel, zIndex: nextZ }]));
                dispatch(setFocusedPanelId(panelId));
            }
        };

        return {
            // Simple panel property toggles
            toggleMinimized: (panelId: UUID) => savePanel(panelId, (p) => ({ ...p, minimized: !p.minimized })),
            togglePin: (panelId: UUID) => savePanel(panelId, (p) => ({ ...p, pinned: !p.pinned })),
            toggleMaximized: (panelId: UUID) =>
                savePanel(panelId, (p) =>
                    p.maximized
                        ? {
                              ...p,
                              maximized: false,
                              position: p.restorePosition || p.position,
                              size: p.restoreSize || p.size,
                              restorePosition: undefined,
                              restoreSize: undefined,
                          }
                        : {
                              ...p,
                              maximized: true,
                              restorePosition: p.position,
                              restoreSize: p.size,
                          }
                ),

            updatePanelGeometry: (
                panelId: UUID,
                updates: {
                    position?: { x: number; y: number };
                    size?: { width: number; height: number };
                },
                syncToBackend = true
            ) => savePanel(panelId, (p) => ({ ...p, ...updates }), syncToBackend),

            // Associated SLD operations
            hideAssociatedSlds: (nadPanelId: UUID) => {
                const panels = selectVisibleAssociatedSldPanels(getState(), nadPanelId);
                if (panels.length > 0) {
                    savePanels(panels.map((p) => ({ ...p, minimized: true })));
                }
            },

            showAssociatedSlds: (nadPanelId: UUID) => {
                const minimizedPanels = selectAssociatedPanels(getState(), nadPanelId).filter((p) => p.minimized);
                if (minimizedPanels.length > 0) {
                    savePanels(minimizedPanels.map((p) => ({ ...p, minimized: false })));
                    focusPanel(minimizedPanels[0].id);
                }
            },

            // Panel deletion
            deletePanel: (panelId: UUID) => {
                const state = getState();
                const panel = selectPanel(state, panelId);
                if (!panel) return;
                const toDelete = [panelId];
                // If deleting NAD, also delete associated SLDs
                if (panel.type === PanelType.NAD) {
                    toDelete.push(...selectAssociatedPanels(state, panelId).map((p) => p.id));
                }
                deletePanels(toDelete);
            },

            deletePanels,

            // SLD operations
            openSLD: ({
                diagramId,
                panelType,
            }: {
                diagramId: string;
                panelType: PanelType.SLD_VOLTAGE_LEVEL | PanelType.SLD_SUBSTATION;
            }) => {
                const existing = selectExistingSLD(getState(), diagramId);
                if (existing) {
                    saveAndFocus({ ...existing, minimized: false });
                } else {
                    saveAndFocus(createSLDPanel({ panelType, diagramId }));
                }
            },

            navigateSLD: ({
                panelId,
                voltageLevelId,
                skipHistory = false,
            }: {
                panelId: UUID;
                voltageLevelId: string;
                skipHistory?: boolean;
            }) => {
                const panel = selectPanel(getState(), panelId);
                if (!panel || !isSLDVoltageLevelPanel(panel)) return;
                savePanels([
                    {
                        ...panel,
                        diagramId: voltageLevelId,
                        title: voltageLevelId,
                        navigationHistory: updateNavigationHistory(panel, voltageLevelId, skipHistory),
                    },
                ]);
            },

            associateVoltageLevelWithNad: ({
                voltageLevelId,
                nadPanelId,
            }: {
                voltageLevelId: string;
                nadPanelId: UUID;
            }) => {
                const state = getState();
                const associatedPanels = selectAssociatedPanels(state, nadPanelId);
                const existingPanel = associatedPanels.find((p) => p.diagramId === voltageLevelId);

                if (existingPanel) {
                    if (existingPanel.minimized) {
                        saveAndFocus({ ...existingPanel, minimized: false });
                    } else {
                        focusPanel(existingPanel.id);
                    }
                } else {
                    const defaults = getDefaultAssociatedSldPositionAndSize();
                    savePanels([
                        createSLDPanel({
                            panelType: PanelType.SLD_VOLTAGE_LEVEL,
                            diagramId: voltageLevelId,
                            parentNadPanelId: nadPanelId,
                            position: defaults.position,
                            size: defaults.size,
                        }),
                    ]);
                }
            },

            associateSldToNad: ({ sldPanelId, nadPanelId }: { sldPanelId: UUID; nadPanelId: UUID }) => {
                const panel = selectPanel(getState(), sldPanelId);
                if (!panel || !isSLDVoltageLevelPanel(panel)) return;
                const posAndSize = getDefaultAssociatedSldPositionAndSize();
                savePanels([{ ...panel, ...posAndSize, parentNadPanelId: nadPanelId }]);
                focusPanel(nadPanelId);
            },

            dissociateSldFromNad: (sldPanelId: UUID) => {
                const panel = selectPanel(getState(), sldPanelId);
                if (!panel || !isSLDVoltageLevelPanel(panel)) return;
                savePanels([{ ...panel, parentNadPanelId: undefined }]);
                focusPanel(sldPanelId);
            },

            // NAD operations
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
            }) => {
                const panel = selectPanel(getState(), panelId);
                if (!panel || !isNADPanel(panel)) return;
                savePanels([{ ...panel, ...fields }]);
            },

            addToNadNavigationHistory: ({ panelId, voltageLevelId }: { panelId: UUID; voltageLevelId: string }) => {
                const panel = selectPanel(getState(), panelId);
                if (!panel || !isNADPanel(panel)) return;
                const currentHistory = panel.navigationHistory || [];
                savePanels([{ ...panel, navigationHistory: [...currentHistory, voltageLevelId] }]);
            },

            createNadAndAssociateSld: ({
                sldPanelId,
                voltageLevelId,
                voltageLevelName,
            }: {
                sldPanelId: UUID;
                voltageLevelId: string;
                voltageLevelName?: string;
            }) => {
                const state = getState();
                const sldPanel = selectPanel(state, sldPanelId);
                if (!sldPanel || !isSLDVoltageLevelPanel(sldPanel)) return;

                const newNadPanel = createNADPanel({
                    title: voltageLevelName,
                    initialVoltageLevelIds: [voltageLevelId],
                    position: sldPanel.position,
                    size: sldPanel.size,
                });

                const updatedSld = {
                    ...sldPanel,
                    ...getDefaultAssociatedSldPositionAndSize(),
                    parentNadPanelId: newNadPanel.id,
                };

                // New NAD panel without backend sync (will be synced later when nadConfigUuid is set)
                savePanels([newNadPanel], false);
                savePanels([updatedSld]);
                focusPanel(newNadPanel.id);
            },

            toggleToolPanel: (panelType: PanelType) => {
                const state = getState();
                const focusedPanelId = selectFocusedPanelId(state);
                const existing = selectPanelByType(state, panelType);

                if (existing) {
                    if (existing.minimized) {
                        saveAndFocus({ ...existing, minimized: false });
                    } else if (focusedPanelId === existing.id) {
                        savePanels([{ ...existing, minimized: true }]);
                    } else {
                        focusPanel(existing.id);
                    }
                } else {
                    const config = getPanelConfig(panelType);
                    saveAndFocus({
                        ...createPanelBase(panelType),
                        type: panelType,
                        title: config.title,
                    } as PanelState);
                }
            },

            // NAD panel creation (no backend sync until config is saved)
            openNAD: ({
                title,
                nadConfigUuid,
                filterUuid,
                initialVoltageLevelIds,
            }: {
                title?: string;
                nadConfigUuid?: UUID;
                filterUuid?: UUID;
                initialVoltageLevelIds?: string[];
            }) => {
                const newPanel = createNADPanel({
                    title,
                    initialVoltageLevelIds,
                    nadConfigUuid,
                    filterUuid,
                    currentFilterUuid: filterUuid,
                });
                saveAndFocus(newPanel, false);
            },

            // Focus operations
            focusPanel,

            bringToFront: (panelId: UUID) => {
                const state = getState();
                const panel = selectPanel(state, panelId);
                if (panel) {
                    savePanels([{ ...panel, zIndex: state.workspace.nextZIndex }], false);
                }
            },

            // Spreadsheet operations
            showInSpreadsheet: ({
                equipmentId,
                equipmentType,
            }: {
                equipmentId: string;
                equipmentType: EquipmentType;
            }) => {
                const existing = selectPanelByType(getState(), PanelType.SPREADSHEET) as SpreadsheetPanel | undefined;
                // Transient UI state - don't sync to backend
                saveAndFocus(
                    existing
                        ? {
                              ...existing,
                              targetEquipmentId: equipmentId,
                              targetEquipmentType: equipmentType,
                              minimized: false,
                          }
                        : {
                              ...createPanelBase(PanelType.SPREADSHEET),
                              type: PanelType.SPREADSHEET,
                              title: 'Spreadsheet',
                              targetEquipmentId: equipmentId,
                              targetEquipmentType: equipmentType,
                          },
                    false
                );
            },

            clearTargetEquipment: (panelId: UUID) => {
                const panel = selectPanel(getState(), panelId);
                if (panel && panel.type === PanelType.SPREADSHEET) {
                    // Transient UI state - don't sync to backend
                    savePanels([{ ...panel, targetEquipmentId: undefined, targetEquipmentType: undefined }], false);
                }
            },
        };
    }, [dispatch, studyUuid, workspaceId]);
};
