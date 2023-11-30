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
import AppPackage from '../../package.json';
import {
    centerOnSubstation,
    openDiagram,
    STUDY_DISPLAY_MODE,
    STUDY_INDEXATION_STATUS,
} from '../redux/actions';
import IconButton from '@mui/material/IconButton';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
    DiagramType,
    useDiagram,
    NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS,
} from './diagrams/diagram-common';
import { isNodeBuilt, isNodeReadOnly } from './graph/util/model-functions';
import Parameters, { useParameterState } from './dialogs/parameters/parameters';
import { useSearchMatchingEquipments } from './utils/search-matching-equipments';
import { getServersInfos } from '../services/study';
import { fetchNetworkElementInfos } from '../services/study/network';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from './utils/equipment-types';
import { fetchAppsAndUrls, fetchVersion } from '../services/utils';
import { RunButtonContainer } from './run-button-container';
import { useComputationNotificationCount } from '../hooks/use-computation-notification-count';
import { useComputationNotification } from '../hooks/use-computation-notification';

const styles = {
    tabs: {
        flexGrow: 1,
    },
    label: (theme) => ({
        color: theme.palette.primary.main,
        margin: theme.spacing(1.5),
        fontWeight: 'bold',
    }),
    runButtonContainer: {
        marginRight: '10%',
        marginTop: '4px',
        flexShrink: 0,
    },
    boxContent: { display: 'flex', width: '100%' },
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

    const notificationsCount = useComputationNotificationCount();

    const theme = useSelector((state) => state[PARAM_THEME]);

    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);

    const [languageLocal, handleChangeLanguage] =
        useParameterState(PARAM_LANGUAGE);

    const [useNameLocal, handleChangeUseName] =
        useParameterState(PARAM_USE_NAME);

    const studyUuid = useSelector((state) => state.studyUuid);

    const currentNode = useSelector((state) => state.currentTreeNode);

    const [isParametersOpen, setParametersOpen] = useState(false);

    const getterGlobalVersion = useCallback((setGlobalVersion) => {
        fetchVersion().then((res) => setGlobalVersion(res.deployVersion));
    }, []);

    const { openDiagramView } = useDiagram();

    const [searchMatchingEquipments, equipmentsFound] =
        useSearchMatchingEquipments(studyUuid, currentNode?.id);

    useComputationNotification();

    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);

    const studyIndexationStatus = useSelector(
        (state) => state.studyIndexationStatus
    );

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

        if (studyIndexationStatus !== STUDY_INDEXATION_STATUS.INDEXED) {
            return intl.formatMessage({
                id: 'waitingStudyIndexation',
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
                onParametersClick={() => setParametersOpen(true)}
                onLogoutClick={() => logout(dispatch, userManager.instance)}
                user={user}
                appsAndUrls={appsAndUrls}
                onThemeClick={handleChangeTheme}
                appVersion={AppPackage.version}
                appLicense={AppPackage.license}
                getGlobalVersion={(setGlobalVersion) =>
                    fetchVersion()
                        .then((res) => setGlobalVersion(res.deployVersion))
                        .catch((reason) => setGlobalVersion(null))
                }
                getAdditionalComponents={(setServers) =>
                    getServersInfos()
                        .then((res) =>
                            setServers(
                                Object.entries(res).map(([name, infos]) => ({
                                    name:
                                        infos?.build?.name ||
                                        infos?.build?.artifact ||
                                        name,
                                    type: 'server',
                                    version: infos?.build?.version,
                                    gitTag:
                                        infos?.git?.tags ||
                                        infos?.git?.commit?.id[
                                            'describe-short'
                                        ],
                                }))
                            )
                        )
                        .catch((reason) => setServers(null))
                }
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
                searchTermDisableReason={getDisableReason()}
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
                                    ? intl.formatMessage({ id: 'root' })
                                    : currentNode?.data?.label
                            }
                        />
                    )}
                </Box>
                <Box sx={styles.boxContent}>
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
                                    notificationsCount > 0
                                ) {
                                    label = (
                                        <Badge
                                            badgeContent={notificationsCount}
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
                    {studyUuid && (
                        <Box sx={styles.runButtonContainer}>
                            <RunButtonContainer
                                studyUuid={studyUuid}
                                currentNode={currentNode}
                                disabled={
                                    !isNodeBuilt(currentNode) ||
                                    isNodeReadOnly(currentNode)
                                }
                            />
                        </Box>
                    )}
                </Box>
            </TopBar>

            {studyUuid && (
                <Parameters
                    isParametersOpen={isParametersOpen}
                    hideParameters={() => setParametersOpen(false)}
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
