/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DialogContent, DialogTitle, Grid } from '@mui/material';
import { FloatInput } from '@gridsuite/commons-ui';
import { HIGH_TAP_POSITION, LOW_TAP_POSITION } from 'components/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { PHASE_TAP, RATIO_TAP } from '../../creation/two-windings-transformer-creation-dialog';
import GridItem from '../../../../commons/grid-item';

const CreateRuleForm = (props) => {
    const computeLowTapLabel = (ruleType) => {
        if (ruleType === PHASE_TAP) {
            return 'LowTapAlpha';
        }
        if (ruleType === RATIO_TAP) {
            return 'LowTapRatio';
        }
        return '';
    };

    const computeHighTapLabel = (ruleType) => {
        if (ruleType === PHASE_TAP) {
            return 'HighTapAlpha';
        }
        if (ruleType === RATIO_TAP) {
            return 'HighTapRatio';
        }
        return '';
    };

    const lowTapValueField = <FloatInput label={computeLowTapLabel(props.ruleType)} name={LOW_TAP_POSITION} />;

    const highTapValueField = <FloatInput label={computeHighTapLabel(props.ruleType)} name={HIGH_TAP_POSITION} />;

    return (
        <>
            <DialogTitle>
                <FormattedMessage id={props.ruleType === PHASE_TAP ? 'CreateDephasingRule' : 'CreateRegulationRule'} />
            </DialogTitle>
            <DialogContent>
                <Grid
                    container
                    spacing={2}
                    direction={'column'}
                    style={{
                        paddingTop: '5px',
                    }}
                >
                    <GridItem>{lowTapValueField}</GridItem>
                    <GridItem>{highTapValueField}</GridItem>
                </Grid>
            </DialogContent>
        </>
    );
};

export default CreateRuleForm;
