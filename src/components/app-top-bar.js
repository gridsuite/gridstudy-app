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
    LIGHT_THEME,
    logout,
    EquipmentItem,
    TagRenderer,
    TopBar,
    OverflowableText,
} from '@gridsuite/commons-ui';
import { ReactComponent as GridStudyLogoLight } from '../images/GridStudy_logo_light.svg';
import { ReactComponent as GridStudyLogoDark } from '../images/GridStudy_logo_dark.svg';
import Tabs from '@mui/material/Tabs';
import { StudyView } from './study-pane';
import { Badge, Box } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import Tab from '@mui/material/Tab';
import {
    PARAM_LANGUAGE,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAppsAndUrls,
    fetchLoadFlowInfos,
    fetchSecurityAnalysisStatus,
} from '../utils/rest-api';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import {
    addLoadflowNotif,
    addSANotif,
    centerOnSubstation,
    openNetworkAreaDiagram,
    resetLoadflowNotif,
    resetSANotif,
} from '../redux/actions';
import IconButton from '@mui/material/IconButton';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useSingleLineDiagram } from './diagrams/singleLineDiagram/utils';
import { isNodeBuilt } from './graph/util/model-functions';
import { useNodeData } from './study-container';
import Parameters, { useParameterState } from './dialogs/parameters/parameters';
import { useSearchMatchingEquipments } from './util/search-matching-equipments';

const useStyles = makeStyles((theme) => ({
    tabs: {
        flexGrow: 1,
    },
    label: {
        color: theme.palette.primary.main,
        margin: theme.spacing(1.5),
        fontWeight: 'bold',
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

    const voltageLevelsIdsForNad = useSelector(
        (state) => state.voltageLevelsIdsForNad
    );

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

    const openNetworkAreaDiagramCB = useCallback(
        (e, element) => {
            dispatch(
                openNetworkAreaDiagram(
                    voltageLevelsIdsForNad.concat([element.id])
                )
            );
            props.onClose && props.onClose();
            e.stopPropagation();
        },
        [dispatch, props, voltageLevelsIdsForNad]
    );

    if (
        element.type === EQUIPMENT_TYPE.SUBSTATION.name ||
        element.type === EQUIPMENT_TYPE.VOLTAGE_LEVEL.name
    )
        return (
            <>
                {element.type === EQUIPMENT_TYPE.VOLTAGE_LEVEL.name && (
                    <IconButton
                        onClick={(e) => openNetworkAreaDiagramCB(e, element)}
                        size={'small'}
                    >
                        <TimelineIcon fontSize={'small'} />
                    </IconButton>
                )}
                <IconButton
                    onClick={(e) => enterOnSubstationCB(e, element)}
                    size={'small'}
                >
                    <GpsFixedIcon fontSize={'small'} />
                </IconButton>
            </>
        );

    return (
        <TagRenderer
            classes={equipmentClasses}
            props={props}
            element={element}
        />
    );
};

const AppTopBar = ({
    user,
    tabIndex,
    onChangeTab,
    userManager,
    securityAnalysisStatus,
}) => {
    const classes = useStyles();

    const equipmentClasses = useEquipmentStyles();

    const dispatch = useDispatch();

    const intl = useIntl();

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

    const currentNode = useSelector((state) => state.currentTreeNode);

    const [isParametersOpen, setParametersOpen] = useState(false);
    const [, showVoltageLevel, showSubstation] = useSingleLineDiagram();

    const [searchMatchingEquipments, equipmentsFound] =
        useSearchMatchingEquipments(studyUuid, currentNode?.id);
    const loadFlowStatusInvalidations = ['loadflow_status', 'loadflow'];
    const securityAnalysisStatusInvalidations = [
        'securityAnalysis_status',
        'securityAnalysis_failed',
    ];
    const [loadFlowInfosNode] = useNodeData(
        studyUuid,
        currentNode?.id,
        fetchLoadFlowInfos,
        loadFlowStatusInvalidations
    );

    const [securityAnalysisStatusNode] = useNodeData(
        studyUuid,
        currentNode?.id,
        fetchSecurityAnalysisStatus,
        securityAnalysisStatusInvalidations
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

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            loadFlowInfosNode?.loadFlowStatus !== 'NOT_DONE' &&
            loadFlowInfosNode?.loadFlowResult != null
        ) {
            dispatch(addLoadflowNotif());
        } else {
            dispatch(resetLoadflowNotif());
        }
    }, [
        currentNode,
        dispatch,
        loadFlowInfosNode?.loadFlowResult,
        loadFlowInfosNode?.loadFlowStatus,
        user,
    ]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            (securityAnalysisStatusNode === 'CONVERGED' ||
                securityAnalysisStatusNode === 'DIVERGED')
        ) {
            dispatch(addSANotif());
        } else {
            dispatch(resetSANotif());
        }
    }, [currentNode, dispatch, securityAnalysisStatusNode, user]);

    function showParameters() {
        setParametersOpen(true);
    }

    function hideParameters() {
        setParametersOpen(false);
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
                onParametersClick={showParameters}
                onLogoutClick={() => logout(dispatch, userManager.instance)}
                user={user}
                appsAndUrls={appsAndUrls}
                onThemeClick={handleChangeTheme}
                onAboutClick={() => console.debug('about')}
                theme={themeLocal}
                onEquipmentLabellingClick={handleChangeUseName}
                equipmentLabelling={useNameLocal}
                withElementsSearch={true}
                searchingLabel={intl.formatMessage({
                    id: 'equipment_search/label',
                })}
                onSearchTermChange={searchMatchingEquipments}
                onSelectionChange={showVoltageLevelDiagram}
                elementsFound={equipmentsFound}
                renderElement={(props) => (
                    <EquipmentItem
                        classes={equipmentClasses}
                        {...props}
                        key={'ei' + props.element.key}
                        suffixRenderer={CustomSuffixRenderer}
                    />
                )}
                onLanguageClick={handleChangeLanguage}
                language={languageLocal}
                searchTermDisabled={!isNodeBuilt(currentNode)}
                initialSearchTerm={
                    !isNodeBuilt(currentNode)
                        ? intl.formatMessage({
                              id: 'InvalidNode',
                          })
                        : ''
                }
            >
                {/* Add current Node name between Logo and Tabs */}
                <Box
                    width="15%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderColor={'#123456'}
                >
                    {currentNode && (
                        <OverflowableText
                            className={classes.label}
                            text={
                                currentNode?.data?.label === 'Root'
                                    ? intl.formatMessage({
                                          id: 'root',
                                      })
                                    : currentNode?.data?.label
                            }
                        />
                    )}
                </Box>
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
                isParametersOpen={isParametersOpen}
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
