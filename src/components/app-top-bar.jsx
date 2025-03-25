/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { LIGHT_THEME, logout, OverflowableText, TopBar } from '@gridsuite/commons-ui';
import GridStudyLogoLight from '../images/GridStudy_logo_light.svg?react';
import GridStudyLogoDark from '../images/GridStudy_logo_dark.svg?react';
import { Badge, Box, Button, Tab, Tabs, Tooltip } from '@mui/material';
import { Search, Settings } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import { PARAM_LANGUAGE, PARAM_THEME, PARAM_USE_NAME, PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import AppPackage from '../../package.json';
import { isNodeBuilt, isNodeReadOnly } from './graph/util/model-functions';
import { getServersInfos } from '../services/study';
import { EQUIPMENT_TYPES } from './utils/equipment-types';
import { fetchVersion } from '../services/utils';
import { RunButtonContainer } from './run-button-container';
import { useComputationResultsCount } from '../hooks/use-computation-results-count';

import { TopBarEquipmentSearchDialog } from './top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';
import { fetchAppsMetadata } from '@gridsuite/commons-ui';
import { ROOT_NODE_LABEL } from '../constants/node.constant';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import { StudyView } from './utils/utils';
import { DiagramType } from './diagrams/diagram.type';
import { useDiagram } from './diagrams/use-diagram';

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
    const intl = useIntl();
    const { openDiagramView } = useDiagram();

    const theme = useSelector((state) => state[PARAM_THEME]);
    const appTabIndex = useSelector((state) => state.appTabIndex);
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);

    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);
    const [appsAndUrls, setAppsAndUrls] = useState([]);

    const notificationsCount = useComputationResultsCount();

    const [languageLocal, handleChangeLanguage] = useParameterState(PARAM_LANGUAGE);
    const [useNameLocal, handleChangeUseName] = useParameterState(PARAM_USE_NAME);
    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);
    const [enableDeveloperModeLocal, handleChangeDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const showVoltageLevelDiagram = useCallback(
        // TODO code factorization for displaying a VL via a hook
        (optionInfos) => {
            onChangeTab(STUDY_VIEWS.indexOf(StudyView.MAP)); // switch to map view
            if (optionInfos.type === EQUIPMENT_TYPES.SUBSTATION) {
                openDiagramView(optionInfos.id, DiagramType.SUBSTATION);
            } else {
                openDiagramView(optionInfos.voltageLevelId, DiagramType.VOLTAGE_LEVEL);
            }
        },
        [onChangeTab, openDiagramView]
    );

    useEffect(() => {
        if (user !== null) {
            fetchAppsMetadata().then((res) => {
                setAppsAndUrls(res);
            });
        }
    }, [user]);

    return (
        <>
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
                        <OverflowableText
                            sx={styles.currentNodeLabel}
                            text={
                                currentNode?.data?.label === ROOT_NODE_LABEL
                                    ? intl.formatMessage({ id: 'root' })
                                    : currentNode?.data?.label
                            }
                        />
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
                        <Box sx={styles.searchButton}>
                            <Tooltip title={<FormattedMessage id="equipment_search/label" />}>
                                <Button color="inherit" size="large" onClick={() => setIsDialogSearchOpen(true)}>
                                    <Search />
                                </Button>
                            </Tooltip>
                        </Box>
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

            {studyUuid && (
                <TopBarEquipmentSearchDialog
                    showVoltageLevelDiagram={showVoltageLevelDiagram}
                    isDialogSearchOpen={isDialogSearchOpen}
                    setIsDialogSearchOpen={setIsDialogSearchOpen}
                />
            )}
        </>
    );
};

AppTopBar.propTypes = {
    user: PropTypes.object,
    onChangeTab: PropTypes.func.isRequired,
    userManager: PropTypes.object.isRequired,
};

export default AppTopBar;
