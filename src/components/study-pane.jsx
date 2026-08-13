/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNodeAliases } from './spreadsheet-view/hooks/use-node-aliases';
import { useUpdateEquipmentsOnNotification } from './spreadsheet-view/hooks/use-update-equipments-on-notification';
import { useResetSpreadsheetOnRootNetwork } from './spreadsheet-view/hooks/use-reset-spreadsheet-on-root-network';
import { useNodeAliasesUpdateOnNotification } from './spreadsheet-view/hooks/use-node-aliases-update-on-notification';
import { useSpreadsheetEquipments } from './spreadsheet-view/hooks/use-spreadsheet-equipments';
import { WorkspaceContainer } from './workspace/core/workspace-container';
import useStudyPath from 'hooks/use-study-path';
import StudyPathBreadcrumbs from './breadcrumbs/study-path-breadcrumbs';
import { CustomAggridReduxProvider } from './custom-aggrid/custom-aggrid-redux-provider';
import { RunButtonContainer } from './run-button-container';
import StudyNavigationSyncToggle from './study-navigation-sync-toggle';

const styles = {
    paneContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    workspaceContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    studyControls: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
    },
    breadCrumbs: (theme) => ({
        backgroundColor: theme.palette.toolbarBackground,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        p: 1,
    }),
    '@global': {
        '@keyframes spin': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(-360deg)',
            },
        },
    },
};

const StudyPane = () => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);

    const { studyName, parentDirectoriesNames } = useStudyPath(studyUuid);

    const { fetchNodeAliases } = useNodeAliases();
    // Initializing node aliases from backend fetch
    useEffect(() => {
        fetchNodeAliases();
    }, [fetchNodeAliases]);
    useUpdateEquipmentsOnNotification();
    useNodeAliasesUpdateOnNotification();
    useResetSpreadsheetOnRootNetwork();
    useSpreadsheetEquipments();

    return (
        <CustomAggridReduxProvider>
            <Box sx={styles.paneContainer}>
                <Box sx={styles.breadCrumbs}>
                    <StudyPathBreadcrumbs studyName={studyName} parentDirectoriesNames={parentDirectoriesNames} />
                    <Box sx={styles.studyControls}>
                        <StudyNavigationSyncToggle />
                        {studyUuid && currentRootNetworkUuid && (
                            <RunButtonContainer
                                studyUuid={studyUuid}
                                currentNode={currentNode}
                                currentRootNetworkUuid={currentRootNetworkUuid}
                            />
                        )}
                    </Box>
                </Box>
                <Box sx={styles.workspaceContainer}>
                    <WorkspaceContainer />
                </Box>
            </Box>
        </CustomAggridReduxProvider>
    );
};

export default StudyPane;
