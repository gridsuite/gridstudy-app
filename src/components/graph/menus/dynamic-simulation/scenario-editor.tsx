/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { lighten, darken, Theme } from '@mui/material/styles';
import NetworkModificationNodeEditor from '../network-modification-node-editor';
import { EditableTitle } from '../editable-title';
import { useDispatch, useSelector } from 'react-redux';

import { setEventScenarioDrawerOpen } from '../../../../redux/actions';
import { useIntl } from 'react-intl';
import { ReduxState } from '../../../../redux/reducer.type';

const useStyles = makeStyles((theme: Theme) => ({
    paper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        background:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2),
    },
}));

export interface ScenarioEditorProps {}

const ScenarioEditor = (props: ScenarioEditorProps) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const currentTreeNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const intl = useIntl();
    const closeEventScenarioDrawer = () => {
        dispatch(setEventScenarioDrawerOpen(false));
    };

    return (
        <div className={classes.paper}>
            <EditableTitle
                name={
                    intl.formatMessage({
                        id: 'DynamicSimulationEventScenario',
                    }) + ` (${currentTreeNode?.data?.label})`
                }
                onClose={closeEventScenarioDrawer}
            />
            <NetworkModificationNodeEditor />
        </div>
    );
};

export default ScenarioEditor;
