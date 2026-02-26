/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { v4 as uuidv4 } from 'uuid';
import type { UUID } from 'node:crypto';
import { PanelType } from '../types/workspace.types';
import type { PanelState, NADPanel, SLDVoltageLevelPanel, SLDSubstationPanel } from '../types/workspace.types';
import { NAD_SLD_CONSTANTS } from '../panel-contents/diagrams/nad/constants';
import { getPanelConfig } from '../constants/workspace.constants';

const SLD_MAX_NAVIGATION_HISTORY = 10;

export const getDefaultAssociatedSldPositionAndSize = () => ({
    position: {
        x: NAD_SLD_CONSTANTS.CASCADE_START_X,
        y: 1 - NAD_SLD_CONSTANTS.PANEL_DEFAULT_HEIGHT,
    },
    size: {
        width: NAD_SLD_CONSTANTS.PANEL_DEFAULT_WIDTH,
        height: NAD_SLD_CONSTANTS.PANEL_DEFAULT_HEIGHT,
    },
});

export const isNADPanel = (panel: PanelState): panel is NADPanel => panel.type === PanelType.NAD;

export const isSLDVoltageLevelPanel = (panel: PanelState): panel is SLDVoltageLevelPanel =>
    panel.type === PanelType.SLD_VOLTAGE_LEVEL;

export const updateNavigationHistory = (panel: SLDVoltageLevelPanel, newEquipmentId: string, skipHistory: boolean) => {
    const history = panel.navigationHistory || [];
    const shouldAddToHistory = !skipHistory && panel.equipmentId !== newEquipmentId && history[0] !== panel.equipmentId;
    return shouldAddToHistory ? [panel.equipmentId, ...history].slice(0, SLD_MAX_NAVIGATION_HISTORY) : history;
};

export const createPanelBase = (panelType: PanelType) => {
    const config = getPanelConfig(panelType);
    return {
        id: uuidv4() as UUID,
        position: config.defaultPosition,
        size: config.defaultSize,
        minimized: false,
        maximized: false,
        pinned: false,
    };
};

export const createSLDPanel = ({
    panelType,
    equipmentId,
    parentNadPanelId,
    position,
    size,
}: {
    panelType: PanelType.SLD_VOLTAGE_LEVEL | PanelType.SLD_SUBSTATION;
    equipmentId: string;
    parentNadPanelId?: UUID;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
}): SLDVoltageLevelPanel | SLDSubstationPanel => {
    const base = {
        ...createPanelBase(panelType),
        title: equipmentId,
        equipmentId,
    };
    if (panelType === PanelType.SLD_VOLTAGE_LEVEL) {
        return {
            ...base,
            type: panelType,
            parentNadPanelId,
            navigationHistory: [],
            ...(position && { position }),
            ...(size && { size }),
        };
    }
    return { ...base, type: panelType };
};

export const createNADPanel = ({
    title,
    initialVoltageLevelIds,
    navigationHistory,
    nadConfigUuid,
    filterUuid,
    currentFilterUuid,
    position,
    size,
}: {
    title?: string;
    initialVoltageLevelIds?: string[];
    navigationHistory?: string[];
    nadConfigUuid?: UUID;
    filterUuid?: UUID;
    currentFilterUuid?: UUID;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
}): NADPanel => {
    const config = getPanelConfig(PanelType.NAD);
    return {
        ...createPanelBase(PanelType.NAD),
        type: PanelType.NAD,
        title: title || config.title,
        initialVoltageLevelIds,
        navigationHistory: navigationHistory || [],
        ...(nadConfigUuid && { nadConfigUuid }),
        ...(filterUuid && { filterUuid }),
        ...(currentFilterUuid && { currentFilterUuid }),
        ...(position && { position }),
        ...(size && { size }),
    };
};
