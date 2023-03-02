/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import TextInput from '../../../rhf-inputs/text-input';
import {
    percentageTextField,
    standardTextField,
} from '../../../../dialogs/dialogUtils';
import SliderInput from 'components/refactor/rhf-inputs/slider-input';
import {
    LEFT_SIDE_PERCENTAGE,
    RIGHT_SIDE_PERCENTAGE,
    SLIDER_PERCENTAGE,
} from 'components/refactor/utils/field-constants';
import { useFormContext } from 'react-hook-form';
import {
    asMostlyPercentStr,
    leftSideValue,
    rightSideValue,
    slideValue,
} from './percentage-area-utils';
import { FormattedMessage } from 'react-intl';

/**
 * Hook to handle a 'connectivity value' (voltage level, bus or bus bar section)
 * @param id optional id that has to be defined if the component is used more than once in a form
 * @param direction direction of placement. Either 'row' or 'column', 'row' by default.
 * @param withDirectionsInfos
 * @param withPosition
 * @param voltageLevelOptions list of network voltage levels
 * @param studyUuid the study we are currently working on
 * @param currentNode the currently selected tree node
 * @returns {[{voltageLevel: null, busOrBusbarSection: null},unknown]}
 */
export const PercentageArea = ({ upperLeftText, upperRightText }) => {
    const { setValue } = useFormContext();

    const handleChangeRightValue = (value) => {
        const floatValueStr = asMostlyPercentStr(value);
        const nextValue = '100-' + floatValueStr;
        setValue(SLIDER_PERCENTAGE, slideValue(nextValue));
        setValue(LEFT_SIDE_PERCENTAGE, leftSideValue(nextValue));
        return floatValueStr;
    };

    const handleChangeLeftValue = (value) => {
        const floatValueStr = asMostlyPercentStr(value);
        setValue(SLIDER_PERCENTAGE, slideValue(floatValueStr));
        setValue(RIGHT_SIDE_PERCENTAGE, rightSideValue(floatValueStr));
        return floatValueStr;
    };

    const onSliderChange = (value) => {
        setValue(LEFT_SIDE_PERCENTAGE, leftSideValue(value));
        setValue(RIGHT_SIDE_PERCENTAGE, rightSideValue(value));
        return value;
    };

    const leftSidePercentageField = (
        <TextInput
            name={LEFT_SIDE_PERCENTAGE}
            adornment={percentageTextField}
            outputTransform={handleChangeLeftValue}
            inputTransform={asMostlyPercentStr}
            formProps={standardTextField}
        />
    );

    const rightSidePercentageField = (
        <TextInput
            name={RIGHT_SIDE_PERCENTAGE}
            adornment={percentageTextField}
            outputTransform={handleChangeRightValue}
            inputTransform={asMostlyPercentStr}
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
            </Grid>
            <Grid container spacing={2} item>
                <Grid item xs={3} align={'start'}>
                    {leftSidePercentageField}
                </Grid>
                <Grid item xs={6}></Grid>
                <Grid item xs={3} align={'end'}>
                    {rightSidePercentageField}
                </Grid>
            </Grid>
        </>
    );
};
