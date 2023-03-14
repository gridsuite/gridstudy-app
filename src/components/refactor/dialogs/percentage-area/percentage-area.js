/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import TextInput from '../../rhf-inputs/text-input';
import {
    percentageTextField,
    standardTextField,
} from '../../../dialogs/dialogUtils';
import SliderInput from 'components/refactor/rhf-inputs/slider-input';
import {
    LEFT_SIDE_PERCENTAGE,
    RIGHT_SIDE_PERCENTAGE,
    SLIDER_PERCENTAGE,
} from 'components/refactor/utils/field-constants';
import { useFormContext } from 'react-hook-form';
import {
    formatPercentageString,
    getLeftSidePercentageValue,
    getRightSidePercentageValue,
    getSliderValue,
} from './percentage-area-utils';
import { FormattedMessage } from 'react-intl';

/**
 * Component to handle a 'percentage area' (slider , left and right percentage fields)
 * @param upperLeftText text to diplays on the top left of the slider
 * @param upperRightText text to diplays on the top right of the slider
 */
export const PercentageArea = ({ upperLeftText, upperRightText }) => {
    const { setValue } = useFormContext();

    const handleRightPercentageValueChange = (value) => {
        const floatValueStr = formatPercentageString(value);
        const nextValue = '100-' + floatValueStr;
        setValue(SLIDER_PERCENTAGE, getSliderValue(nextValue));
        setValue(LEFT_SIDE_PERCENTAGE, getLeftSidePercentageValue(nextValue), {
            shouldValidate: true,
        });
        setValue(
            RIGHT_SIDE_PERCENTAGE,
            getRightSidePercentageValue(nextValue),
            {
                shouldValidate: true,
            }
        );
        return floatValueStr;
    };

    const handleLeftPercentageValueChange = (value) => {
        const floatValueStr = formatPercentageString(value);
        setValue(SLIDER_PERCENTAGE, getSliderValue(floatValueStr));
        setValue(
            RIGHT_SIDE_PERCENTAGE,
            getRightSidePercentageValue(floatValueStr),
            {
                shouldValidate: true,
            }
        );
        setValue(
            LEFT_SIDE_PERCENTAGE,
            getLeftSidePercentageValue(floatValueStr),
            {
                shouldValidate: true,
            }
        );
        return floatValueStr;
    };

    const onSliderChange = (value) => {
        setValue(LEFT_SIDE_PERCENTAGE, getLeftSidePercentageValue(value), {
            shouldValidate: true,
        });
        setValue(RIGHT_SIDE_PERCENTAGE, getRightSidePercentageValue(value), {
            shouldValidate: true,
        });
        return value;
    };

    const leftSidePercentageField = (
        <TextInput
            name={LEFT_SIDE_PERCENTAGE}
            adornment={percentageTextField}
            outputTransform={handleLeftPercentageValueChange}
            inputTransform={formatPercentageString}
            formProps={standardTextField}
        />
    );

    const rightSidePercentageField = (
        <TextInput
            name={RIGHT_SIDE_PERCENTAGE}
            adornment={percentageTextField}
            outputTransform={handleRightPercentageValueChange}
            inputTransform={formatPercentageString}
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
                    <Grid item xs={5} align={'start'}>
                        <Typography>
                            <FormattedMessage
                                id={upperLeftText}
                            ></FormattedMessage>
                        </Typography>
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={5} align={'end'}>
                        <Typography align="right">
                            <FormattedMessage
                                id={upperRightText}
                            ></FormattedMessage>
                        </Typography>
                    </Grid>
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
