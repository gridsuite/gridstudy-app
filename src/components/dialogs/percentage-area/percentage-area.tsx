/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import { percentageTextField, standardTextField } from '../dialog-utils';
import { LEFT_SIDE_PERCENTAGE, RIGHT_SIDE_PERCENTAGE, SLIDER_PERCENTAGE } from 'components/utils/field-constants';
import { useFormContext } from 'react-hook-form';
import { formatPercentageValue, isValidPercentage, sanitizePercentageValue } from './percentage-area-utils';
import { FormattedMessage } from 'react-intl';
import { Input, SliderInput, TextInput } from '@gridsuite/commons-ui';

/**
 * Component to handle a 'percentage area' (slider , left and right percentage fields)
 * @param upperLeftText text to diplays on the top left of the slider
 * @param upperRightText text to diplays on the top right of the slider
 */

interface PercentageAreaProps {
    upperLeftText: string;
    upperRightText: string;
}
export function PercentageArea({ upperLeftText, upperRightText }: Readonly<PercentageAreaProps>) {
    const { setValue } = useFormContext();

    const handleLeftPercentageValueChange = (value: string): Input => {
        const leftPercentageValue = formatPercentageValue(value);
        const rightPercentageValue = sanitizePercentageValue(100 - +leftPercentageValue);
        setValue(SLIDER_PERCENTAGE, +leftPercentageValue);
        setValue(LEFT_SIDE_PERCENTAGE, leftPercentageValue, {
            shouldValidate: true,
        });
        setValue(RIGHT_SIDE_PERCENTAGE, rightPercentageValue, {
            shouldValidate: true,
        });
        return leftPercentageValue;
    };

    const handleRightPercentageValueChange = (value: string): Input => {
        const rightPercentageValue = formatPercentageValue(value);
        const leftPercentageValue = sanitizePercentageValue(100 - +rightPercentageValue);
        setValue(SLIDER_PERCENTAGE, leftPercentageValue);
        setValue(LEFT_SIDE_PERCENTAGE, leftPercentageValue, {
            shouldValidate: true,
        });
        setValue(RIGHT_SIDE_PERCENTAGE, rightPercentageValue, {
            shouldValidate: true,
        });
        return rightPercentageValue;
    };

    const onSliderChange = (value: number | number[]) => {
        if (typeof value === 'number') {
            const rightPercentageValue = sanitizePercentageValue(100 - value);
            setValue(RIGHT_SIDE_PERCENTAGE, rightPercentageValue, {
                shouldValidate: true,
            });
            setValue(LEFT_SIDE_PERCENTAGE, value, { shouldValidate: true });
        }
    };

    const leftSidePercentageField = (
        <TextInput
            name={LEFT_SIDE_PERCENTAGE}
            adornment={percentageTextField}
            acceptValue={isValidPercentage}
            outputTransform={handleLeftPercentageValueChange}
            formProps={standardTextField}
        />
    );

    const rightSidePercentageField = (
        <TextInput
            name={RIGHT_SIDE_PERCENTAGE}
            adornment={percentageTextField}
            acceptValue={isValidPercentage}
            outputTransform={handleRightPercentageValueChange}
            formProps={standardTextField}
        />
    );

    const slider = (
        <SliderInput name={SLIDER_PERCENTAGE} min={0.0} max={100.0} step={0.1} onValueChanged={onSliderChange} />
    );
    return (
        <Grid container spacing={2}>
            <Grid container spacing={2} item>
                {upperLeftText && (
                    <Grid item xs={5} sx={{ align: 'start' }}>
                        <Typography>
                            <FormattedMessage id={upperLeftText}></FormattedMessage>
                        </Typography>
                    </Grid>
                )}
                <Grid item xs={2}></Grid>
                {upperRightText && (
                    <Grid item xs={5} sx={{ align: 'end' }}>
                        <Typography sx={{ align: 'right' }}>
                            <FormattedMessage id={upperRightText}></FormattedMessage>
                        </Typography>
                    </Grid>
                )}
            </Grid>
            {slider}
            <Grid container spacing={2} item>
                <Grid item xs={3} sx={{ align: 'start' }}>
                    {leftSidePercentageField}
                </Grid>
                <Grid item xs={6}></Grid>
                <Grid item xs={3} sx={{ align: 'end' }}>
                    {rightSidePercentageField}
                </Grid>
            </Grid>
        </Grid>
    );
}
