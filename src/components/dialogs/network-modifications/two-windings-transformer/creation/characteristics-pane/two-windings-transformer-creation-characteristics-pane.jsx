/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid } from '@mui/material';
import { ConnectivityForm } from '../../../../connectivity/connectivity-form';
import { CHARACTERISTICS, CONNECTIVITY_1, CONNECTIVITY_2 } from 'components/utils/field-constants';
import TwoWindingsTransformerCharacteristicsPane from '../../characteristics-pane/two-windings-transformer-characteristics-pane';
import RatioTapChangerPane from '../../tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane';
import PhaseTapChangerPane from '../../tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane';
import { LimitsPane } from '../../../../limits/limits-pane';
import useVoltageLevelsListInfos from '../../../../../../hooks/use-voltage-levels-list-infos';
import GridSection from '../../../../commons/grid-section';
import GridItem from '../../../../commons/grid-item';
import { TwoWindingsTransformerCreationDialogTab } from '../../two-windings-transformer-utils';

const styles = {
    h3: {
        marginTop: 0,
        marginBottom: 0,
        paddingBottom: 1,
    },
};

const TwoWindingsTransformerCreationCharacteristicsPane = ({
    id = CHARACTERISTICS,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    tabIndex,
}) => {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);
    const connectivity1Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_1}`}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY_2}`}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
        />
    );

    return (
        <>
            <Box hidden={tabIndex !== TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB} p={1}>
                <GridSection title="Connectivity" customStyle={styles.h3} />
                <GridSection title="Side1" heading={4} size="6" />
                <Grid container spacing={2}>
                    <Grid item container direction="column">
                        <Grid container direction="column" spacing={2}>
                            <GridItem>{connectivity1Field}</GridItem>
                        </Grid>
                    </Grid>
                </Grid>
                <GridSection title="Side2" heading={4} size="6" />
                <Grid container spacing={2}>
                    <Grid item container>
                        <Grid container direction="column" spacing={2}>
                            <GridItem size={12}>{connectivity2Field}</GridItem>
                        </Grid>
                    </Grid>
                </Grid>
                <TwoWindingsTransformerCharacteristicsPane />
            </Box>
            <Box hidden={tabIndex !== TwoWindingsTransformerCreationDialogTab.LIMITS_TAB} p={1}>
                <LimitsPane />
            </Box>
            <Box hidden={tabIndex !== TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB} p={1}>
                <RatioTapChangerPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    voltageLevelOptions={voltageLevelOptions}
                />
            </Box>

            <Box hidden={tabIndex !== TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB} p={1}>
                <PhaseTapChangerPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    voltageLevelOptions={voltageLevelOptions}
                />
            </Box>
        </>
    );
};

export default TwoWindingsTransformerCreationCharacteristicsPane;
