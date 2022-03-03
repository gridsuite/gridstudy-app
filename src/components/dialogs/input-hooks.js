/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { validateField } from '../util/validation-functions';
import {
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from '@material-ui/core';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ConnectivityEdition from './connectivity-edition';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import { Autocomplete } from '@material-ui/lab';
import Button from '@material-ui/core/Button';
import FindInPageIcon from '@material-ui/icons/FindInPage';

export const SusceptanceAdornment = {
    position: 'end',
    text: 'S',
};

export const OhmAdornment = {
    position: 'end',
    text: 'Ω',
};

export const AmpereAdornment = {
    position: 'end',
    text: 'A',
};

export const ActivePowerAdornment = {
    position: 'end',
    text: 'MW',
};

export const ReactivePowerAdornment = {
    position: 'end',
    text: 'MVar',
};

export const VoltageAdornment = {
    position: 'end',
    text: 'kV',
};

export const filledTextField = {
    variant: 'filled',
};

const DELAY = 1000;

const func_identity = (e) => e;

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
    h4: {
        marginBottom: 0,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
    },
}));

export const gridItem = (field, size = 6) => {
    return (
        <Grid item xs={size} align="start">
            {field}
        </Grid>
    );
};

export const useInputForm = () => {
    const validationMap = useRef(new Map());
    const [toggleClear, setToggleClear] = useState(false);
    const validate = useCallback(() => {
        // Check if error list contains an error
        return Array.from(validationMap.current.values())
            .map((e) => e())
            .every((res) => res);
    }, []);
    const addValidation = useCallback((id, validate) => {
        validationMap.current.set(id, validate);
    }, []);
    const clear = useCallback(() => {
        setToggleClear((oldValue) => !oldValue);
    }, []);
    const reset = useCallback((label, validate) => {
        validationMap.current = new Map();
    }, []);
    return {
        toggleClear,
        clear,
        validate,
        addValidation,
        reset,
    };
};

export const useTextValue = ({
    label,
    id,
    defaultValue = '',
    validation = {},
    adornment,
    transformValue = func_identity,
    inputForm,
    formProps,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();
    const [error, setError] = useState();

    const validationRef = useRef();
    const classes = useStyles();

    validationRef.current = validation;

    useEffect(() => {
        function validate() {
            const res = validateField('' + value, validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [label, inputForm, value, id]);

    const handleChangeValue = useCallback(
        (event) => {
            setValue(transformValue(event.target.value));
        },
        [transformValue]
    );

    const field = useMemo(() => {
        const Field = adornment ? TextFieldWithAdornment : TextField;
        return (
            <Field
                key={id ? id : label}
                size="small"
                fullWidth
                id={id ? id : label}
                label={
                    intl.formatMessage({
                        id: label,
                    }) +
                    ' ' +
                    (!validation.isFieldRequired
                        ? intl.formatMessage({
                              id: 'Optional',
                          })
                        : '')
                }
                {...(adornment && {
                    adornmentPosition: adornment.position,
                    adornmentText: adornment?.text,
                })}
                value={'' + value} // handle numerical value
                onChange={handleChangeValue}
                FormHelperTextProps={{
                    className: classes.helperText,
                }}
                {...(error && {
                    error: true,
                    helperText: intl.formatMessage({
                        id: error,
                    }),
                })}
                {...formProps}
            />
        );
    }, [
        label,
        id,
        intl,
        adornment,
        value,
        handleChangeValue,
        error,
        formProps,
        classes,
        validation.isFieldRequired,
    ]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );
    return [value, field];
};

function toIntValue(val) {
    if (val === '-') return val;
    return parseInt(val) || 0;
}

export function toPositiveIntValue(val) {
    val.replace('-', '');
    return parseInt(val) || 0;
}

export const useIntegerValue = ({
    transformValue = toIntValue,
    validation,
    ...props
}) => {
    return useTextValue({
        ...props,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
    });
};

const toFloatValue = (val) => {
    if (val === '-') return val;
    // TODO: remove replace when parsing behaviour will be made according to locale
    // Replace ',' by '.' to ensure double values can be parsed correctly
    const tmp = val?.replace(',', '.') || '';
    if (tmp.endsWith('.')) return val;
    return parseFloat(val) || 0;
};

export const useDoubleValue = ({
    transformValue = toFloatValue,
    validation,
    ...props
}) => {
    return useTextValue({
        ...props,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
    });
};

export const useBooleanValue = ({
    label,
    id,
    defaultValue,
    validation = {},
    inputForm,
    formProps,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();

    useEffect(() => {
        function validate() {
            return true;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [label, validation, inputForm, value, id]);

    const handleChangeValue = useCallback((event) => {
        setValue(event.target.checked);
    }, []);

    const field = useMemo(() => {
        return (
            <FormControlLabel
                id={id ? id : label}
                control={
                    <Switch
                        checked={value}
                        onChange={(e) => handleChangeValue(e)}
                        value="checked"
                        color="primary"
                        inputProps={{
                            'aria-label': 'primary checkbox',
                        }}
                        {...formProps}
                    />
                }
                label={intl.formatMessage({
                    id: label,
                })}
            />
        );
    }, [intl, label, value, handleChangeValue, formProps, id]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );

    return [value, field];
};

export const useConnectivityValue = ({
    label,
    id,
    validation = {
        isFieldRequired: true,
    },
    inputForm,
    voltageLevelOptions,
    workingNodeUuid,
    direction = 'row',
    voltageLevelIdDefaultValue,
    busOrBusbarSectionIdDefaultValue,
}) => {
    const [connectivity, setConnectivity] = useState({
        voltageLevel: null,
        busOrBusbarSection: null,
    });
    const [errorVoltageLevel, setErrorVoltageLevel] = useState();
    const [errorBusBarSection, setErrorBusBarSection] = useState();
    const intl = useIntl();

    useEffect(
        () =>
            setConnectivity({
                voltageLevel: null,
                busOrBusbarSection: null,
            }),
        [inputForm.toggleClear]
    );

    useEffect(() => {
        setConnectivity({
            voltageLevel: voltageLevelIdDefaultValue
                ? voltageLevelOptions.find(
                      (value) => value.id === voltageLevelIdDefaultValue
                  )
                : null,
            busOrBusbarSection: busOrBusbarSectionIdDefaultValue,
        });
    }, [
        voltageLevelOptions,
        busOrBusbarSectionIdDefaultValue,
        voltageLevelIdDefaultValue,
    ]);

    useEffect(() => {
        function validate() {
            const resVL = validateField(connectivity.voltageLevel, validation);
            setErrorVoltageLevel(resVL?.errorMsgId);
            const resBBS = validateField(
                connectivity.busOrBusbarSection,
                validation
            );
            setErrorBusBarSection(resBBS?.errorMsgId);
            return !resVL.error && !resBBS.error;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [connectivity, label, validation, inputForm, id]);

    const setVoltageLevel = useCallback((newVal) => {
        setConnectivity((oldVal) => {
            return { ...oldVal, voltageLevel: newVal };
        });
    }, []);

    const setBusOrBusbarSection = useCallback((newVal) => {
        setConnectivity((oldVal) => {
            return { ...oldVal, busOrBusbarSection: newVal };
        });
    }, []);

    const render = useMemo(() => {
        return (
            <ConnectivityEdition
                voltageLevelOptions={voltageLevelOptions}
                voltageLevel={connectivity.voltageLevel}
                busOrBusbarSection={connectivity.busOrBusbarSection}
                onChangeVoltageLevel={(value) => setVoltageLevel(value)}
                onChangeBusOrBusbarSection={(busOrBusbarSection) =>
                    setBusOrBusbarSection(busOrBusbarSection)
                }
                errorVoltageLevel={errorVoltageLevel}
                helperTextVoltageLevel={
                    errorVoltageLevel &&
                    intl.formatMessage({
                        id: errorVoltageLevel,
                    })
                }
                errorBusOrBusBarSection={errorBusBarSection}
                helperTextBusOrBusBarSection={
                    errorBusBarSection &&
                    intl.formatMessage({
                        id: errorBusBarSection,
                    })
                }
                workingNodeUuid={workingNodeUuid}
                direction={direction}
            />
        );
    }, [
        connectivity,
        direction,
        errorBusBarSection,
        errorVoltageLevel,
        intl,
        setBusOrBusbarSection,
        setVoltageLevel,
        voltageLevelOptions,
        workingNodeUuid,
    ]);

    return [connectivity, render];
};

export const useAutocompleteField = ({
    label,
    validation = {},
    inputForm,
    defaultValue,
    formProps,
    values,
}) => {
    const [value, setValue] = useState('');

    const intl = useIntl();

    useEffect(() => {
        function validate() {
            return true;
        }
        inputForm.addValidation(label, validate);
    }, [label, validation, inputForm, value]);

    const handleChangeValue = useCallback((value) => {
        setValue(value);
    }, []);

    const field = useMemo(() => {
        return (
            <Autocomplete
                id={label}
                onChange={(event, newValue) => {
                    handleChangeValue(newValue);
                }}
                options={Object.keys(values.object())}
                getOptionLabel={(code) => values.get(code)}
                defaultValue={defaultValue}
                renderInput={(props) => (
                    <TextField
                        {...formProps}
                        {...props}
                        variant="filled"
                        size="small"
                        label={
                            intl.formatMessage({
                                id: label,
                            }) +
                            ' ' +
                            (!validation.isFieldRequired
                                ? intl.formatMessage({
                                      id: 'Optional',
                                  })
                                : '')
                        }
                        value={value}
                    />
                )}
            />
        );
    }, [
        label,
        value,
        handleChangeValue,
        formProps,
        values,
        intl,
        defaultValue,
        validation.isFieldRequired,
    ]);

    return [value, field];
};

export const useSearchEquipmentField = ({ handleOpenSearchDialog, label }) => {
    const classes = useStyles();

    const button = useMemo(() => {
        return (
            <Tooltip
                title={<FormattedMessage id={label} />}
                placement="top"
                arrow
                enterDelay={DELAY}
                enterNextDelay={DELAY}
                classes={{ tooltip: classes.tooltip }}
            >
                <Button onClick={handleOpenSearchDialog}>
                    <FindInPageIcon />
                </Button>
            </Tooltip>
        );
    }, [label, handleOpenSearchDialog, classes.tooltip]);
    return button;
};

export const useEnumValue = ({
    label,
    defaultValue,
    validation = {},
    inputForm,
    formProps,
    enumValues,
}) => {
    const intl = useIntl();
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        function validate() {
            return true;
        }
        inputForm.addValidation(label, validate);
    }, [label, validation, inputForm, value]);

    const handleChangeValue = useCallback((event) => {
        setValue(event.target.value);
    }, []);

    const field = useMemo(() => {
        return (
            <FormControl fullWidth size="small">
                {/*This InputLabel is necessary in order to display
                            the label describing the content of the Select*/}
                <InputLabel id="enum-type-label" variant={'filled'}>
                    {intl.formatMessage({
                        id: label,
                    }) +
                        ' ' +
                        (!validation.isFieldRequired
                            ? intl.formatMessage({
                                  id: 'Optional',
                              })
                            : '')}
                </InputLabel>
                <Select
                    id={label}
                    value={value}
                    onChange={handleChangeValue}
                    variant="filled"
                    fullWidth
                    {...formProps}
                >
                    {enumValues.map((e, index) => (
                        <MenuItem value={e.id} key={e.id + '_' + index}>
                            <em>
                                <FormattedMessage id={e.label} />
                            </em>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }, [
        label,
        value,
        handleChangeValue,
        formProps,
        enumValues,
        intl,
        validation.isFieldRequired,
    ]);

    useEffect(() => {
        setValue('');
    }, [inputForm.toggleClear]);

    useEffect(() => {
        setValue(defaultValue || '');
    }, [defaultValue]);

    return [value, field];
};

export const GridSection = ({ title, size = 12 }) => {
    const classes = useStyles();
    return (
        <Grid container spacing={2}>
            <Grid item xs={size}>
                <h3 className={classes.h3}>
                    <FormattedMessage id={title} />
                </h3>
            </Grid>
        </Grid>
    );
};
