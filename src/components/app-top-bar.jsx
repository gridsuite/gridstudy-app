/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    ElementSearchDialog,
    EquipmentItem,
    equipmentStyles,
    LIGHT_THEME,
    logout,
    OverflowableText,
    TagRenderer,
    TopBar,
    fetchAppsAndUrls,
} from '@gridsuite/commons-ui';
import GridStudyLogoLight from '../images/GridStudy_logo_light.svg?react';
import GridStudyLogoDark from '../images/GridStudy_logo_dark.svg?react';
import { StudyView } from './study-pane';
import {
    Badge,
    Box,
    Button,
    IconButton,
    Tab,
    Tabs,
    Tooltip,
} from '@mui/material';
import {
    GpsFixed as GpsFixedIcon,
    Search,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
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
import {
    DiagramType,
    NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS,
    useDiagram,
} from './diagrams/diagram-common';
import { isNodeBuilt, isNodeReadOnly } from './graph/util/model-functions';
import { useParameterState } from './dialogs/parameters/parameters';
import { useSearchMatchingEquipments } from './utils/search-matching-equipments';
import { getServersInfos } from '../services/study';
import { fetchNetworkElementInfos } from '../services/study/network';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from './utils/equipment-types';
import { fetchVersion } from '../services/utils';
import { RunButtonContainer } from './run-button-container';
import { useComputationResultsCount } from '../hooks/use-computation-results-count';

import { Settings } from '@mui/icons-material';

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

const STUDY_VIEWS = [
    StudyView.MAP,
    StudyView.SPREADSHEET,
    StudyView.RESULTS,
    StudyView.LOGS,
    StudyView.PARAMETERS,
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
    } else {
        return (
            <TagRenderer
                styles={equipmentStyles}
                props={props}
                element={element}
            />
        );
    }
};

const AppTopBar = ({ user, tabIndex, onChangeTab, userManager }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const { openDiagramView } = useDiagram();

    const theme = useSelector((state) => state[PARAM_THEME]);
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    const studyIndexationStatus = useSelector(
        (state) => state.studyIndexationStatus
    );

    const [appsAndUrls, setAppsAndUrls] = useState([]);

    const notificationsCount = useComputationResultsCount();
    const [languageLocal, handleChangeLanguage] =
        useParameterState(PARAM_LANGUAGE);
    const [useNameLocal, handleChangeUseName] =
        useParameterState(PARAM_USE_NAME);

    const [isDialogSearchOpen, setDialogSearchOpen] = useState(false);

    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);

    const [searchMatchingEquipments, equipmentsFound] =
        useSearchMatchingEquipments(studyUuid, currentNode?.id);

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
        if (user) {
            const openSearch = (e) => {
                if (
                    e.ctrlKey &&
                    e.shiftKey &&
                    (e.key === 'F' || e.key === 'f')
                ) {
                    e.preventDefault();
                    setDialogSearchOpen(true);
                }
            };
            document.addEventListener('keydown', openSearch);
            return () => document.removeEventListener('keydown', openSearch);
        }
    }, [user]);

    function getDisableReason() {
        if (studyDisplayMode === STUDY_DISPLAY_MODE.TREE) {
            return intl.formatMessage({
                id: 'UnsupportedView',
            });
        } else if (!isNodeBuilt(currentNode)) {
            return intl.formatMessage({
                id: 'InvalidNode',
            });
        } else if (studyIndexationStatus !== STUDY_INDEXATION_STATUS.INDEXED) {
            return intl.formatMessage({
                id: 'waitingStudyIndexation',
            });
        } else {
            return '';
        }
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
                onLogoutClick={() => logout(dispatch, userManager.instance)}
                user={user}
                appsAndUrls={appsAndUrls}
                onThemeClick={handleChangeTheme}
                appVersion={AppPackage.version}
                appLicense={AppPackage.license}
                globalVersionPromise={() =>
                    fetchVersion().then((res) => res?.deployVersion)
                }
                additionalModulesPromise={getServersInfos}
                theme={themeLocal}
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
                                currentNode?.data?.label === 'Root'
                                    ? intl.formatMessage({ id: 'root' })
                                    : currentNode?.data?.label
                            }
                        />
                    </Box>
                )}
                {user && studyUuid && (
                    <Box sx={styles.boxContent}>
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
                                let style;
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
                                } else if (tabName === StudyView.PARAMETERS) {
                                    label = <Settings />;
                                    style = { minWidth: 'initial' };
                                } else {
                                    label = <FormattedMessage id={tabName} />;
                                }
                                return (
                                    <Tab
                                        sx={style}
                                        key={tabName}
                                        label={label}
                                    />
                                );
                            })}
                        </Tabs>
                        <Box sx={styles.searchButton}>
                            <Tooltip
                                title={
                                    <FormattedMessage id="equipment_search/label" />
                                }
                            >
                                <Button
                                    color="inherit"
                                    size="large"
                                    onClick={() => setDialogSearchOpen(true)}
                                >
                                    <Search />
                                </Button>
                            </Tooltip>
                        </Box>
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
                    </Box>
                )}
            </TopBar>

            {studyUuid && (
                <>
                    <ElementSearchDialog
                        open={isDialogSearchOpen}
                        onClose={() => setDialogSearchOpen(false)}
                        searchingLabel={intl.formatMessage({
                            id: 'equipment_search/label',
                        })}
                        onSearchTermChange={searchMatchingEquipments}
                        onSelectionChange={(element) => {
                            setDialogSearchOpen(false);
                            showVoltageLevelDiagram(element);
                        }}
                        elementsFound={equipmentsFound}
                        renderElement={(props) => (
                            <EquipmentItem
                                styles={equipmentStyles}
                                {...props}
                                key={'ei-' + props.element.key}
                                suffixRenderer={CustomSuffixRenderer}
                            />
                        )}
                        searchTermDisabled={getDisableReason() !== ''}
                        searchTermDisableReason={getDisableReason()}
                    />
                </>
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
