/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, Paper } from '@mui/material';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    LIMITS,
    SELECTED_LIMIT_GROUP_1,
    SELECTED_LIMIT_GROUP_2,
} from 'components/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';

const styles = {
    limitsBackground: {
        backgroundColor: '#383838', // TODO : may be found in the theme ??
        padding: 2,
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919', // TODO : may be found in the theme ??
    },
};

const LimitsPane = ({ id = LIMITS, currentNode, equipmentToModify, clearableFields }) => {

    function handleAddLimitSetButton() {
        // TODO (cf dnd-table.jsx)
    }

    return (
        <Grid container spacing={2}>
            {/* titles */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side1" />
                    </Box>
                </Grid>
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side2" />
                    </Box>
                </Grid>
            </Grid>
            {/* active limit set */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedName={`${id}.${SELECTED_LIMIT_GROUP_1}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_1}`}
                    />
                </Grid>
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedName={`${id}.${SELECTED_LIMIT_GROUP_2}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_2}`}
                    />
                </Grid>
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={11}>
                <Grid item xs={1}>
                    <IconButton color="primary" onClick={() => handleAddLimitSetButton()} disabled>
                        [TODO]
                        <AddCircleIcon />
                    </IconButton>
                    <Paper sx={styles.limitsBackgroundUnselected}>[TODO pas sélectionné 0]</Paper>
                    <Paper sx={styles.limitsBackground}>[TODO Sélectionné]</Paper>
                    <Paper sx={styles.limitsBackgroundUnselected}>[TODO pas sélectionné 1]</Paper>
                    <Paper sx={styles.limitsBackgroundUnselected}>[TODO pas sélectionné 2]</Paper>
                </Grid>
                <Grid item xs={5}>
                    <LimitsSidePane
                        arrayFormName={`${id}.${CURRENT_LIMITS_1}`}
                        clearableFields={clearableFields}
                        indexLimitSet={0}
                        permanentCurrentLimitPreviousValue={equipmentToModify?.currentLimits1?.permanentLimit}
                        previousValues={equipmentToModify?.currentLimits1?.temporaryLimits}
                        currentNode={currentNode}
                    />
                </Grid>
                <Grid item xs={5}>
                    <LimitsSidePane
                        arrayFormName={`${id}.${CURRENT_LIMITS_2}`}
                        clearableFields={clearableFields}
                        indexLimitSet={0}
                        permanentCurrentLimitPreviousValue={equipmentToModify?.currentLimits2?.permanentLimit}
                        previousValues={equipmentToModify?.currentLimits2?.temporaryLimits}
                        currentNode={currentNode}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};

export default LimitsPane;
