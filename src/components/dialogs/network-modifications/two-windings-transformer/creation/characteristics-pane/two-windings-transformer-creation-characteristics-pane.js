/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';
import { gridItem } from '../../../../dialogUtils';
import { ConnectivityForm } from '../../../../connectivity/connectivity-form';
import {
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
} from 'components/utils/field-constants';
import TwoWindingsTransformerCharacteristicsPane from '../../characteristics-pane/two-windings-transformer-characteristics-pane';
import { TwoWindingsTransformerCreationDialogTab } from '../two-windings-transformer-creation-dialog';
import RatioTapChangerPane from '../../tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane';
import PhaseTapChangerPane from '../../tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane';
import React, { useEffect, useState } from 'react';
import LimitsPane from '../../../../limits/limits-pane';
import { fetchVoltageLevelsListInfos } from '../../../../../../utils/rest-api';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginTop: 0,
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

const TwoWindingsTransformerCreationCharacteristicsPane = ({
    id = CHARACTERISTICS,
    studyUuid,
    currentNode,
    tabIndex,
}) => {
    const currentNodeUuid = currentNode.id;
    const classes = useStyles();
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNodeUuid]);
    const connectivity1Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_1}`}
            studyUuid={studyUuid}
            currentNode={currentNode}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_2}`}
            studyUuid={studyUuid}
            currentNode={currentNode}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
        />
    );

    return (
        <>
            <Box
                hidden={
                    tabIndex !==
                    TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB
                }
                p={1}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3 className={classes.h3}>
                            <FormattedMessage id="Connectivity" />
                        </h3>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side1" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item container direction="column">
                        <Grid container direction="column" spacing={2}>
                            {gridItem(connectivity1Field, 6)}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side2" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item container>
                        <Grid container direction="column" spacing={2}>
                            {gridItem(connectivity2Field, 12)}
                        </Grid>
                    </Grid>
                </Grid>
                <TwoWindingsTransformerCharacteristicsPane />
            </Box>
            <Box
                hidden={
                    tabIndex !==
                    TwoWindingsTransformerCreationDialogTab.LIMITS_TAB
                }
                p={1}
            >
                <LimitsPane />
            </Box>
            <Box
                hidden={
                    tabIndex !==
                    TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB
                }
                p={1}
            >
                <RatioTapChangerPane
                    studyUuid={studyUuid}
                    currentNodeUuid={currentNodeUuid}
                    voltageLevelOptions={voltageLevelOptions}
                />
            </Box>

            <Box
                hidden={
                    tabIndex !==
                    TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB
                }
                p={1}
            >
                <PhaseTapChangerPane
                    studyUuid={studyUuid}
                    currentNodeUuid={currentNodeUuid}
                    voltageLevelOptions={voltageLevelOptions}
                />
            </Box>
        </>
    );
};

export default TwoWindingsTransformerCreationCharacteristicsPane;
