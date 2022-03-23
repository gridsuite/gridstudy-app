/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import List from '@material-ui/core/List';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import PublicIcon from '@material-ui/icons/Public';
import IconButton from '@material-ui/core/IconButton';
import ListIcon from '@material-ui/icons/List';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { StudyDisplayMode } from './study-pane';
import Divider from '@material-ui/core/Divider';
import {
    setExplorerDrawerOpen,
    setModificationsDrawerOpen,
} from '../redux/actions';

const useStyles = makeStyles((theme) => ({
    selected: {
        color: theme.palette.action.active,
    },
    notSelected: {
        color: theme.palette.action.disabled,
    },
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
        display: 'flex',
        flexDirection: 'row',
    },
}));

const DELAY = 1000;

export function HorizontalToolbar({ setStudyDisplayMode, studyDisplayMode }) {
    const classes = useStyles();
    const intl = useIntl();
    const dispatch = useDispatch();

    const selectedTreeNode = useSelector((state) => state.selectedTreeNode);

    const isExplorerDrawerOpen = useSelector(
        (state) => state.isExplorerDrawerOpen
    );
    const isModificationsDrawerOpen = useSelector(
        (state) => state.isModificationsDrawerOpen
    );

    const toggleExplorerDrawer = () => {
        dispatch(setExplorerDrawerOpen(!isExplorerDrawerOpen));
    };

    const toggleModificationsDrawer = () => {
        dispatch(setModificationsDrawerOpen(!isModificationsDrawerOpen));
    };

    function setMapDisplay() {
        setStudyDisplayMode(StudyDisplayMode.MAP);
    }

    function setTreeDisplay() {
        setStudyDisplayMode(StudyDisplayMode.TREE);
    }

    function setHybridDisplay() {
        setStudyDisplayMode(StudyDisplayMode.HYBRID);
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
            {!(studyDisplayMode === StudyDisplayMode.TREE) && (
                <>
                    <Tooltip
                        title={intl.formatMessage({ id: 'SubstationList' })}
                        placement="right"
                        arrow
                        enterDelay={DELAY}
                        enterNextDelay={DELAY}
                        classes={{ tooltip: classes.tooltip }}
                        style={{
                            marginRight: '20px',
                            marginLeft: '20px',
                        }}
                    >
                        <IconButton
                            size={'small'}
                            className={
                                isExplorerDrawerOpen
                                    ? classes.selected
                                    : classes.notSelected
                            }
                            onClick={toggleExplorerDrawer}
                        >
                            <LinearScaleIcon />
                        </IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem />
                </>
            )}
            <Tooltip
                title={intl.formatMessage({ id: 'NetworkModifications' })}
                placement="right"
                arrow
                enterDelay={DELAY}
                enterNextDelay={DELAY}
                classes={{ tooltip: classes.tooltip }}
                style={{
                    marginRight: '20px',
                    marginLeft: '20px',
                }}
            >
                <IconButton
                    size={'small'}
                    className={
                        isModificationsDrawerOpen
                            ? classes.selected
                            : classes.notSelected
                    }
                    disabled={
                        selectedTreeNode === null ||
                        selectedTreeNode.type !== 'NETWORK_MODIFICATION'
                    }
                    onClick={toggleModificationsDrawer}
                >
                    <ListIcon />
                </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip
                title={intl.formatMessage({ id: 'NetworkModificationTree' })}
                placement="right"
                arrow
                enterDelay={DELAY}
                enterNextDelay={DELAY}
                classes={{ tooltip: classes.tooltip }}
                style={{
                    marginLeft: '20px',
                    marginRight: '8px',
                }}
            >
                <IconButton
                    size={'small'}
                    className={
                        studyDisplayMode === StudyDisplayMode.TREE
                            ? classes.selected
                            : classes.notSelected
                    }
                    onClick={setTreeDisplay}
                >
                    <AccountTreeIcon />
                </IconButton>
            </Tooltip>

            <Tooltip
                title={intl.formatMessage({ id: 'HybridDisplay' })}
                placement="right"
                arrow
                enterDelay={DELAY}
                enterNextDelay={DELAY}
                classes={{ tooltip: classes.tooltip }}
                style={{
                    marginRight: '8px',
                }}
            >
                <IconButton
                    size={'small'}
                    className={
                        studyDisplayMode === StudyDisplayMode.HYBRID
                            ? classes.selected
                            : classes.notSelected
                    }
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
                enterDelay={DELAY}
                enterNextDelay={DELAY}
                classes={{ tooltip: classes.tooltip }}
                style={{
                    marginRight: '8px',
                }}
            >
                <IconButton
                    size={'small'}
                    className={
                        studyDisplayMode === StudyDisplayMode.MAP
                            ? classes.selected
                            : classes.notSelected
                    }
                    onClick={setMapDisplay}
                >
                    <PublicIcon />
                </IconButton>
            </Tooltip>
        </List>
    );
}

HorizontalToolbar.propTypes = {
    setStudyDisplayMode: PropTypes.func,
    studyDisplayMode: PropTypes.string,
};

export default HorizontalToolbar;
