/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useState } from 'react';
import { useParameterState, styles } from '../parameters';
import { Grid, MenuItem, Select, Slider, Switch } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Mark } from '@mui/base/useSlider';
import { DirectoryItemsInput } from '@gridsuite/commons-ui';
import { SelectInputProps } from '@mui/material/Select/SelectInput';
import { mergeSx } from '../../../utils/functions';
import {
    fetchDirectoryContent,
    fetchPath,
    fetchRootFolders,
} from 'services/directory';
import { fetchElementsMetadata } from 'services/explore';

export enum ParameterType {
    Switch,
    DropDown,
    Slider,
    DirectoryItems,
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
    onPreChange?: SelectInputProps<any>['onChange'];
};

type SliderParameterLineProps = {
    readonly type: ParameterType.Slider;
    value: number;
    label: string;
    marks: boolean | Mark[];
    minValue?: number; //default = 0;
    maxValue?: number; //default = 100;
};

//TODO: type elementType on @commons-ui/libs/utils/ElementType.elementType enum when migrated on ts
type DirectoryItemsInputLineProps = {
    readonly type: ParameterType.DirectoryItems;
    label: string;
    name: string;
    equipmentTypes: string[];
    elementType: string;
    hideErrorMessage: boolean;
};

type ParameterLineProps = BaseParameterLineProps &
    (
        | SwitchParameterLineProps
        | DropDownParameterLineProps
        | SliderParameterLineProps
        | DirectoryItemsInputLineProps
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

        case ParameterType.DirectoryItems:
            return ParamLineDirectoryItemsInput(props, context);

        default:
            //TODO: how to manage in react component? throw new Error(`Not supported parameter type ${type}`);
            return (
                <p>{`Not supported parameter type '${
                    (props as any).type || '<unknown>'
                }'`}</p>
            );
    }
};

const ParamLineSwitch: FunctionComponent<
    BaseParameterLineProps & SwitchParameterLineProps
> = (props, context) => {
    const [parameterValue, handleChangeParameterValue] = useParameterState(
        props.param_name_id
    );

    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={props.label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Switch
                    checked={parameterValue}
                    onChange={(event, isChecked) => {
                        handleChangeParameterValue(isChecked);
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

    return (
        <>
            <Grid item xs={5} sx={styles.parameterName}>
                <FormattedMessage id={props.labelTitle} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Select
                    labelId={props.labelValue}
                    value={
                        props.defaultValueIfNull && !parameterValue
                            ? Object.entries<string>(props.values)[0]
                            : parameterValue
                    }
                    onChange={(event, child) => {
                        props.onPreChange?.(event, child);
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
    const [parameterValue, handleChangeParameterValue] = useParameterState(
        props.param_name_id
    );
    const [sliderValue, setSliderValue] = useState(Number(parameterValue));

    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={props.label} />
            </Grid>
            <Grid
                item
                container
                xs={4}
                sx={mergeSx(styles.controlItem, { paddingRight: 2 })}
            >
                <Slider
                    min={props.minValue ?? 0}
                    max={props.maxValue ?? 100}
                    valueLabelDisplay="auto"
                    onChange={(event, newValue) => {
                        setSliderValue(Number(newValue));
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

const ParamLineDirectoryItemsInput: FunctionComponent<
    BaseParameterLineProps & DirectoryItemsInputLineProps
> = (props, context) => {
    return (
        <Grid item container spacing={1} padding={1}>
            <Grid item xs={8} sx={styles.parameterName}>
                {/*<Typography component="span" variant="body1"> as suggested in the doc?*/}
                <FormattedMessage id={props.label} />
            </Grid>
            <Grid item xs={4} sx={styles.controlItem}>
                <DirectoryItemsInput
                    name={props.name}
                    equipmentTypes={props.equipmentTypes}
                    elementType={props.elementType}
                    titleId={props.label}
                    hideErrorMessage={props.hideErrorMessage}
                    label={undefined}
                    itemFilter={undefined}
                    fetchDirectoryContent={fetchDirectoryContent}
                    fetchRootFolders={fetchRootFolders}
                    fetchElementsInfos={fetchElementsMetadata}
                    fetchDirectoryElementPath={fetchPath}
                />
            </Grid>
        </Grid>
    );
};
