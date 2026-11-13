/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type PropsWithChildren, useCallback, useLayoutEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import type { UUID } from 'node:crypto';
import { type MuiStyles, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import type { AppState } from '../../../../redux/reducer.type';
import { updateVoltageLevelSwitchStates } from '../../../../services/study/network-modifications';
import { useIsEditBlocked } from '../../../node-activity/hooks/use-node-activity';
import { PanelFocusMode } from '../../core/panel-focus-mode';
import {
    type DiagramNodes,
    groupByVoltageLevel,
    noPendingSwitches,
    type PendingSwitch,
    PendingSwitchesContext,
} from './use-pending-switches';

const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%' },
    content: { flex: 1, minHeight: 0 },
} as const satisfies MuiStyles;

type PendingSwitchesProviderProps = PropsWithChildren<{
    panelId: UUID;
    studyUuid: UUID;
}>;

/**
 * Keeps the switches changed on the diagrams of a panel until their validation, the panel being in focus mode.
 * Validating them creates one voltage level topology modification per voltage level.
 */
export const PendingSwitchesProvider = ({ panelId, studyUuid, children }: PendingSwitchesProviderProps) => {
    const { snackError } = useSnackMessage();
    const currentNodeId = useSelector((state: AppState) => state.currentTreeNode?.id);
    const computationStarting = useSelector((state: AppState) => state.computationStarting);
    const isEditBlocked = useIsEditBlocked(currentNodeId);
    const [pendingSwitches, setPendingSwitches] = useState(noPendingSwitches);
    const [isValidating, setIsValidating] = useState(false);
    // The nodes drawn by each diagram of the panel
    const [drawnNodes, setDrawnNodes] = useState<DiagramNodes[]>([]);

    const togglePendingSwitch = useCallback((pendingSwitch: PendingSwitch) => {
        // The viewer computes the new state from the svg, so clicking a pending switch again cancels it
        setPendingSwitches((prev) => {
            const next = new Map(prev);
            if (prev.get(pendingSwitch.id)?.open === pendingSwitch.open) {
                next.delete(pendingSwitch.id);
            } else {
                next.set(pendingSwitch.id, pendingSwitch);
            }
            return next;
        });
    }, []);

    const addDrawnNodes = useCallback((nodes: DiagramNodes) => setDrawnNodes((prev) => [...prev, nodes]), []);

    const removeDrawnNodes = useCallback(
        (nodes: DiagramNodes) => setDrawnNodes((prev) => prev.filter((diagramNodes) => diagramNodes !== nodes)),
        []
    );

    const validatePendingSwitches = async () => {
        setIsValidating(true);
        // Sent one at a time because the server rejects concurrent edits of a node
        for (const [voltageLevelId, switches] of groupByVoltageLevel(pendingSwitches)) {
            try {
                await updateVoltageLevelSwitchStates(studyUuid, currentNodeId, voltageLevelId, switches);
            } catch (error) {
                snackWithFallback(snackError, error, {
                    headerId: 'updateSwitchStateError',
                    headerValues: { diagramTitle: voltageLevelId },
                });
                break;
            }
            setPendingSwitches((prev) => {
                const next = new Map(prev);
                switches.forEach((pendingSwitch) => next.set(pendingSwitch.id, { ...pendingSwitch, validated: true }));
                return next;
            });
        }
        setIsValidating(false);
    };

    useLayoutEffect(() => {
        const drawnNodeById = new Map(drawnNodes.flat().map((node) => [node.equipmentId, node]));
        // A validated switch is only kept while a diagram still draws its previous state, until the refresh
        const isKept = ({ id, open, validated }: PendingSwitch) => !validated || drawnNodeById.get(id)?.open === !open;
        setPendingSwitches((prev) => {
            const next = new Map([...prev].filter(([, pendingSwitch]) => isKept(pendingSwitch)));
            return next.size === prev.size ? prev : next;
        });
    }, [pendingSwitches, drawnNodes]);

    const isUpdatingSwitches = isValidating || [...pendingSwitches.values()].some(({ validated }) => validated);

    return (
        <PendingSwitchesContext.Provider
            value={{ pendingSwitches, isUpdatingSwitches, togglePendingSwitch, addDrawnNodes, removeDrawnNodes }}
        >
            <Box sx={styles.container}>
                <Box sx={styles.content}>{children}</Box>
                {pendingSwitches.size > 0 && (
                    <PanelFocusMode
                        panelId={panelId}
                        isValidating={isValidating}
                        canValidate={!isUpdatingSwitches && !computationStarting && !isEditBlocked}
                        onValidate={validatePendingSwitches}
                        onDiscard={() => setPendingSwitches(noPendingSwitches)}
                    />
                )}
            </Box>
        </PendingSwitchesContext.Provider>
    );
};
