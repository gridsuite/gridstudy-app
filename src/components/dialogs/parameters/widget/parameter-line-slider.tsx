/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { mergeSx, SliderInput } from '@gridsuite/commons-ui';
import { Mark } from '@mui/base/useSlider';
import { Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { sanitizePercentageValue } from 'components/dialogs/percentage-area/percentage-area-utils';
import { styles } from '../parameters-style';
import { UseParameterStateParamName } from '../use-parameters-state';

type SliderParameterLineProps = {
    readonly paramNameId: UseParameterStateParamName;
    disabled?: boolean;
    label: string;
    marks: boolean | Mark[];
    minValue?: number; //default = 0;
    maxValue?: number; //default = 100;
};

const ParameterLineSlider = ({
    paramNameId,
    label,
    marks,
    disabled = false,
    minValue = 0,
    maxValue = 100,
}: SliderParameterLineProps) => {
    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={mergeSx(styles.controlItem, { paddingRight: 2 })}>
                <SliderInput
                    name={paramNameId}
                    min={minValue}
                    max={maxValue}
                    valueLabelDisplay="auto"
                    step={0.01}
                    size="medium"
                    disabled={disabled ?? false}
                    marks={marks}
                    valueLabelFormat={(value) => sanitizePercentageValue(value * 100)}
                />
            </Grid>
        </>
    );
};

export default ParameterLineSlider;
