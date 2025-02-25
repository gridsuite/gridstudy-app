/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PublicIcon from '@mui/icons-material/Public';
import IconButton from '@mui/material/IconButton';
import ListIcon from '@mui/icons-material/List';
import Tooltip from '@mui/material/Tooltip';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import Divider from '@mui/material/Divider';
import { setModificationsDrawerOpen, setStudyDisplayMode, setEventScenarioDrawerOpen } from '../redux/actions';
import { TOOLTIP_DELAY } from '../utils/UIconstants';
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { StudyDisplayMode } from './network-modification.type';
import { useParameterState } from './dialogs/parameters/use-parameters-state';

const styles = {
    selected: (theme) => ({
        color: theme.palette.action.active,
    }),
    notSelected: (theme) => ({
        color: theme.palette.action.disabled,
    }),
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
        display: 'flex',
        flexDirection: 'row',
    },
};

export function HorizontalToolbar() {
    const intl = useIntl();
    const dispatch = useDispatch();

    const currentNode = useSelector((state) => state.currentTreeNode);
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const isModificationsDrawerOpen = useSelector((state) => state.isModificationsDrawerOpen);

    const isEventScenarioDrawerOpen = useSelector((state) => state.isEventScenarioDrawerOpen);

    const toggleModificationsDrawer = () => {
        dispatch(setModificationsDrawerOpen(!isModificationsDrawerOpen));
    };

    const toggleEventScenarioDrawer = () => {
        dispatch(setEventScenarioDrawerOpen(!isEventScenarioDrawerOpen));
    };

    function setMapDisplay() {
        dispatch(setStudyDisplayMode(StudyDisplayMode.MAP));
    }

    function setTreeDisplay() {
        dispatch(setStudyDisplayMode(StudyDisplayMode.TREE));
    }

    function setHybridDisplay() {
        dispatch(setStudyDisplayMode(StudyDisplayMode.HYBRID));
    }

    return (
        <List
            style={{
                marginLeft: 'auto',
                marginRight: '20px',
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
                            disabled={
                                studyDisplayMode === StudyDisplayMode.MAP ||
                                currentNode === null ||
                                currentNode?.type !== 'NETWORK_MODIFICATION'
                            }
                            onClick={toggleEventScenarioDrawer}
                        >
                            <OfflineBoltOutlinedIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            <Tooltip
                title={intl.formatMessage({ id: 'NetworkModifications' })}
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
                    marginRight: '20px',
                }}
            >
                <span>
                    <IconButton
                        size={'small'}
                        sx={isModificationsDrawerOpen ? styles.selected : styles.notSelected}
                        disabled={
                            studyDisplayMode === StudyDisplayMode.MAP ||
                            currentNode === null ||
                            currentNode?.type !== 'NETWORK_MODIFICATION'
                        }
                        onClick={toggleModificationsDrawer}
                    >
                        <ListIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip
                title={intl.formatMessage({ id: 'NetworkModificationTree' })}
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
                    marginLeft: '20px',
                    marginRight: '8px',
                }}
            >
                <IconButton
                    size={'small'}
                    sx={studyDisplayMode === StudyDisplayMode.TREE ? styles.selected : styles.notSelected}
                    onClick={setTreeDisplay}
                >
                    <AccountTreeIcon />
                </IconButton>
            </Tooltip>

            <Tooltip
                title={intl.formatMessage({ id: 'HybridDisplay' })}
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
                <IconButton
                    size={'small'}
                    sx={studyDisplayMode === StudyDisplayMode.HYBRID ? styles.selected : styles.notSelected}
                    onClick={setHybridDisplay}
                >
                    <AccountTreeIcon />
                    <PublicIcon />
                </IconButton>
            </Tooltip>

            <Tooltip
                title={intl.formatMessage({ id: 'Map' })}
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
                <IconButton
                    size={'small'}
                    sx={studyDisplayMode === StudyDisplayMode.MAP ? styles.selected : styles.notSelected}
                    onClick={setMapDisplay}
                >
                    <PublicIcon />
                </IconButton>
            </Tooltip>
        </List>
    );
}

export default HorizontalToolbar;
