/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import { LIGHT_THEME, logout, TopBar } from '@gridsuite/commons-ui';
import { ReactComponent as GridStudyLogoLight } from '../images/GridStudy_logo_light.svg';
import { ReactComponent as GridStudyLogoDark } from '../images/GridStudy_logo_dark.svg';
import Tabs from '@material-ui/core/Tabs';
import { StudyView } from './study-pane';
import { Badge } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Parameters, { useParameterState } from './parameters';
import {
    PARAM_LANGUAGE,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppsAndUrls } from '../utils/rest-api';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(() => ({
    tabs: {
        marginLeft: 18,
    },
}));

const STUDY_VIEWS = [
    StudyView.MAP,
    StudyView.SPREADSHEET,
    StudyView.RESULTS,
    StudyView.LOGS,
];

const AppTopBar = ({ user, tabIndex, onChangeTab, userManager }) => {
    const classes = useStyles();

    const history = useHistory();

    const dispatch = useDispatch();

    const [appsAndUrls, setAppsAndUrls] = useState([]);

    const loadflowNotif = useSelector((state) => state.loadflowNotif);

    const saNotif = useSelector((state) => state.saNotif);

    const theme = useSelector((state) => state[PARAM_THEME]);

    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);

    const [languageLocal, handleChangeLanguage] = useParameterState(
        PARAM_LANGUAGE
    );

    const [useNameLocal, handleChangeUseName] = useParameterState(
        PARAM_USE_NAME
    );

    const studyUuid = useSelector((state) => state.studyUuid);

    const [showParameters, setShowParameters] = useState(false);

    useEffect(() => {
        if (user !== null) {
            fetchAppsAndUrls().then((res) => {
                setAppsAndUrls(res);
            });
        }
    }, [user]);

    function showParametersClicked() {
        setShowParameters(true);
    }

    function hideParameters() {
        setShowParameters(false);
    }

    function onLogoClicked() {
        history.replace('/');
    }

    return (
        <>
            <TopBar
                appName="Study"
                appColor="#0CA789"
                appLogo={
                    theme === LIGHT_THEME ? (
                        <GridStudyLogoLight />
                    ) : (
                        <GridStudyLogoDark />
                    )
                }
                onParametersClick={() => showParametersClicked()}
                onLogoutClick={() => logout(dispatch, userManager.instance)}
                onLogoClick={() => onLogoClicked()}
                user={user}
                appsAndUrls={appsAndUrls}
                onThemeClick={handleChangeTheme}
                onAboutClick={() => console.debug('about')}
                theme={themeLocal}
                onEquipmentLabellingClick={handleChangeUseName}
                equipmentLabelling={useNameLocal}
                onLanguageClick={handleChangeLanguage}
                language={languageLocal}
            >
                {studyUuid && (
                    <Tabs
                        value={tabIndex}
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        onChange={(event, newTabIndex) => {
                            onChangeTab(newTabIndex);
                        }}
                        aria-label="views"
                        className={classes.tabs}
                    >
                        {STUDY_VIEWS.map((tabName) => {
                            let label;
                            if (
                                tabName === StudyView.RESULTS &&
                                (loadflowNotif || saNotif)
                            ) {
                                label = (
                                    <Badge
                                        badgeContent={loadflowNotif + saNotif}
                                        color="secondary"
                                    >
                                        <FormattedMessage id={tabName} />
                                    </Badge>
                                );
                            } else {
                                label = <FormattedMessage id={tabName} />;
                            }
                            return <Tab key={tabName} label={label} />;
                        })}
                    </Tabs>
                )}
            </TopBar>
            <Parameters
                showParameters={showParameters}
                hideParameters={hideParameters}
                user={user}
            />
        </>
    );
};

AppTopBar.propTypes = {
    user: PropTypes.object,
    tabIndex: PropTypes.number.isRequired,
    onChangeTab: PropTypes.func.isRequired,
    userManager: PropTypes.object.isRequired,
};

export default AppTopBar;
