/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useState } from 'react';
import { useParameterState, useStyles } from '../parameters';
import { Grid, MenuItem, Select, Slider, Switch } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Mark } from '@mui/base/useSlider';

export enum ParameterType {
    Switch,
    DropDown,
    Slider,
}

type BaseParameterLineProps = {
    readonly type: ParameterType;
    readonly param_name_id: string;
    disabled?: boolean;
    //callback?: (event: Event, newValue: any) => void;
};

type SwitchParameterLineProps = /*BaseParameterLineProps &*/ {
    readonly type: ParameterType.Switch;
    label?: string;
    //value?: boolean;
    //callback?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
};

type DropDownParameterLineProps = {
    readonly type: ParameterType.DropDown;
    labelTitle?: string;
    labelValue?: string;
    values: Record<string, string>;
    defaultValueIfNull?: boolean;
    //callback?: SelectInputProps<T>['onChange'];
};

type SliderParameterLineProps = {
    readonly type: ParameterType.Slider;
    value: number;
    label: string;
    //onCommitCallback: any;
    marks: boolean | Mark[];
    minValue?: number; //default = 0;
    maxValue?: number; //default = 100;
    //callback?: (event: Event, value: number | number[], activeThumb: number) => void;
};

type ParameterLineProps = BaseParameterLineProps &
    (
        | SwitchParameterLineProps
        | DropDownParameterLineProps
        | SliderParameterLineProps
    );

/**
 * This component represents a parameter in the list.
 * This is an effort to uniformize the UI style.
 * @param name
 * @param other
 * @constructor
 */
//export const ParamLine: FunctionComponent<ParameterLineProps> = ({ type, param_name_id, label, value, callback, values }) => {
export const ParamLine: FunctionComponent<ParameterLineProps> = (
    props,
    context
) => {
    const [parameterValue, handleChangeParameterValue] = useParameterState(
        props.param_name_id
    );
    const classes = useStyles();

    switch (props.type) {
        case ParameterType.Switch:
            return (
                <>
                    <Grid item xs={8} className={classes.parameterName}>
                        <FormattedMessage id={props.label} />
                    </Grid>
                    <Grid item container xs={4} className={classes.controlItem}>
                        <Switch
                            checked={parameterValue}
                            onChange={(event, checked) => {
                                handleChangeParameterValue(checked);
                            }}
                            value={parameterValue}
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                            disabled={props.disabled ?? false}
                        />
                    </Grid>
                </>
            );

        case ParameterType.DropDown:
            return (
                <>
                    <Grid item xs={8} className={classes.parameterName}>
                        {/*<Typography component="span" variant="body1" fontWeight="fontWeightBold" margin={1}>*/}
                        <FormattedMessage id={props.labelTitle} />
                        {/*</Typography>*/}
                    </Grid>
                    <Grid item container xs={4} className={classes.controlItem}>
                        <Select
                            labelId={props.labelValue}
                            value={
                                props.defaultValueIfNull && !parameterValue
                                    ? Object.entries<string>(props.values)[0]
                                    : parameterValue
                            }
                            onChange={(event) => {
                                handleChangeParameterValue(event.target.value);
                            }}
                            size="small"
                            disabled={props.disabled ?? false}
                        >
                            {Object.entries<string>(props.values).map(
                                ([key, value]) => (
                                    <MenuItem key={key} value={key}>
                                        <FormattedMessage id={value} />
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </Grid>
                </>
            );

        case ParameterType.Slider:
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [sliderValue, setSliderValue] = useState(
                Number(parameterValue)
            );
            return (
                <>
                    <Grid item xs={8} className={classes.parameterName}>
                        {/*<Typography component="span" variant="body1" fontWeight="fontWeightBold" margin={1}>*/}
                        <FormattedMessage id={props.label} />
                        {/*</Typography>*/}
                    </Grid>
                    <Grid item container xs={4} className={classes.controlItem}>
                        <Slider
                            min={props.minValue ?? 0}
                            max={props.maxValue ?? 100}
                            valueLabelDisplay="auto"
                            onChange={(event, newValue) => {
                                // @ts-ignore
                                setSliderValue(newValue);
                            }}
                            onChangeCommitted={(event, value) => {
                                handleChangeParameterValue(value);
                            }}
                            value={sliderValue}
                            disabled={props.disabled ?? false}
                            marks={props.marks}
                        />
                    </Grid>
                </>
            );

        default:
            //throw new Error(`Not supported parameter type ${type}`);
            // @ts-ignore
            return <p>{`Not supported parameter type ${props.type}`}</p>;
    }
};
