/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { updatePanels, deletePanels as deletePanelsRedux } from '../../../redux/slices/workspace-slice';
import {
    selectFocusedPanelId,
    selectActiveWorkspaceId,
    selectPanel,
    selectPanelByType,
    selectExistingSLD,
    selectAssociatedPanels,
    selectPanels,
} from '../../../redux/slices/workspace-selectors';
import { PanelType } from '../types/workspace.types';
import type { PanelState, SpreadsheetPanel, PersistentNADFields } from '../types/workspace.types';
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

// compute the next available zIndex value
const getNextZIndex = (panels: PanelState[]): number => {
    return Math.max(0, ...panels.map((p) => p.zIndex ?? 0)) + 1;
};

export const useWorkspacePanelActions = () => {
    const dispatch = useDispatch<AppDispatch>();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const workspaceId = useSelector(selectActiveWorkspaceId);

    // Core helpers
    const savePanels = useCallback(
        (panels: PanelState[], syncToBackend = true) => {
            dispatch(updatePanels(panels));
            if (syncToBackend && workspaceId) {
                panelSyncManager.queueSync(studyUuid as UUID, workspaceId, panels);
            }
        },
        [dispatch, studyUuid, workspaceId]
    );

    const deletePanels = useCallback(
        (panelIds: UUID[]) => {
            dispatch(deletePanelsRedux(panelIds));
            if (workspaceId) {
                panelSyncManager.queueDelete(studyUuid as UUID, workspaceId, panelIds);
            }
        },
        [dispatch, studyUuid, workspaceId]
    );

    const focusPanel = useCallback(
        (panelId: UUID) => {
            const state = store.getState();
            const panel = selectPanel(state, panelId);
            if (panel) {
                const allPanels = selectPanels(state);
                const nextZ = getNextZIndex(allPanels);
                const syncToBackend = panel.minimized === true;
                savePanels([{ ...panel, minimized: false, zIndex: nextZ }], syncToBackend);
            }
        },
        [savePanels]
    );

    const saveAndFocus = useCallback(
        (panel: PanelState, syncToBackend = true) => {
            const allPanels = selectPanels(store.getState());
            const nextZ = getNextZIndex(allPanels);
            savePanels([{ ...panel, minimized: false, zIndex: nextZ }], syncToBackend);
        },
        [savePanels]
    );

    const deletePanel = useCallback(
        (panelId: UUID) => {
            const state = store.getState();
            const panel = selectPanel(state, panelId);
            if (!panel) return;
            const toDelete = [panelId];
            // If deleting NAD, also delete associated SLDs
            if (panel.type === PanelType.NAD) {
                toDelete.push(...selectAssociatedPanels(state, panelId).map((p) => p.id));
            }
            deletePanels(toDelete);
        },
        [deletePanels]
    );

    // Simple panel property toggles
    const toggleMinimized = useCallback(
        (panelId: UUID) => {
            const panel = selectPanel(store.getState(), panelId);
            if (!panel) return;
            savePanels([{ ...panel, minimized: !panel.minimized }]);
        },
        [savePanels]
    );

    const togglePin = useCallback(
        (panelId: UUID) => {
            const panel = selectPanel(store.getState(), panelId);
            if (!panel) return;
            savePanels([{ ...panel, pinned: !panel.pinned }]);
        },
        [savePanels]
    );

    const toggleMaximized = useCallback(
        (panelId: UUID) => {
            const panel = selectPanel(store.getState(), panelId);
            if (!panel) return;

            const updated = panel.maximized
                ? {
                      ...panel,
                      maximized: false,
                      position: panel.restorePosition || panel.position,
                      size: panel.restoreSize || panel.size,
                      restorePosition: undefined,
                      restoreSize: undefined,
                  }
                : {
                      ...panel,
                      maximized: true,
                      restorePosition: panel.position,
                      restoreSize: panel.size,
                  };

            savePanels([updated]);
        },
        [savePanels]
    );

    const updatePanelGeometry = useCallback(
        (
            panelId: UUID,
            updates: {
                position?: { x: number; y: number };
                size?: { width: number; height: number };
            },
            syncToBackend = true
        ) => {
            const panel = selectPanel(store.getState(), panelId);
            if (!panel) return;

            // Check if anything actually changed
            const positionChanged =
                updates.position &&
                (panel.position.x !== updates.position.x || panel.position.y !== updates.position.y);
            const sizeChanged =
                updates.size && (panel.size.width !== updates.size.width || panel.size.height !== updates.size.height);

            if (positionChanged || sizeChanged) {
                savePanels([{ ...panel, ...updates }], syncToBackend);
            }
        },
        [savePanels]
    );

    const toggleToolPanel = useCallback(
        (panelType: PanelType) => {
            const state = store.getState();
            const focusedPanelId = selectFocusedPanelId(state);
            const existing = selectPanelByType(state, panelType);

            if (existing) {
                if (focusedPanelId === existing.id && !existing.minimized) {
                    toggleMinimized(existing.id);
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
        [saveAndFocus, toggleMinimized, focusPanel]
    );

    // SLD operations
    const openSLD = useCallback(
        ({
            equipmentId,
            panelType,
        }: {
            equipmentId: string;
            panelType: PanelType.SLD_VOLTAGE_LEVEL | PanelType.SLD_SUBSTATION;
        }) => {
            const existing = selectExistingSLD(store.getState(), equipmentId);
            if (existing) {
                focusPanel(existing.id);
            } else {
                saveAndFocus(createSLDPanel({ panelType, equipmentId }));
            }
        },
        [focusPanel, saveAndFocus]
    );

    const navigateSLD = useCallback(
        ({
            panelId,
            voltageLevelId,
            skipHistory = false,
        }: {
            panelId: UUID;
            voltageLevelId: string;
            skipHistory?: boolean;
        }) => {
            const panel = selectPanel(store.getState(), panelId);
            if (!panel || !isSLDVoltageLevelPanel(panel)) return;

            savePanels([
                {
                    ...panel,
                    equipmentId: voltageLevelId,
                    title: voltageLevelId,
                    navigationHistory: updateNavigationHistory(panel, voltageLevelId, skipHistory),
                },
            ]);
        },
        [savePanels]
    );

    const associateVoltageLevelWithNad = useCallback(
        ({ voltageLevelId, nadPanelId }: { voltageLevelId: string; nadPanelId: UUID }) => {
            const state = store.getState();
            const associatedPanels = selectAssociatedPanels(state, nadPanelId);
            const existingPanel = associatedPanels.find((p) => p.equipmentId === voltageLevelId);

            if (existingPanel) {
                focusPanel(existingPanel.id);
            } else {
                const defaults = getDefaultAssociatedSldPositionAndSize();
                const newPanel = createSLDPanel({
                    panelType: PanelType.SLD_VOLTAGE_LEVEL,
                    equipmentId: voltageLevelId,
                    parentNadPanelId: nadPanelId,
                    position: defaults.position,
                    size: defaults.size,
                });
                saveAndFocus(newPanel);
            }
        },
        [focusPanel, saveAndFocus]
    );

    const associateSldToNad = useCallback(
        ({ sldPanelId, nadPanelId }: { sldPanelId: UUID; nadPanelId: UUID }) => {
            const panel = selectPanel(store.getState(), sldPanelId);
            if (!panel || !isSLDVoltageLevelPanel(panel)) return;

            const posAndSize = getDefaultAssociatedSldPositionAndSize();
            savePanels([{ ...panel, ...posAndSize, parentNadPanelId: nadPanelId }]);
            focusPanel(nadPanelId);
        },
        [savePanels, focusPanel]
    );

    const dissociateSldFromNad = useCallback(
        (sldPanelId: UUID) => {
            const panel = selectPanel(store.getState(), sldPanelId);
            if (!panel || !isSLDVoltageLevelPanel(panel)) return;

            savePanels([{ ...panel, parentNadPanelId: undefined }]);
            focusPanel(sldPanelId);
        },
        [savePanels, focusPanel]
    );

    // NAD operations
    const openNAD = useCallback(
        ({
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
            saveAndFocus(newPanel);
        },
        [saveAndFocus]
    );

    const updateNADFields = useCallback(
        ({
            panelId,
            fields,
            syncToBackend = true,
        }: {
            panelId: UUID;
            fields: Partial<PersistentNADFields>;
            syncToBackend?: boolean;
        }) => {
            const panel = selectPanel(store.getState(), panelId);
            if (!panel || !isNADPanel(panel)) return;

            savePanels([{ ...panel, ...fields }], syncToBackend);
        },
        [savePanels]
    );

    const addToNadNavigationHistory = useCallback(
        ({ panelId, voltageLevelId }: { panelId: UUID; voltageLevelId: string }) => {
            const panel = selectPanel(store.getState(), panelId);
            if (!panel || !isNADPanel(panel)) return;

            const currentHistory = panel.navigationHistory || [];
            savePanels([{ ...panel, navigationHistory: [...currentHistory, voltageLevelId] }]);
        },
        [savePanels]
    );

    const createNadAndAssociateSld = useCallback(
        ({
            sldPanelId,
            voltageLevelId,
            voltageLevelName,
        }: {
            sldPanelId: UUID;
            voltageLevelId: string;
            voltageLevelName?: string;
        }) => {
            const sldPanel = selectPanel(store.getState(), sldPanelId);
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

            savePanels([updatedSld]);
            saveAndFocus(newNadPanel);
        },
        [savePanels, saveAndFocus]
    );

    // Associated SLD operations
    const hideAssociatedSlds = useCallback(
        (nadPanelId: UUID) => {
            const panels = selectAssociatedPanels(store.getState(), nadPanelId).filter((p) => !p.minimized);
            if (panels.length > 0) {
                savePanels(panels.map((p) => ({ ...p, minimized: true })));
            }
        },
        [savePanels]
    );

    const showAssociatedSlds = useCallback(
        (nadPanelId: UUID) => {
            const state = store.getState();
            const minimizedPanels = selectAssociatedPanels(state, nadPanelId).filter((p) => p.minimized);
            if (minimizedPanels.length > 0) {
                const allPanels = selectPanels(state);
                let nextZ = getNextZIndex(allPanels);
                const panelsWithZIndex = minimizedPanels.map((p) => ({
                    ...p,
                    minimized: false,
                    zIndex: nextZ++,
                }));
                savePanels(panelsWithZIndex);
            }
        },
        [savePanels]
    );

    // Spreadsheet operations
    const showInSpreadsheet = useCallback(
        ({ equipmentId, equipmentType }: { equipmentId: string; equipmentType: EquipmentType }) => {
            const existing = selectPanelByType(store.getState(), PanelType.SPREADSHEET) as SpreadsheetPanel | undefined;
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
        [saveAndFocus]
    );

    const clearTargetEquipment = useCallback(
        (panelId: UUID) => {
            const panel = selectPanel(store.getState(), panelId);
            if (!panel || panel.type !== PanelType.SPREADSHEET) return;

            // Transient UI state - don't sync to backend
            savePanels([{ ...panel, targetEquipmentId: undefined, targetEquipmentType: undefined }], false);
        },
        [savePanels]
    );

    return {
        toggleMinimized,
        togglePin,
        toggleMaximized,
        updatePanelGeometry,
        hideAssociatedSlds,
        showAssociatedSlds,
        deletePanel,
        deletePanels,
        openSLD,
        navigateSLD,
        associateVoltageLevelWithNad,
        associateSldToNad,
        dissociateSldFromNad,
        updateNADFields,
        addToNadNavigationHistory,
        createNadAndAssociateSld,
        toggleToolPanel,
        openNAD,
        focusPanel,
        showInSpreadsheet,
        clearTargetEquipment,
    };
};
