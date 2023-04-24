/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { percentageTextField, standardTextField } from '../dialogUtils';
import SliderInput from 'components/util/rhf-inputs/slider-input';
import {
    LEFT_SIDE_PERCENTAGE,
    RIGHT_SIDE_PERCENTAGE,
    SLIDER_PERCENTAGE,
} from 'components/util/field-constants';
import { useFormContext } from 'react-hook-form';
import {
    formatPercentageValue,
    isValidPercentage,
    sanitizePercentageValue,
} from './percentage-area-utils';
import { FormattedMessage } from 'react-intl';
import TextInput from 'components/util/rhf-inputs/text-input';

/**
 * Component to handle a 'percentage area' (slider , left and right percentage fields)
 * @param upperLeftText text to diplays on the top left of the slider
 * @param upperRightText text to diplays on the top right of the slider
 */
export const PercentageArea = ({ upperLeftText, upperRightText }) => {
    const { setValue } = useFormContext();

    const handleLeftPercentageValueChange = (value) => {
        const leftPercentageValue = formatPercentageValue(value);
        const rightPercentageValue = sanitizePercentageValue(
            100 - leftPercentageValue
        );
        setValue(SLIDER_PERCENTAGE, parseFloat(leftPercentageValue));
        setValue(LEFT_SIDE_PERCENTAGE, leftPercentageValue, {
            shouldValidate: true,
        });
        setValue(RIGHT_SIDE_PERCENTAGE, rightPercentageValue, {
            shouldValidate: true,
        });
        return leftPercentageValue;
    };

    const handleRightPercentageValueChange = (value) => {
        const rightPercentageValue = formatPercentageValue(value);
        const leftPercentageValue = sanitizePercentageValue(
            100 - rightPercentageValue
        );
        setValue(SLIDER_PERCENTAGE, parseFloat(leftPercentageValue));
        setValue(LEFT_SIDE_PERCENTAGE, leftPercentageValue, {
            shouldValidate: true,
        });
        setValue(RIGHT_SIDE_PERCENTAGE, rightPercentageValue, {
            shouldValidate: true,
        });
        return rightPercentageValue;
    };

    const onSliderChange = (value) => {
        const rightPercentageValue = sanitizePercentageValue(100 - value);
        setValue(LEFT_SIDE_PERCENTAGE, value, {
            shouldValidate: true,
        });
        setValue(RIGHT_SIDE_PERCENTAGE, rightPercentageValue, {
            shouldValidate: true,
        });
        return value;
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
        <SliderInput
            name={SLIDER_PERCENTAGE}
            min={0.0}
            max={100.0}
            step={0.1}
            onValueChange={onSliderChange}
        />
    );
    return (
        <>
            <Grid container spacing={2}>
                <Grid container spacing={2} item>
                    {upperLeftText && (
                        <Grid item xs={5} align={'start'}>
                            <Typography>
                                <FormattedMessage
                                    id={upperLeftText}
                                ></FormattedMessage>
                            </Typography>
                        </Grid>
                    )}
                    <Grid item xs={2}></Grid>
                    {upperRightText && (
                        <Grid item xs={5} align={'end'}>
                            <Typography align="right">
                                <FormattedMessage
                                    id={upperRightText}
                                ></FormattedMessage>
                            </Typography>
                        </Grid>
                    )}
                </Grid>
                {slider}
                <Grid container spacing={2} item>
                    <Grid item xs={3} align={'start'}>
                        {leftSidePercentageField}
                    </Grid>
                    <Grid item xs={6}></Grid>
                    <Grid item xs={3} align={'end'}>
                        {rightSidePercentageField}
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};
