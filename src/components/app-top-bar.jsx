/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchAppsMetadata, LIGHT_THEME, logout, TopBar } from '@gridsuite/commons-ui';
import GridStudyLogoLight from '../images/GridStudy_logo_light.svg?react';
import GridStudyLogoDark from '../images/GridStudy_logo_dark.svg?react';
import { Badge, Box, Tab, Tabs } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import { PARAM_DEVELOPER_MODE, PARAM_LANGUAGE, PARAM_THEME, PARAM_USE_NAME } from '../utils/config-params';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import AppPackage from '../../package.json';
import { isNodeBuilt, isNodeReadOnly } from './graph/util/model-functions';
import { getServersInfos } from '../services/study';
import { fetchVersion } from '../services/utils';
import { RunButtonContainer } from './run-button-container';
import { useComputationResultsCount } from '../hooks/use-computation-results-count';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import StudyNavigationSyncToggle from './study-navigation-sync-toggle';
import { WorkspaceToolbar } from './workspace/core/workspace-toolbar';
import { WorkspaceSwitcher } from './workspace/core/workspace-switcher';

const styles = {
    boxContent: (theme) => ({
        display: 'flex',
        overflow: 'hidden',
        alignItems: 'center',
        width: '100%',
        marginLeft: theme.spacing(1),
    }),
    runButtonContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: 1.5,
    },
    syncToggleContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: 1.5,
    },
};

const AppTopBar = ({ user, userManager }) => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state[PARAM_THEME]);
    const appTabIndex = useSelector((state) => state.appTabIndex);
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);

    const [appsAndUrls, setAppsAndUrls] = useState([]);

    const notificationsCount = useComputationResultsCount();

    const [languageLocal, handleChangeLanguage] = useParameterState(PARAM_LANGUAGE);
    const [useNameLocal, handleChangeUseName] = useParameterState(PARAM_USE_NAME);
    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);
    const [enableDeveloperModeLocal, handleChangeDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    useEffect(() => {
        if (user !== null) {
            fetchAppsMetadata().then((res) => {
                setAppsAndUrls(res);
            });
        }
    }, [user]);

    return (
        <TopBar
            appName="Study"
            appColor="#0CA789"
            appLogo={theme === LIGHT_THEME ? <GridStudyLogoLight /> : <GridStudyLogoDark />}
            onLogoutClick={() => logout(dispatch, userManager.instance)}
            user={user}
            appsAndUrls={appsAndUrls}
            onThemeClick={handleChangeTheme}
            appVersion={AppPackage.version}
            appLicense={AppPackage.license}
            globalVersionPromise={() => fetchVersion().then((res) => res?.deployVersion)}
            additionalModulesPromise={getServersInfos}
            theme={themeLocal}
            onDeveloperModeClick={handleChangeDeveloperMode}
            developerMode={enableDeveloperModeLocal}
            onEquipmentLabellingClick={handleChangeUseName}
            equipmentLabelling={useNameLocal}
            onLanguageClick={handleChangeLanguage}
            language={languageLocal}
            density="compact"
        >
            {user && studyUuid && currentRootNetworkUuid && (
                <Box sx={styles.boxContent}>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 1.5, marginRight: 'auto' }}>
                        <WorkspaceSwitcher />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 1.5, marginLeft: 'auto' }}>
                        <WorkspaceToolbar />
                    </Box>
                    <Box sx={styles.runButtonContainer}>
                        <RunButtonContainer
                            studyUuid={studyUuid}
                            currentNode={currentNode}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            disabled={!isNodeBuilt(currentNode) || isNodeReadOnly(currentNode)}
                        />
                    </Box>
                    <Box sx={styles.syncToggleContainer}>
                        <StudyNavigationSyncToggle />
                    </Box>
                </Box>
            )}
        </TopBar>
    );
};

AppTopBar.propTypes = {
    user: PropTypes.object,
    userManager: PropTypes.object.isRequired,
};

export default AppTopBar;
