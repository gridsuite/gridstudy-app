/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { ReactElement, useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { Chip, darken, lighten } from '@mui/material';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { setOneBusShortcircuitAnalysisDiagram } from 'redux/actions';
import { AppDispatch } from 'redux/store';
import {
    isOneBusShortCircuitFailedNotification,
    isOneBusShortCircuitResultNotification,
} from 'types/notification-types';

const styles = {
    loaderMessage: (theme) => ({
        display: 'flex',
        position: 'relative',
        width: 'fit-content',
        margin: '5px auto',
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2),
    }),
} as const satisfies MuiStyles;

//Here's the rundown of the signature : the ReactElement is related to the loader JSX component, the boolean indicated wether the loader should be active,
//the first function submits the sld data on hand to the redux store and the second function reset the redux store state
type oneBusShortcircuitAnalysisLoader = [ReactElement, boolean, () => void, () => void];

/**
 * A hook that handles the logic behind the diagram one bus shortcircuit analysis loader
 *
 * @param {string} diagramId - Identifier for the diagram which launched the computation
 * @param {UUID} nodeId - Identifier for the node which launched the computation
 * @param rootNetworkUuid
 *
 * @returns {oneBusShortcircuitAnalysisLoader} array which contains the controls necessary for the one bus
 * shortcircuit analysis loader. It also comes with a boolean to check if the loader needs to be displayed
 * and the message to display for the UI
 */
export function useOneBusShortcircuitAnalysisLoader(
    diagramId: string,
    nodeId: UUID,
    rootNetworkUuid: UUID
): oneBusShortcircuitAnalysisLoader {
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const oneBusShortCircuitAnalysisDiagram = useSelector((state: AppState) => state.oneBusShortCircuitAnalysisDiagram);

    const dispatch = useDispatch<AppDispatch>();
    const intl = useIntl();

    const displayOneBusShortcircuitAnalysisLoader = useCallback(() => {
        dispatch(setOneBusShortcircuitAnalysisDiagram(diagramId, nodeId));
    }, [nodeId, diagramId, dispatch]);

    const resetOneBusShortcircuitAnalysisLoader = useCallback(() => {
        dispatch(setOneBusShortcircuitAnalysisDiagram(null));
    }, [dispatch]);

    const isDiagramRunningOneBusShortcircuitAnalysis = useMemo(
        () =>
            diagramId === oneBusShortCircuitAnalysisDiagram?.diagramId &&
            nodeId === oneBusShortCircuitAnalysisDiagram?.nodeId,
        [nodeId, diagramId, oneBusShortCircuitAnalysisDiagram]
    );

    const oneBusShortcircuitAnalysisLoaderMessage = useMemo<ReactElement>(() => {
        return (
            <>
                {isDiagramRunningOneBusShortcircuitAnalysis && (
                    <Chip
                        label={intl.formatMessage({
                            id: 'ShortcircuitInProgress',
                        })}
                        variant="outlined"
                        sx={styles.loaderMessage}
                    />
                )}
            </>
        );
    }, [intl, isDiagramRunningOneBusShortcircuitAnalysis]);

    useEffect(() => {
        if (
            (studyUpdatedForce && isOneBusShortCircuitResultNotification(studyUpdatedForce.eventData)) ||
            isOneBusShortCircuitFailedNotification(studyUpdatedForce.eventData)
        ) {
            if (studyUpdatedForce.eventData.headers.rootNetworkUuid !== rootNetworkUuid) {
                return;
            }
            resetOneBusShortcircuitAnalysisLoader();
        }
    }, [resetOneBusShortcircuitAnalysisLoader, studyUpdatedForce, rootNetworkUuid]);

    return [
        oneBusShortcircuitAnalysisLoaderMessage,
        isDiagramRunningOneBusShortcircuitAnalysis,
        displayOneBusShortcircuitAnalysisLoader,
        resetOneBusShortcircuitAnalysisLoader,
    ];
}
