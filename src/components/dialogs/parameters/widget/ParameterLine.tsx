/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import { useParameterState, useStyles } from '../parameters';
import {
    Grid,
    MenuItem,
    Select,
    SelectChangeEvent,
    Slider,
    Switch,
} from '@mui/material';
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
};

type SwitchParameterLineProps = {
    readonly type: ParameterType.Switch;
    label?: string;
};

type DropDownParameterLineProps = {
    readonly type: ParameterType.DropDown;
    labelTitle?: string;
    labelValue?: string;
    values: Record<string, string>;
    defaultValueIfNull?: boolean;
};

type SliderParameterLineProps = {
    readonly type: ParameterType.Slider;
    value: number;
    label: string;
    marks: boolean | Mark[];
    minValue?: number; //default = 0;
    maxValue?: number; //default = 100;
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
 * @constructor
 * @param props Parameter line component properties
 * @param context React context
 */
export const ParamLine: FunctionComponent<ParameterLineProps> = (
    props,
    context
) => {
    switch (props.type) {
        case ParameterType.Switch:
            return ParamLineSwitch(props, context);

        case ParameterType.DropDown:
            return ParamLineDropdown(props, context);

        case ParameterType.Slider:
            return ParamLineSlider(props, context);

        default:
            //TODO: how to manage in react component? throw new Error(`Not supported parameter type ${type}`);
            // TS2339: Property 'type' does not exist on type 'never'.
            // @ts-ignore
            return <p>{`Not supported parameter type '${props.type || '<unknown>'}'`}</p>;
    }
};

const ParamLineSwitch: FunctionComponent<
    BaseParameterLineProps & SwitchParameterLineProps
> = (props, context) => {
    const [parameterValue, handleChangeParameterValue] = useParameterState(
        props.param_name_id
    );
    const classes = useStyles();

    return (
        <>
            <Grid item xs={8} className={classes.parameterName}>
                <FormattedMessage id={props.label} />
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Switch
                    checked={parameterValue}
                    onChange={(
                        event: ChangeEvent<HTMLInputElement>,
                        checked: boolean
                    ) => {
                        handleChangeParameterValue(checked);
                    }}
                    value={parameterValue}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                    disabled={props.disabled ?? false}
                />
            </Grid>
        </>
    );
};

const ParamLineDropdown: FunctionComponent<
    BaseParameterLineProps & DropDownParameterLineProps
> = (props, context) => {
    const [parameterValue, handleChangeParameterValue] = useParameterState(
        props.param_name_id
    );
    const classes = useStyles();

    return (
        <>
            <Grid item xs={8} className={classes.parameterName}>
                <FormattedMessage id={props.labelTitle} />
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Select
                    labelId={props.labelValue}
                    value={
                        props.defaultValueIfNull && !parameterValue
                            ? Object.entries<string>(props.values)[0]
                            : parameterValue
                    }
                    onChange={(event: SelectChangeEvent<any>) => {
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
};

/* separate in another component because of eslint-rule react-hooks/rules-of-hooks */
const ParamLineSlider: FunctionComponent<
    BaseParameterLineProps & SliderParameterLineProps
> = (props, context) => {
    const classes = useStyles();

    const [parameterValue, handleChangeParameterValue] = useParameterState(
        props.param_name_id
    );
    const [sliderValue, setSliderValue] = useState(Number(parameterValue));

    return (
        <>
            <Grid item xs={8} className={classes.parameterName}>
                <FormattedMessage id={props.label} />
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Slider
                    min={props.minValue ?? 0}
                    max={props.maxValue ?? 100}
                    valueLabelDisplay="auto"
                    onChange={(event: Event, newValue: number | number[]) => {
                        setSliderValue(
                            typeof newValue == 'number' ? newValue : newValue[0]
                        );
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
};
