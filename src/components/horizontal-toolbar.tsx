/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { StudyDisplayMode } from './network-modification.type';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import StudyPathBreadcrumbs from './breadcrumbs/study-path-breadcrumbs';
import { STUDY_VIEWS, StudyView } from './utils/utils.js';
import useStudyPath from '../hooks/use-study-path.js';
import { AppState } from '../redux/reducer';
import { Box, Grid, Theme, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { DeviceHubIcon, TuneIcon, PhotoLibraryIcon, OverflowableText } from '@gridsuite/commons-ui';
import { useDisplayModes } from '../hooks/use-display-modes';
import { useEffect } from 'react';
const styles = {
    horizontalToolbar: (theme: Theme) => ({
        backgroundColor: theme.palette.toolbarBackground,
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
    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);

    const { studyName, parentDirectoriesNames } = useStudyPath(studyUuid);
    const { onViewModeChange, applyModes } = useDisplayModes();

    useEffect(() => {
        if (!enableDeveloperMode) {
            if (toggleOptions.includes(StudyDisplayMode.EVENT_SCENARIO)) {
                applyModes(toggleOptions.filter((option) => option !== StudyDisplayMode.EVENT_SCENARIO));
            }
        }
    }, [enableDeveloperMode, toggleOptions, applyModes]);

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
                    <Box sx={styles.toggle} gap={1}>
                        <OverflowableText text={intl.formatMessage({ id: 'Display' })} />

                        <ToggleButtonGroup
                            value={toggleOptions}
                            onChange={onViewModeChange}
                            aria-label="view modes"
                            size="small"
                        >
                            <Tooltip title={<FormattedMessage id={'Tree'} />}>
                                <ToggleButton value={StudyDisplayMode.TREE}>
                                    <DeviceHubIcon />
                                </ToggleButton>
                            </Tooltip>
                            <Tooltip title={<FormattedMessage id={'modifications'} />}>
                                <ToggleButton
                                    value={StudyDisplayMode.MODIFICATIONS}
                                    disabled={currentNode === null || currentNode?.type !== 'NETWORK_MODIFICATION'}
                                >
                                    <TuneIcon />
                                </ToggleButton>
                            </Tooltip>
                            {enableDeveloperMode && (
                                <Tooltip title={<FormattedMessage id={'DynamicSimulation'} />}>
                                    <ToggleButton
                                        value={StudyDisplayMode.EVENT_SCENARIO}
                                        disabled={currentNode === null || currentNode?.type !== 'NETWORK_MODIFICATION'}
                                    >
                                        <OfflineBoltOutlinedIcon fontSize="small" />
                                    </ToggleButton>
                                </Tooltip>
                            )}
                            <Tooltip title={<FormattedMessage id={'images'} />}>
                                <ToggleButton value={StudyDisplayMode.DIAGRAM_GRID_LAYOUT}>
                                    <PhotoLibraryIcon />
                                </ToggleButton>
                            </Tooltip>
                        </ToggleButtonGroup>
                    </Box>
                </List>
            </Grid>
        </Grid>
    );
}

export default HorizontalToolbar;
