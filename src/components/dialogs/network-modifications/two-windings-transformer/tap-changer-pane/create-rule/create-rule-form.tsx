/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, DialogContent, DialogTitle, Stack } from '@mui/material';
import { FloatInput } from '@gridsuite/commons-ui';
import { HIGH_TAP_POSITION, LOW_TAP_POSITION } from 'components/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { PHASE_TAP, RATIO_TAP, RuleType } from '../../two-windings-transformer.types';

const TAP_LABELS = {
    [PHASE_TAP]: {
        low: 'LowTapAlpha',
        high: 'HighTapAlpha',
        title: 'CreateDephasingRule',
    },
    [RATIO_TAP]: {
        low: 'LowTapRatio',
        high: 'HighTapRatio',
        title: 'CreateRegulationRule',
    },
} as const;

const DIALOG_CONTENT_STYLE = { paddingTop: '5px' } as const;

interface CreateRuleFormProps {
    ruleType: RuleType;
}

const CreateRuleForm = ({ ruleType }: CreateRuleFormProps) => {
    const labels = TAP_LABELS[ruleType] ?? { low: '', high: '', title: '' };

    return (
        <>
            <DialogTitle>
                <FormattedMessage id={labels.title} />
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={DIALOG_CONTENT_STYLE}>
                    <Box>
                        <FloatInput label={labels.low} name={LOW_TAP_POSITION} />
                    </Box>
                    <Box>
                        <FloatInput label={labels.high} name={HIGH_TAP_POSITION} />
                    </Box>
                </Stack>
            </DialogContent>
        </>
    );
};

export default CreateRuleForm;
