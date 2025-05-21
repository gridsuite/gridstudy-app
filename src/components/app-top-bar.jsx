/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { fetchAppsMetadata, LIGHT_THEME, logout, OverflowableText, TopBar } from '@gridsuite/commons-ui';
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
import { StudyView } from './utils/utils';

const styles = {
    currentNodeBox: {
        width: '15%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#123456',
    },
    currentNodeLabel: (theme) => ({
        color: theme.palette.primary.main,
        margin: theme.spacing(1.5),
        fontWeight: 'bold',
    }),
    boxContent: { display: 'flex', width: '100%' },
    tabs: {},
    searchButton: {
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 1,
        marginRight: 1,
    },
    runButtonContainer: {
        marginTop: 'auto',
        marginBottom: 'auto',
        marginRight: '10%',
        marginLeft: 'auto',
        flexShrink: 0,
    },
};

const STUDY_VIEWS = [StudyView.MAP, StudyView.SPREADSHEET, StudyView.RESULTS, StudyView.LOGS, StudyView.PARAMETERS];

const AppTopBar = ({ user, onChangeTab, userManager }) => {
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
        >
            {/* Add current Node name between Logo and Tabs */}
            {user && currentNode && (
                <Box sx={styles.currentNodeBox}>
                    {/* TODO : temporary fix (remove user and manage disconnection in a hook?) */}
                    <OverflowableText sx={styles.currentNodeLabel} text="" />
                </Box>
            )}
            {user && studyUuid && currentRootNetworkUuid && (
                <Box sx={styles.boxContent}>
                    <Tabs
                        value={appTabIndex}
                        variant="scrollable"
                        onChange={(event, newTabIndex) => {
                            onChangeTab(newTabIndex);
                        }}
                        aria-label="views"
                        sx={styles.tabs}
                    >
                        {STUDY_VIEWS.map((tabName) => {
                            let label;
                            let style;
                            if (tabName === StudyView.RESULTS && notificationsCount > 0) {
                                label = (
                                    <Badge badgeContent={notificationsCount} color="secondary">
                                        <FormattedMessage id={tabName} />
                                    </Badge>
                                );
                            } else if (tabName === StudyView.PARAMETERS) {
                                label = <Settings />;
                                style = { minWidth: 'initial' };
                            } else {
                                label = <FormattedMessage id={tabName} />;
                            }
                            return <Tab sx={style} key={tabName} label={label} />;
                        })}
                    </Tabs>

                    <Box sx={styles.runButtonContainer}>
                        <RunButtonContainer
                            studyUuid={studyUuid}
                            currentNode={currentNode}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            disabled={!isNodeBuilt(currentNode) || isNodeReadOnly(currentNode)}
                        />
                    </Box>
                </Box>
            )}
        </TopBar>
    );
};

AppTopBar.propTypes = {
    user: PropTypes.object,
    onChangeTab: PropTypes.func.isRequired,
    userManager: PropTypes.object.isRequired,
};

export default AppTopBar;
