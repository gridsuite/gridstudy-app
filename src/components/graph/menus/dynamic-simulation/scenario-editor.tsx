/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EditableTitle } from '../network-modifications/editable-title';
import { useDispatch, useSelector } from 'react-redux';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { setToggleOptions } from '../../../../redux/actions';
import { useIntl } from 'react-intl';
import { AppState } from '../../../../redux/reducer';
import EventModificationScenarioEditor from './event-modification-scenario-editor';
import { Box } from '@mui/material';
import { StudyDisplayMode } from 'components/network-modification.type';

const styles = {
    paper: (theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        background: theme.palette.background.paper,
    }),
} as const satisfies MuiStyles;

export interface ScenarioEditorProps {}

const ScenarioEditor = (props: ScenarioEditorProps) => {
    const dispatch = useDispatch();
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);

    const intl = useIntl();
    const closeEventScenarioDrawer = () => {
        dispatch(setToggleOptions(toggleOptions.filter((option) => option !== StudyDisplayMode.EVENT_SCENARIO)));
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
