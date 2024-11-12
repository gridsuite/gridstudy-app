/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { lighten, darken, Theme } from '@mui/material/styles';
import { EditableTitle } from '../editable-title';
import { useDispatch, useSelector } from 'react-redux';

import { setEventScenarioDrawerOpen } from '../../../../redux/actions';
import { useIntl } from 'react-intl';
import { AppState } from '../../../../redux/reducer';
import EventModificationScenarioEditor from './event-modification-scenario-editor';
import { Box } from '@mui/material';
import { AppDispatch } from '../../../../redux/store';

const styles = {
    paper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        background: (theme: Theme) =>
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2),
    },
};

export interface ScenarioEditorProps {}

const ScenarioEditor = (props: ScenarioEditorProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);

    const intl = useIntl();
    const closeEventScenarioDrawer = () => {
        dispatch(setEventScenarioDrawerOpen(false));
    };

    return (
        <Box sx={styles.paper}>
            <EditableTitle
                name={
                    intl.formatMessage({
                        id: 'DynamicSimulationEventScenario',
                    }) + ` (${currentTreeNode?.data?.label})`
                }
                onClose={closeEventScenarioDrawer}
            />
            <EventModificationScenarioEditor />
        </Box>
    );
};

export default ScenarioEditor;
