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
    EquipmentItem,
    TagRenderer,
    TopBar,
} from '@gridsuite/commons-ui';
import { ReactComponent as GridStudyLogoLight } from '../images/GridStudy_logo_light.svg';
import { ReactComponent as GridStudyLogoDark } from '../images/GridStudy_logo_dark.svg';
import Tabs from '@mui/material/Tabs';
import { StudyView } from './study-pane';
import { Badge } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import Tab from '@mui/material/Tab';
import Parameters, { useParameterState } from './parameters';
import {
    PARAM_LANGUAGE,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppsAndUrls, fetchEquipmentsInfos } from '../utils/rest-api';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { centerOnSubstation } from '../redux/actions';
import { useSnackbar } from 'notistack';
import IconButton from '@mui/material/IconButton';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { useSingleLineDiagram } from './singleLineDiagram/utils';

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

const useEquipmentStyles = makeStyles(equipmentStyles);

const CustomSuffixRenderer = ({ props, element }) => {
    const dispatch = useDispatch();
    const equipmentClasses = useEquipmentStyles();
    const network = useSelector((state) => state.network);

    const enterOnSubstationCB = useCallback(
        (e, element) => {
            const substationId =
                element.type === EQUIPMENT_TYPE.SUBSTATION.name
                    ? element.id
                    : network.getVoltageLevel(element.id).substationId;
            dispatch(centerOnSubstation(substationId));
            props.onClose && props.onClose();
            e.stopPropagation();
        },
        [dispatch, props, network]
    );

    if (
        element.type === EQUIPMENT_TYPE.SUBSTATION.name ||
        element.type === EQUIPMENT_TYPE.VOLTAGE_LEVEL.name
    )
        return (
            <IconButton
                onClick={(e) => enterOnSubstationCB(e, element)}
                size={'small'}
            >
                <GpsFixedIcon fontSize={'small'} />
            </IconButton>
        );

    return (
        <TagRenderer
            classes={equipmentClasses}
            props={props}
            element={element}
        />
    );
};

const AppTopBar = ({ user, tabIndex, onChangeTab, userManager }) => {
    const classes = useStyles();

    const equipmentClasses = useEquipmentStyles();

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
    const [, showVoltageLevel, showSubstation] = useSingleLineDiagram();
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
            onChangeTab(STUDY_VIEWS.indexOf(StudyView.MAP)); // switch to map view
            if (optionInfos.type === EQUIPMENT_TYPE.SUBSTATION.name) {
                showSubstation(optionInfos.id);
            } else {
                showVoltageLevel(optionInfos.voltageLevelId);
            }
        },
        [onChangeTab, showSubstation, showVoltageLevel]
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
                renderElement={(props) => (
                    <EquipmentItem
                        classes={equipmentClasses}
                        key={'ei' + props.element.key}
                        {...props}
                        suffixRenderer={CustomSuffixRenderer}
                    />
                )}
                onLanguageClick={handleChangeLanguage}
                language={languageLocal}
            >
                {studyUuid && (
                    <Tabs
                        value={tabIndex}
                        variant="scrollable"
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
