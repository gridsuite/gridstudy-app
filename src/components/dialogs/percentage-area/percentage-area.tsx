/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import { LEFT_SIDE_PERCENTAGE, RIGHT_SIDE_PERCENTAGE, SLIDER_PERCENTAGE } from 'components/utils/field-constants';
import { useFormContext } from 'react-hook-form';
import { formatPercentageValue, isValidPercentage, sanitizePercentageValue } from './percentage-area-utils';
import { FormattedMessage } from 'react-intl';
import { Input, PercentageAdornment, SliderInput, standardTextField, TextInput } from '@gridsuite/commons-ui';

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
            adornment={PercentageAdornment}
            acceptValue={isValidPercentage}
            outputTransform={handleLeftPercentageValueChange}
            formProps={standardTextField}
        />
    );

    const rightSidePercentageField = (
        <TextInput
            name={RIGHT_SIDE_PERCENTAGE}
            adornment={PercentageAdornment}
            acceptValue={isValidPercentage}
            outputTransform={handleRightPercentageValueChange}
            formProps={standardTextField}
        />
    );

    const slider = (
        <SliderInput name={SLIDER_PERCENTAGE} min={0.0} max={100.0} step={0.1} onValueChanged={onSliderChange} />
    );
    return (
        <Grid container>
            <Grid container size={12} justifyContent={'space-between'} spacing={2}>
                {upperLeftText && (
                    <Grid>
                        <Typography>
                            <FormattedMessage id={upperLeftText} />
                        </Typography>
                    </Grid>
                )}
                {upperRightText && (
                    <Grid sx={{ ml: 'auto' }}>
                        <Typography>
                            <FormattedMessage id={upperRightText} />
                        </Typography>
                    </Grid>
                )}
            </Grid>
            {slider}
            <Grid container size={12} justifyContent={'space-between'} spacing={2}>
                <Grid size={3}>{leftSidePercentageField}</Grid>
                <Grid size={3}>{rightSidePercentageField}</Grid>
            </Grid>
        </Grid>
    );
}
