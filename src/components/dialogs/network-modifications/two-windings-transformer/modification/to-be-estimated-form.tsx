/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { FunctionComponent, useMemo } from 'react';
import { useIntl } from 'react-intl';
import CheckboxNullableInput from '../../../../utils/rhf-inputs/boolean-nullable-input';
import GridItem from '../../../commons/grid-item';
import {
    RATIO_TAP_CHANGER_STATUS,
    PHASE_TAP_CHANGER_STATUS,
    BRANCH_MEASUREMENTS,
    TO_BE_ESTIMATED,
} from '../../../../utils/field-constants';
import GridSection from '../../../commons/grid-section';
import { ToBeEstimatedProps } from './to-be-estimated.type';

export const ToBeEstimatedForm: FunctionComponent<ToBeEstimatedProps> = ({ toBeEstimated }) => {
    const intl = useIntl();
    const ratioTapChangerStatusId = `${BRANCH_MEASUREMENTS}.${TO_BE_ESTIMATED}.${RATIO_TAP_CHANGER_STATUS}`;
    const phaseTapChangerStatusId = `${BRANCH_MEASUREMENTS}.${TO_BE_ESTIMATED}.${PHASE_TAP_CHANGER_STATUS}`;

    const previousRatioStatusField = useMemo(() => {
        if (toBeEstimated?.ratioTapChangerStatus == null) {
            return '';
        }
        return toBeEstimated.ratioTapChangerStatus
            ? intl.formatMessage({ id: 'true' })
            : intl.formatMessage({ id: 'false' });
    }, [intl, toBeEstimated?.ratioTapChangerStatus]);

    const previousPhaseStatusField = useMemo(() => {
        if (toBeEstimated?.phaseTapChangerStatus == null) {
            return '';
        }
        return toBeEstimated.phaseTapChangerStatus
            ? intl.formatMessage({ id: 'true' })
            : intl.formatMessage({ id: 'false' });
    }, [intl, toBeEstimated?.phaseTapChangerStatus]);

    const ratioTapChangerStatusField = (
        <CheckboxNullableInput
            name={ratioTapChangerStatusId}
            label="RatioTapChangerEstimateTapPosition"
            previousValue={previousRatioStatusField}
        />
    );

    const phaseTapChangerStatusField = (
        <CheckboxNullableInput
            name={phaseTapChangerStatusId}
            label="PhaseTapChangerEstimateTapPosition"
            previousValue={previousPhaseStatusField}
        />
    );

    return (
        <>
            <GridSection title="EstimateTapPositionSection" />
            <Grid container spacing={2} direction={'column'}>
                <GridItem size={6}>{ratioTapChangerStatusField}</GridItem>
                <GridItem size={6}>{phaseTapChangerStatusField}</GridItem>
            </Grid>
        </>
    );
};
