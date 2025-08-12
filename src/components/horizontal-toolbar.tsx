/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { setEventScenarioDrawerOpen } from '../redux/actions';
import { TOOLTIP_DELAY } from '../utils/UIconstants';
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { StudyDisplayMode } from './network-modification.type';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import StudyPathBreadcrumbs from './breadcrumbs/study-path-breadcrumbs';
import { Box, darken, Grid, Theme } from '@mui/material';
import { STUDY_VIEWS, StudyView } from './utils/utils.js';
import useStudyPath from '../hooks/use-study-path.js';
import { AppState } from '../redux/reducer';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DeviceHubIcon, TuneIcon, PhotoLibraryIcon, OverflowableText } from '@gridsuite/commons-ui';
import { useDisplayModes } from '../hooks/use-display-modes';
const styles = {
    horizontalToolbar: (theme: Theme) => ({
        backgroundColor: darken(theme.palette.background.paper, 0.2),
    }),
    selected: (theme: Theme) => ({
        color: theme.palette.action.active,
    }),
    notSelected: (theme: Theme) => ({
        color: theme.palette.action.disabled,
    }),
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
        display: 'flex',
        flexDirection: 'row',
    },
    toggle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '10px',
    },
};

export function HorizontalToolbar() {
    const intl = useIntl();
    const dispatch = useDispatch();
    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);

    const { studyName, parentDirectoriesNames } = useStudyPath(studyUuid);
    const isEventScenarioDrawerOpen = useSelector((state: AppState) => state.isEventScenarioDrawerOpen);
    const { onViewModeChange, applyModes } = useDisplayModes();

    const toggleEventScenarioDrawer = () => {
        //if the Dynamic SimulationEvent Scenario is clicked we need to hide the modifications
        if (toggleOptions.includes(StudyDisplayMode.MODIFICATIONS)) {
            const options = toggleOptions.filter((option) => option !== StudyDisplayMode.MODIFICATIONS);
            applyModes(options);
        }
        dispatch(setEventScenarioDrawerOpen(!isEventScenarioDrawerOpen));
    };

    return (
        <Grid container alignItems="center" sx={styles.horizontalToolbar}>
            <Grid sx={{ marginRight: 'auto', marginLeft: '20px' }}>
                <StudyPathBreadcrumbs studyName={studyName} parentDirectoriesNames={parentDirectoriesNames} />
            </Grid>
            <Grid
                sx={{
                    marginLeft: 'auto',
                    marginRight: '20px',
                    visibility: STUDY_VIEWS?.[appTabIndex] !== StudyView.TREE ? 'hidden' : 'visible',
                }}
            >
                <List
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    {enableDeveloperMode && (
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'DynamicSimulationEventScenario',
                            })}
                            placement="right"
                            arrow
                            enterDelay={TOOLTIP_DELAY}
                            enterNextDelay={TOOLTIP_DELAY}
                            slotProps={{
                                popper: {
                                    sx: {
                                        '& .MuiTooltip-tooltip': styles.tooltip,
                                    },
                                },
                            }}
                            style={{
                                marginRight: '8px',
                            }}
                        >
                            <span>
                                <IconButton
                                    size={'small'}
                                    sx={isEventScenarioDrawerOpen ? styles.selected : styles.notSelected}
                                    disabled={currentNode === null || currentNode?.type !== 'NETWORK_MODIFICATION'}
                                    onClick={toggleEventScenarioDrawer}
                                >
                                    <OfflineBoltOutlinedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                    <Box sx={styles.toggle} gap={1}>
                        <OverflowableText text={intl.formatMessage({ id: 'Display' })} />

                        <ToggleButtonGroup
                            value={toggleOptions}
                            onChange={onViewModeChange}
                            aria-label="view modes"
                            size="small"
                        >
                            <ToggleButton value={StudyDisplayMode.TREE}>
                                <DeviceHubIcon />
                            </ToggleButton>
                            <ToggleButton value={StudyDisplayMode.MODIFICATIONS}>
                                <TuneIcon />
                            </ToggleButton>
                            <ToggleButton value={StudyDisplayMode.DIAGRAM_GRID_LAYOUT}>
                                <PhotoLibraryIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </List>
            </Grid>
        </Grid>
    );
}

export default HorizontalToolbar;
