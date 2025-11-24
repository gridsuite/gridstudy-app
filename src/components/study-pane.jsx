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
import WaitingLoader from './utils/waiting-loader';
import { WorkspaceContainer } from './workspace/core/workspace-container';
import useStudyPath from 'hooks/use-study-path';
import StudyPathBreadcrumbs from './breadcrumbs/study-path-breadcrumbs';

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
    breadCrumbs: (theme) => ({
        backgroundColor: theme.palette.toolbarBackground,
        pl: 1,
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
    const isNetworkModificationTreeModelUpToDate = useSelector((state) => state.isNetworkModificationTreeModelUpToDate);
    const studyUuid = useSelector((state) => state.studyUuid);

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
        <Box sx={styles.paneContainer}>
            <WaitingLoader message="LoadingRemoteData" loading={!isNetworkModificationTreeModelUpToDate} />
            <Box sx={styles.breadCrumbs}>
                <StudyPathBreadcrumbs studyName={studyName} parentDirectoriesNames={parentDirectoriesNames} />
            </Box>
            <Box sx={styles.workspaceContainer}>
                <WorkspaceContainer />
            </Box>
        </Box>
    );
};

export default StudyPane;
