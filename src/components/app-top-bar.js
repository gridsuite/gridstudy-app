/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
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
import PropTypes from 'prop-types';
import {
    addLoadflowNotif,
    addSANotif,
    addSensiNotif,
    addShortCircuitNotif,
    addDynamicSimulationNotif,
    centerOnSubstation,
    openDiagram,
    resetLoadflowNotif,
    resetSANotif,
    resetSensiNotif,
    resetShortCircuitNotif,
    resetDynamicSimulationNotif,
    STUDY_DISPLAY_MODE,
    addVoltageInitNotif,
    resetVoltageInitNotif,
} from '../redux/actions';
import IconButton from '@mui/material/IconButton';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
    DiagramType,
    useDiagram,
    NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS,
} from './diagrams/diagram-common';
import { isNodeBuilt } from './graph/util/model-functions';
import Parameters, { useParameterState } from './dialogs/parameters/parameters';
import { useSearchMatchingEquipments } from './utils/search-matching-equipments';
import { ComputingType } from './computing-status/computing-type';
import { RunningStatus } from './utils/running-status';
import { fetchNetworkElementInfos } from '../services/study/network';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from './utils/equipment-types';
import { fetchAppsAndUrls } from '../services/utils';

const styles = {
    tabs: {
        flexGrow: 1,
    },
    label: (theme) => ({
        color: theme.palette.primary.main,
        margin: theme.spacing(1.5),
        fontWeight: 'bold',
    }),
};

const STUDY_VIEWS = [
    StudyView.MAP,
    StudyView.SPREADSHEET,
    StudyView.RESULTS,
    StudyView.LOGS,
];

const CustomSuffixRenderer = ({ props, element }) => {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const networkAreaDiagramNbVoltageLevels = useSelector(
        (state) => state.networkAreaDiagramNbVoltageLevels
    );
    const networkAreaDiagramDepth = useSelector(
        (state) => state.networkAreaDiagramDepth
    );

    const centerOnSubstationCB = useCallback(
        (e, element) => {
            e.stopPropagation();
            if (!studyUuid || !currentNode) {
                return;
            }
            let substationIdPromise;
            if (element.type === EQUIPMENT_TYPES.SUBSTATION) {
                substationIdPromise = Promise.resolve(element.id);
            } else {
                substationIdPromise = fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
                    EQUIPMENT_INFOS_TYPES.LIST.type,
                    element.id,
                    true
                ).then((vl) => vl.substationId);
            }
            substationIdPromise.then((substationId) => {
                dispatch(centerOnSubstation(substationId));
                props.onClose && props.onClose();
                e.stopPropagation();
            });
        },
        [dispatch, props, studyUuid, currentNode]
    );

    const openNetworkAreaDiagramCB = useCallback(
        (e, element) => {
            dispatch(openDiagram(element.id, DiagramType.NETWORK_AREA_DIAGRAM));
            props.onClose && props.onClose();
            e.stopPropagation();
        },
        [dispatch, props]
    );

    if (
        element.type === EQUIPMENT_TYPES.SUBSTATION ||
        element.type === EQUIPMENT_TYPES.VOLTAGE_LEVEL
    ) {
        return (
            <>
                {element.type === EQUIPMENT_TYPES.VOLTAGE_LEVEL && (
                    <IconButton
                        disabled={
                            networkAreaDiagramNbVoltageLevels >
                                NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS &&
                            networkAreaDiagramDepth !== 0
                        }
                        onClick={(e) => openNetworkAreaDiagramCB(e, element)}
                        size={'small'}
                    >
                        <TimelineIcon fontSize={'small'} />
                    </IconButton>
                )}
                <IconButton
                    disabled={
                        (!studyUuid || !currentNode) &&
                        element.type !== EQUIPMENT_TYPES.SUBSTATION
                    }
                    onClick={(e) => centerOnSubstationCB(e, element)}
                    size={'small'}
                >
                    <GpsFixedIcon fontSize={'small'} />
                </IconButton>
            </>
        );
    }

    return (
        <TagRenderer styles={equipmentStyles} props={props} element={element} />
    );
};

const AppTopBar = ({ user, tabIndex, onChangeTab, userManager }) => {
    const dispatch = useDispatch();

    const intl = useIntl();

    const [appsAndUrls, setAppsAndUrls] = useState([]);

    const loadflowNotif = useSelector((state) => state.loadflowNotif);

    const saNotif = useSelector((state) => state.saNotif);

    const sensiNotif = useSelector((state) => state.sensiNotif);

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

    const voltageInitNotif = useSelector((state) => state.voltageInitNotif);

    const dynamicSimulationNotif = useSelector(
        (state) => state.dynamicSimulationNotif
    );

    const theme = useSelector((state) => state[PARAM_THEME]);

    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);

    const [languageLocal, handleChangeLanguage] =
        useParameterState(PARAM_LANGUAGE);

    const [useNameLocal, handleChangeUseName] =
        useParameterState(PARAM_USE_NAME);

    const studyUuid = useSelector((state) => state.studyUuid);

    const currentNode = useSelector((state) => state.currentTreeNode);

    const [isParametersOpen, setParametersOpen] = useState(false);
    const { openDiagramView } = useDiagram();

    const [searchMatchingEquipments, equipmentsFound] =
        useSearchMatchingEquipments(studyUuid, currentNode?.id);

    const loadFlowStatus = useSelector(
        (state) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const securityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const sensitivityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const shortCircuitAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SHORTCIRCUIT_ANALYSIS]
    );

    const dynamicSimulationStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const voltageInitStatus = useSelector(
        (state) => state.computingStatus[ComputingType.VOLTAGE_INIT]
    );

    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);

    const showVoltageLevelDiagram = useCallback(
        // TODO code factorization for displaying a VL via a hook
        (optionInfos) => {
            onChangeTab(STUDY_VIEWS.indexOf(StudyView.MAP)); // switch to map view
            if (optionInfos.type === EQUIPMENT_TYPES.SUBSTATION) {
                openDiagramView(optionInfos.id, DiagramType.SUBSTATION);
            } else {
                openDiagramView(
                    optionInfos.voltageLevelId,
                    DiagramType.VOLTAGE_LEVEL
                );
            }
        },
        [onChangeTab, openDiagramView]
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
            (loadFlowStatus === RunningStatus.SUCCEED ||
                loadFlowStatus === RunningStatus.FAILED)
        ) {
            dispatch(addLoadflowNotif());
        } else {
            dispatch(resetLoadflowNotif());
        }
    }, [currentNode, dispatch, loadFlowStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            (securityAnalysisStatus === RunningStatus.SUCCEED ||
                securityAnalysisStatus === RunningStatus.FAILED)
        ) {
            dispatch(addSANotif());
        } else {
            dispatch(resetSANotif());
        }
    }, [currentNode, dispatch, securityAnalysisStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            sensitivityAnalysisStatus === RunningStatus.SUCCEED
        ) {
            dispatch(addSensiNotif());
        } else {
            dispatch(resetSensiNotif());
        }
    }, [currentNode, dispatch, sensitivityAnalysisStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            shortCircuitAnalysisStatus === RunningStatus.SUCCEED
        ) {
            dispatch(addShortCircuitNotif());
        } else {
            dispatch(resetShortCircuitNotif());
        }
    }, [currentNode, dispatch, shortCircuitAnalysisStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            (dynamicSimulationStatus === RunningStatus.SUCCEED ||
                dynamicSimulationStatus === RunningStatus.FAILED)
        ) {
            dispatch(addDynamicSimulationNotif());
        } else {
            dispatch(resetDynamicSimulationNotif());
        }
    }, [currentNode, dispatch, dynamicSimulationStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            (voltageInitStatus === RunningStatus.SUCCEED ||
                voltageInitStatus === RunningStatus.FAILED)
        ) {
            dispatch(addVoltageInitNotif());
        } else {
            dispatch(resetVoltageInitNotif());
        }
    }, [currentNode, dispatch, voltageInitStatus, tabIndex, user]);

    function showParameters() {
        setParametersOpen(true);
    }

    function hideParameters() {
        setParametersOpen(false);
    }

    function getDisableReason() {
        if (studyDisplayMode === STUDY_DISPLAY_MODE.TREE) {
            return intl.formatMessage({
                id: 'UnsupportedView',
            });
        }

        if (!isNodeBuilt(currentNode)) {
            return intl.formatMessage({
                id: 'InvalidNode',
            });
        }
        return '';
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
                        styles={equipmentStyles}
                        {...props}
                        key={'ei' + props.element.key}
                        suffixRenderer={CustomSuffixRenderer}
                    />
                )}
                onLanguageClick={handleChangeLanguage}
                language={languageLocal}
                searchTermDisabled={getDisableReason() !== ''}
                initialSearchTerm={getDisableReason()}
            >
                {/* Add current Node name between Logo and Tabs */}
                <Box
                    width="15%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderColor={'#123456'}
                >
                    {/* TODO : temporary fix (remove user and manage disconnection in a hook?) */}
                    {currentNode && user && (
                        <OverflowableText
                            sx={styles.label}
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
                        sx={styles.tabs}
                    >
                        {STUDY_VIEWS.map((tabName) => {
                            let label;
                            if (
                                tabName === StudyView.RESULTS &&
                                (loadflowNotif ||
                                    saNotif ||
                                    sensiNotif ||
                                    shortCircuitNotif ||
                                    dynamicSimulationNotif ||
                                    voltageInitNotif)
                            ) {
                                label = (
                                    <Badge
                                        badgeContent={
                                            loadflowNotif +
                                            saNotif +
                                            sensiNotif +
                                            shortCircuitNotif +
                                            dynamicSimulationNotif +
                                            voltageInitNotif
                                        }
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
            {studyUuid && (
                <Parameters
                    isParametersOpen={isParametersOpen}
                    hideParameters={hideParameters}
                    user={user}
                />
            )}
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
