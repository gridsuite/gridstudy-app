/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
    EQUIPMENT_TYPE,
    equipmentStyles,
    getEquipmentsInfosForSearchBar,
    LIGHT_THEME,
    logout,
    renderEquipmentForSearchBar,
    TopBar,
} from '@gridsuite/commons-ui';
import { ReactComponent as GridStudyLogoLight } from '../images/GridStudy_logo_light.svg';
import { ReactComponent as GridStudyLogoDark } from '../images/GridStudy_logo_dark.svg';
import Tabs from '@material-ui/core/Tabs';
import { StudyView } from './study-pane';
import { Badge } from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Parameters, { useParameterState } from './parameters';
import {
    PARAM_LANGUAGE,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppsAndUrls, fetchEquipmentsInfos } from '../utils/rest-api';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { useSnackbar } from 'notistack';
import { stringify } from 'qs';
import { selectItemNetwork } from '../redux/actions';

const useStyles = makeStyles(() => ({
    tabs: {
        marginLeft: 18,
    },
}));

const useEquipmentStyles = makeStyles(equipmentStyles);

const STUDY_VIEWS = [
    StudyView.MAP,
    StudyView.SPREADSHEET,
    StudyView.RESULTS,
    StudyView.LOGS,
];

const AppTopBar = ({ user, tabIndex, onChangeTab, userManager }) => {
    const classes = useStyles();

    const equipmentClasses = useEquipmentStyles();

    const history = useHistory();

    const dispatch = useDispatch();

    const intl = useIntl();

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [appsAndUrls, setAppsAndUrls] = useState([]);

    const loadflowNotif = useSelector((state) => state.loadflowNotif);

    const saNotif = useSelector((state) => state.saNotif);

    const theme = useSelector((state) => state[PARAM_THEME]);

    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);

    const [languageLocal, handleChangeLanguage] =
        useParameterState(PARAM_LANGUAGE);

    const [useNameLocal, handleChangeUseName] =
        useParameterState(PARAM_USE_NAME);

    const studyUuid = useSelector((state) => state.studyUuid);

    const workingNode = useSelector((state) => state.workingTreeNode);

    const [showParameters, setShowParameters] = useState(false);

    // Equipments search bar
    const [equipmentsFound, setEquipmentsFound] = useState([]);
    const searchMatchingEquipments = useCallback(
        (searchTerm) => {
            fetchEquipmentsInfos(
                studyUuid,
                workingNode?.id,
                searchTerm,
                useNameLocal
            )
                .then((infos) =>
                    setEquipmentsFound(
                        getEquipmentsInfosForSearchBar(infos, useNameLocal)
                    )
                )
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'equipmentsSearchingError',
                            intlRef: intlRef,
                        },
                    })
                );
        },
        [studyUuid, workingNode, useNameLocal, enqueueSnackbar, intlRef]
    );
    const showVoltageLevelDiagram = useCallback(
        // TODO code factorization for displaying a VL via a hook
        (optionInfos) => {
            let substationOrVlId;
            let requestParam;
            if (optionInfos.type === EQUIPMENT_TYPE.SUBSTATION.name) {
                substationOrVlId = optionInfos.id;
                requestParam = { substationId: substationOrVlId };
            } else {
                substationOrVlId = optionInfos.voltageLevelId;
                requestParam = {
                    voltageLevelId: substationOrVlId,
                };
            }
            dispatch(selectItemNetwork(substationOrVlId));
            onChangeTab(STUDY_VIEWS.indexOf(StudyView.MAP)); // switch to map view
            history.replace(
                // show voltage level
                '/studies/' +
                    encodeURIComponent(studyUuid) +
                    stringify(requestParam, { addQueryPrefix: true })
            );
        },
        [studyUuid, history, onChangeTab, dispatch]
    );

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
                user={user}
                appsAndUrls={appsAndUrls}
                onThemeClick={handleChangeTheme}
                onAboutClick={() => console.debug('about')}
                theme={themeLocal}
                onEquipmentLabellingClick={handleChangeUseName}
                equipmentLabelling={useNameLocal}
                withElementsSearch={Boolean(studyUuid)}
                searchingLabel={intl.formatMessage({
                    id: 'equipment_search/label',
                })}
                onSearchTermChange={searchMatchingEquipments}
                onSelectionChange={showVoltageLevelDiagram}
                elementsFound={equipmentsFound}
                renderElement={renderEquipmentForSearchBar(
                    equipmentClasses,
                    intl
                )}
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
