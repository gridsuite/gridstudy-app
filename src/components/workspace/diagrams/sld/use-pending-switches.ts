/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createContext, useCallback, useContext, useLayoutEffect } from 'react';
import type { OnBreakerCallbackType, SLDMetadata } from '@powsybl/network-viewer';

export interface PendingSwitch {
    id: string;
    voltageLevelId: string;
    componentType: string;
    fictitious: boolean;
    open: boolean;
    /** Its modification is created: it is only kept to stay drawn until the refresh of the diagrams */
    validated?: boolean;
}

export type PendingSwitches = ReadonlyMap<string, PendingSwitch>;

export type DiagramNodes = SLDMetadata['nodes'];

export const noPendingSwitches: PendingSwitches = new Map();

export const groupByVoltageLevel = (pendingSwitches: PendingSwitches) =>
    Map.groupBy(pendingSwitches.values(), ({ voltageLevelId }) => voltageLevelId);

interface PendingSwitchesContextValue {
    pendingSwitches: PendingSwitches;
    /** From the validation until the diagrams draw the new switch states */
    isUpdatingSwitches: boolean;
    togglePendingSwitch: (pendingSwitch: PendingSwitch) => void;
    addDrawnNodes: (nodes: DiagramNodes) => void;
    removeDrawnNodes: (nodes: DiagramNodes) => void;
}

export const PendingSwitchesContext = createContext<PendingSwitchesContextValue | undefined>(undefined);

/**
 * Without a PendingSwitchesProvider, there is no toggle: the switch changes are applied immediately.
 */
export const usePendingSwitches = (svgMetadata?: SLDMetadata) => {
    const context = useContext(PendingSwitchesContext);
    const togglePendingSwitch = context?.togglePendingSwitch;
    const addDrawnNodes = context?.addDrawnNodes;
    const removeDrawnNodes = context?.removeDrawnNodes;

    const toggleDiagramSwitch: OnBreakerCallbackType = useCallback(
        (switchId, open, switchElement) => {
            const node = svgMetadata?.nodes.find(({ equipmentId }) => equipmentId === switchId);
            if (node) {
                togglePendingSwitch?.({
                    id: switchId,
                    voltageLevelId: node.vid,
                    componentType: node.componentType,
                    fictitious: !!switchElement?.classList.contains('sld-fictitious'),
                    open,
                });
            }
        },
        [svgMetadata, togglePendingSwitch]
    );

    // Tells the provider which switches the diagram draws, and in which state
    useLayoutEffect(() => {
        if (svgMetadata && addDrawnNodes && removeDrawnNodes) {
            addDrawnNodes(svgMetadata.nodes);
            return () => removeDrawnNodes(svgMetadata.nodes);
        }
    }, [svgMetadata, addDrawnNodes, removeDrawnNodes]);

    return {
        pendingSwitches: context?.pendingSwitches ?? noPendingSwitches,
        isUpdatingSwitches: !!context?.isUpdatingSwitches,
        togglePendingSwitch: context ? toggleDiagramSwitch : undefined,
    };
};
