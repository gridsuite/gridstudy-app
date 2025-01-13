/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { mergeSx } from '@gridsuite/commons-ui';
import type { Mark } from '@mui/base/useSlider';
import { Grid, Slider } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { UseParameterStateParamName, styles, useParameterState } from '../parameters';

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
    const [parameterValue, handleChangeParameterValue] = useParameterState(paramNameId);
    const [sliderValue, setSliderValue] = useState(Number(parameterValue));

    useEffect(() => {
        if (parameterValue) {
            setSliderValue(Number(parameterValue));
        }
    }, [parameterValue]);

    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={mergeSx(styles.controlItem, { paddingRight: 2 })}>
                <Slider
                    min={minValue}
                    max={maxValue}
                    valueLabelDisplay="auto"
                    onChange={(_event, newValue) => {
                        setSliderValue(Number(newValue));
                    }}
                    onChangeCommitted={(_event, value) => {
                        handleChangeParameterValue(value);
                    }}
                    value={sliderValue}
                    disabled={disabled ?? false}
                    marks={marks}
                />
            </Grid>
        </>
    );
};

export default ParameterLineSlider;
