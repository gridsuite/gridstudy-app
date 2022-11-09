/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import InputAdornment from '@mui/material/InputAdornment';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { validateField } from '../../util/validation-functions';
import {
    CircularProgress,
    FormHelperText,
    FormLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Tooltip,
    Button,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import TextFieldWithAdornment from '../../util/text-field-with-adornment';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import {
    func_identity,
    toFloatValue,
    toIntValue,
    useStyles,
} from '../dialogUtils';
import { getComputedLanguage } from '../../../utils/language';
import { PARAM_LANGUAGE } from '../../../utils/config-params';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { useSnackMessage } from '../../../utils/messages';
import { isNodeExists } from '../../../utils/rest-api';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';
import { useParameterState } from '../parameters/parameters';
import {
    FieldLabel,
    genHelperError,
    genHelperPreviousValue,
} from './hooks-helpers';
import { useAutocompleteField } from './use-autocomplete-field';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import RegulatingTerminalEdition, {
    makeRefreshRegulatingTerminalSectionsCallback,
} from '../regulating-terminal-edition';
import Papa from 'papaparse';
import FormControlLabel from '@mui/material/FormControlLabel';

export const useInputForm = () => {
    const validationMap = useRef(new Map());
    const [toggleClear, setToggleClear] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
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

    return useMemo(() => {
        return {
            toggleClear,
            clear,
            validate,
            addValidation,
            reset,
            hasChanged,
            setHasChanged,
        };
    }, [toggleClear, clear, validate, addValidation, reset, hasChanged]);
};

export const useTextValue = ({
    label,
    id,
    defaultValue = '',
    validation = {},
    adornment,
    transformValue = func_identity,
    acceptValue,
    inputForm,
    formProps,
    errorMsg,
    previousValue,
    clearable,
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState();

    const validationRef = useRef();
    const classes = useStyles();

    validationRef.current = validation;

    useEffect(() => {
        function validate() {
            const res = validateField(value, validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }

        inputForm.addValidation(id ? id : label, validate);
    }, [label, inputForm, value, id, validation]);

    const handleChangeValue = useCallback(
        (event) => {
            if (acceptValue === undefined || acceptValue(event.target.value))
                setValue(transformValue(event.target.value));
            inputForm.setHasChanged(true);
        },
        [acceptValue, inputForm, transformValue]
    );

    const handleClearValue = useCallback(() => {
        setValue('');
    }, []);

    const field = useMemo(() => {
        const Field = adornment ? TextFieldWithAdornment : TextField;
        return (
            <Field
                key={id ? id : label}
                size="small"
                fullWidth
                id={id ? id : label}
                label={FieldLabel({
                    label,
                    optional:
                        validation.isFieldRequired === false &&
                        !formProps?.disabled,
                })}
                {...(adornment && {
                    adornmentPosition: adornment.position,
                    adornmentText: adornment?.text,
                })}
                value={'' + value} // handle numerical value
                onChange={handleChangeValue}
                FormHelperTextProps={{
                    className: classes.helperText,
                }}
                InputProps={
                    clearable && value
                        ? {
                              endAdornment: (
                                  <InputAdornment position="end">
                                      <IconButton onClick={handleClearValue}>
                                          <ClearIcon />
                                      </IconButton>
                                  </InputAdornment>
                              ),
                          }
                        : {}
                }
                {...(clearable &&
                    adornment && { handleClearValue: handleClearValue })}
                {...genHelperPreviousValue(previousValue, adornment)}
                {...genHelperError(error, errorMsg)}
                {...formProps}
            />
        );
    }, [
        adornment,
        id,
        label,
        validation.isFieldRequired,
        value,
        previousValue,
        handleChangeValue,
        classes.helperText,
        error,
        errorMsg,
        formProps,
        clearable,
        handleClearValue,
    ]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );
    return [value, field];
};

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

function isFloatNumber(val) {
    return /^-?[0-9]*[.,]?[0-9]*$/.test(val);
}

export const useDoubleValue = ({
    transformValue = toFloatValue,
    validation,
    ...props
}) => {
    return useTextValue({
        ...props,
        acceptValue: isFloatNumber,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
    });
};

export const useButtonWithTooltip = ({ handleClick, label }) => {
    const classes = useStyles();

    return useMemo(() => {
        return (
            <Tooltip
                title={<FormattedMessage id={label} />}
                placement="top"
                arrow
                enterDelay={TOOLTIP_DELAY}
                enterNextDelay={TOOLTIP_DELAY}
                classes={{ tooltip: classes.tooltip }}
            >
                <IconButton style={{ padding: '2px' }} onClick={handleClick}>
                    <FindInPageIcon />
                </IconButton>
            </Tooltip>
        );
    }, [label, handleClick, classes.tooltip]);
};

export const useOptionalEnumValue = (props) => {
    const intl = useIntl();

    const getEnumTranslation = useCallback(
        (enumValue) => {
            // translate the label of enumValue
            const enumTranslation = props.enumObjects
                .filter((enumObject) => enumObject.id === enumValue)
                .map((enumObject) =>
                    intl.formatMessage({ id: enumObject.label })
                );
            return enumTranslation.length === 1
                ? enumTranslation.at(0)
                : enumValue;
        },
        [intl, props.enumObjects]
    );

    // because we want to have the clear icon to possibly reset the optional enum value to null,
    // we use an Autocomplete without the ability to enter some letters in the text field (readonly then).
    return useAutocompleteField({
        values: props.enumObjects.map((enumObject) => enumObject.id),
        selectedValue: props.defaultValue,
        defaultValue: props.defaultValue,
        previousValue: props.previousValue,
        getLabel: getEnumTranslation,
        readOnlyTextField: true,
        ...props,
    });
};

export const useCountryValue = (props) => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    const [code, setCode] = useState(props.defaultCodeValue);

    // supposed cached by node.js
    const englishCountriesModule = require('localized-countries')(
        require('localized-countries/data/en')
    );
    const localizedCountriesModule = useMemo(() => {
        try {
            return require('localized-countries')(
                require('localized-countries/data/' +
                    getComputedLanguage(languageLocal).substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            return englishCountriesModule;
        }
    }, [languageLocal, englishCountriesModule]);

    useEffect(() => {
        //We only need to search for the code if we only have the label
        if (props.defaultLabelValue && !props.defaultCodeValue) {
            // code -> name is currently done in NetworkMapService::toDataMap and gives english
            let res = englishCountriesModule
                .array()
                .filter(
                    (obj) =>
                        obj.label.toLowerCase() ===
                        props.defaultLabelValue.toLowerCase()
                )[0];
            setCode(res.code);
        } else if (props.defaultCodeValue !== null) {
            setCode(props.defaultCodeValue);
        } else {
            setCode(null);
        }
    }, [
        englishCountriesModule,
        props.defaultLabelValue,
        props.defaultCodeValue,
    ]);

    const values = useMemo(
        () =>
            localizedCountriesModule
                ? Object.keys(localizedCountriesModule.object())
                : [],
        [localizedCountriesModule]
    );
    const getOptionLabel = useCallback(
        (code) => localizedCountriesModule.get(code),
        [localizedCountriesModule]
    );

    return useAutocompleteField({
        values,
        getLabel: getOptionLabel,
        selectedValue: code,
        defaultValue: code,
        ...props,
    });
};

const getObjectId = (e) => e.id;
const getLabel = (e) => e.label;

export const useEnumValue = ({
    label,
    defaultValue,
    previousValue,
    validation = {},
    inputForm,
    formProps,
    enumValues,
    doTranslation = true,
    getId = getObjectId,
    getEnumLabel = getLabel,
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState();

    useEffect(() => {
        function validate() {
            const res = validateField(value, validation);
            setError(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation(label, validate);
    }, [label, validation, inputForm, value]);

    const handleChangeValue = useCallback(
        (event) => {
            setValue(event.target.value);
            inputForm.setHasChanged(true);
        },
        [inputForm]
    );

    const field = useMemo(() => {
        return (
            <FormControl fullWidth size="small" error={!!error}>
                {/*This InputLabel is necessary in order to display
                            the label describing the content of the Select*/}
                <InputLabel id="enum-type-label" {...formProps}>
                    <FieldLabel
                        label={label}
                        optional={validation.isFieldRequired === false}
                    />
                </InputLabel>
                <Select
                    label={label}
                    id={label}
                    value={value || ''}
                    onChange={handleChangeValue}
                    fullWidth
                    {...formProps}
                >
                    {enumValues.map((e, index) => (
                        <MenuItem value={getId(e)} key={e.id + '_' + index}>
                            <em>
                                {doTranslation && (
                                    <FormattedMessage id={getEnumLabel(e)} />
                                )}
                                {!doTranslation && getEnumLabel(e)}
                            </em>
                        </MenuItem>
                    ))}
                </Select>
                {previousValue && (
                    <FormHelperText>{previousValue}</FormHelperText>
                )}
                {error && (
                    <FormHelperText>
                        <FormattedMessage id={error} />
                    </FormHelperText>
                )}
            </FormControl>
        );
    }, [
        error,
        formProps,
        label,
        validation.isFieldRequired,
        value,
        handleChangeValue,
        enumValues,
        previousValue,
        getId,
        doTranslation,
        getEnumLabel,
    ]);

    useEffect(() => {
        setValue('');
    }, [inputForm.toggleClear]);

    useEffect(() => {
        setValue(defaultValue || '');
    }, [defaultValue]);

    return [value, field];
};
export const useRegulatingTerminalValue = ({
    label,
    id,
    validation = {
        isFieldRequired: false,
    },
    disabled = false,
    inputForm,
    voltageLevelOptionsPromise,
    direction = 'row',
    voltageLevelIdDefaultValue,
    equipmentSectionTypeDefaultValue,
    equipmentSectionIdDefaultValue,
}) => {
    const [regulatingTerminal, setRegulatingTerminal] = useState({
        voltageLevel: voltageLevelIdDefaultValue,
        equipmentSection: {
            id: equipmentSectionIdDefaultValue,
            type: equipmentSectionTypeDefaultValue,
        },
    });
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [voltageLevelsEquipments, setVoltageLevelsEquipments] = useState([]);

    useEffect(() => {
        setRegulatingTerminal({
            voltageLevel: null,
            equipmentSection: null,
        });
    }, [inputForm.toggleClear]);

    useEffect(() => {
        if (!voltageLevelOptionsPromise) return;

        voltageLevelOptionsPromise.then((values) => {
            setVoltageLevelOptions(
                Array.from(values, (val) => val.voltageLevel).sort((a, b) =>
                    a.id.localeCompare(b.id)
                )
            );
            setVoltageLevelsEquipments(values);
        });
    }, [voltageLevelOptionsPromise]);

    useEffect(() => {
        if (!voltageLevelOptions) return;
        setRegulatingTerminal({
            voltageLevel: voltageLevelIdDefaultValue
                ? {
                      id: voltageLevelIdDefaultValue,
                      topologyKind: voltageLevelOptions.find(
                          (vl) => vl.id === voltageLevelIdDefaultValue
                      )?.topologyKind,
                  }
                : null,
            equipmentSection:
                equipmentSectionIdDefaultValue &&
                equipmentSectionTypeDefaultValue
                    ? {
                          id: equipmentSectionIdDefaultValue,
                          type: equipmentSectionTypeDefaultValue,
                      }
                    : null,
        });
    }, [
        voltageLevelOptions,
        equipmentSectionIdDefaultValue,
        equipmentSectionTypeDefaultValue,
        voltageLevelIdDefaultValue,
    ]);

    const setVoltageLevel = useCallback((newVal) => {
        setRegulatingTerminal((oldVal) => {
            return { ...oldVal, voltageLevel: newVal };
        });
    }, []);

    const setEquipmentSection = useCallback((newVal) => {
        setRegulatingTerminal((oldVal) => {
            return { ...oldVal, equipmentSection: newVal };
        });
    }, []);

    const render = useMemo(() => {
        return (
            <RegulatingTerminalEdition
                disabled={disabled}
                voltageLevelOptions={voltageLevelOptions}
                regulatingTerminalValue={regulatingTerminal}
                voltageLevelsEquipments={voltageLevelsEquipments}
                onChangeVoltageLevel={(value) => setVoltageLevel(value)}
                onChangeEquipmentSection={(equipmentSection) =>
                    setEquipmentSection(equipmentSection)
                }
                direction={direction}
                voltageLevelEquipmentsCallback={makeRefreshRegulatingTerminalSectionsCallback()}
                equipmentSectionTypeDefaultValue={
                    equipmentSectionTypeDefaultValue
                }
            />
        );
    }, [
        disabled,
        voltageLevelOptions,
        regulatingTerminal,
        voltageLevelsEquipments,
        direction,
        equipmentSectionTypeDefaultValue,
        setVoltageLevel,
        setEquipmentSection,
    ]);

    return [regulatingTerminal, render];
};

// TODO CHARLY remove below
export const useTableValues = ({
    id,
    tableHeadersIds,
    Field,
    inputForm,
    defaultValues,
    isReactiveCapabilityCurveOn,
    disabled = false,
}) => {
    const [values, setValues] = useState([]);
    const classes = useStyles();

    const handleAddValue = useCallback(() => {
        setValues((oldValues) => [...oldValues, {}]);
    }, []);

    const checkValues = useCallback(() => {
        if (defaultValues !== undefined && defaultValues.length !== 0) {
            setValues([...defaultValues]);
        } else {
            setValues([]);
            handleAddValue();
        }
    }, [defaultValues, handleAddValue]);

    useEffect(() => {
        checkValues();
    }, [checkValues]);

    const handleDeleteItem = useCallback(
        (index) => {
            setValues((oldValues) => {
                let newValues = [...oldValues];
                newValues.splice(index, 1);
                return newValues;
            });
            inputForm.reset();
        },
        [inputForm]
    );

    const handleSetValue = useCallback((index, newValue) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues[index] = newValue;
            return newValues;
        });
    }, []);

    useEffect(() => {
        // TODO CHARLY Surveiller cette fonction
        if (!isReactiveCapabilityCurveOn) {
            //TODO When isReactiveCapabilityCurveOn is false, the reactive capability curve component does not change
            // the validation of its values and they still required.
            // we update the validations of reactive capability curve values so they are not required any more.
            // is there a better way to do it ?
            function validate() {
                return !isReactiveCapabilityCurveOn;
            }

            values.forEach((value, index) => {
                inputForm.addValidation('P' + index, validate);
                inputForm.addValidation('QmaxP' + index, validate);
                inputForm.addValidation('QminP' + index, validate);
            });
        }
    }, [inputForm, values, isReactiveCapabilityCurveOn]);

    const field = useMemo(() => {
        return (
            <Grid item container spacing={2}>
                {tableHeadersIds.map((header) => (
                    <Grid key={header} item xs={3}>
                        <FormattedMessage id={header} />
                    </Grid>
                ))}
                <Box sx={{ width: '100%' }} />
                {values.map((value, idx) => (
                    <Grid key={id + idx} container spacing={3} item>
                        <Field
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={idx}
                            inputForm={inputForm}
                            isFieldRequired={isReactiveCapabilityCurveOn}
                            disabled={disabled}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={id + idx}
                                onClick={() => handleDeleteItem(idx)}
                                disabled={disabled || idx === 0}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                        {idx === values.length - 1 && (
                            <Grid item xs={1}>
                                <IconButton
                                    className={classes.icon}
                                    key={id + idx}
                                    onClick={() => handleAddValue()}
                                    disabled={disabled}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                ))}
            </Grid>
        );
    }, [
        values,
        id,
        classes.icon,
        handleAddValue,
        handleDeleteItem,
        handleSetValue,
        inputForm,
        tableHeadersIds,
        isReactiveCapabilityCurveOn,
        disabled,
    ]);

    return [values, field];
};
// TODO CHARLY remove above

export const useSimpleTextValue = ({
    defaultValue,
    adornment,
    error,
    triggerReset,
}) => {
    const [value, setValue] = useState(defaultValue);

    const handleChangeValue = useCallback((event) => {
        setValue(event.target.value);
    }, []);

    const field = useMemo(() => {
        return (
            <TextField
                value={value}
                onChange={handleChangeValue}
                {...(adornment && { InputProps: adornment })}
                error={error !== undefined}
                autoFocus={true}
                fullWidth={true}
            />
        );
    }, [value, handleChangeValue, adornment, error]);

    useEffect(() => setValue(defaultValue), [defaultValue, triggerReset]);

    return [value, field];
};

const inputAdornment = (content) => {
    return {
        endAdornment: <InputAdornment position="end">{content}</InputAdornment>,
    };
};

export const useValidNodeName = ({ studyUuid, defaultValue, triggerReset }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const [isValidName, setIsValidName] = useState(false);
    const [error, setError] = useState();
    const timer = useRef();
    const [checking, setChecking] = useState(undefined);
    const [adornment, setAdornment] = useState();
    const [name, field] = useSimpleTextValue({
        defaultValue,
        adornment,
        error,
        triggerReset,
    });

    const validName = useCallback(
        (name) => {
            if (name !== defaultValue) {
                isNodeExists(studyUuid, name)
                    .then((response) => {
                        if (response.status === 200) {
                            setError(
                                intl.formatMessage({
                                    id: 'nodeNameAlreadyUsed',
                                })
                            );
                            setIsValidName(false);
                        } else {
                            setIsValidName(true);
                        }
                        setChecking(false);
                    })
                    .catch((errorMessage) => {
                        snackError({
                            messageTxt: errorMessage,
                            headerId: 'NodeUpdateError',
                        });
                    });
            } else {
                setChecking(undefined);
            }
        },
        [studyUuid, intl, defaultValue, snackError]
    );

    useEffect(() => {
        if (checking === undefined) setAdornment(null);
        if (checking)
            setAdornment(inputAdornment(<CircularProgress size="1rem" />));
        else if (!isValidName) setAdornment(undefined);
        else
            setAdornment(
                inputAdornment(<CheckIcon style={{ color: 'green' }} />)
            );
    }, [checking, isValidName]);

    useEffect(() => {
        if (name === '' && !timer.current) return; // initial render

        clearTimeout(timer.current);
        setIsValidName(false);
        setAdornment(undefined);
        setChecking(true);
        setError(undefined);
        timer.current = setTimeout(() => validName(name), 700);
    }, [studyUuid, name, validName, triggerReset]);

    return [error, field, isValidName, name];
};

export const useCSVReader = ({ label, header }) => {
    const intl = useIntl();

    const [selectedFile, setSelectedFile] = useState();
    const [fileError, setFileError] = useState();

    const equals = (a, b) =>
        a.length === b.length && a.every((v, i) => v === b[i]);

    const handleFileUpload = useCallback((e) => {
        let files = e.target.files;
        if (files.size === 0) {
            setSelectedFile();
        } else {
            setSelectedFile(files[0]);
        }
    }, []);

    const field = useMemo(() => {
        return (
            <>
                <Button variant="contained" color="primary" component="label">
                    <FormattedMessage id={label} />
                    <input
                        type="file"
                        name="file"
                        onChange={(e) => handleFileUpload(e)}
                        style={{ display: 'none' }}
                    />
                </Button>
                {selectedFile?.name === undefined ? (
                    <FormattedMessage id="uploadMessage" />
                ) : (
                    selectedFile.name
                )}
            </>
        );
    }, [handleFileUpload, label, selectedFile?.name]);

    useEffect(() => {
        if (selectedFile?.type === 'text/csv') {
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    if (equals(header, results.meta.fields)) {
                        setFileError();
                    } else {
                        setFileError(
                            intl.formatMessage({
                                id: 'InvalidRuleHeader',
                            })
                        );
                    }
                },
            });
        } else if (selectedFile) {
            setFileError(
                intl.formatMessage({
                    id: 'InvalidRuleUploadType',
                })
            );
        } else {
            setFileError();
        }
    }, [selectedFile, intl, header]);
    return [selectedFile, setSelectedFile, field, fileError];
};

export const useRadioValue = ({
    label,
    possibleValues = [],
    defaultValue,
    id,
    validation = {},
    inputForm,
    doTranslation = true,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();

    useEffect(() => {
        // Updates the component when the correct default value is given by the parent component.
        if (defaultValue !== undefined && defaultValue.length > 0) {
            setValue(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        function validate() {
            return true;
        }

        inputForm.addValidation(id ? id : label, validate);
    }, [label, validation, inputForm, value, id]);

    const handleChangeValue = useCallback((event) => {
        setValue(event.target.value);
    }, []);

    const field = useMemo(() => {
        return (
            <FormControl>
                {label && (
                    <FormLabel id={id ? id : label}>
                        {intl.formatMessage({ id: label })}
                    </FormLabel>
                )}
                <RadioGroup
                    row
                    aria-labelledby={id ? id : label}
                    value={value ?? defaultValue}
                    onChange={handleChangeValue}
                >
                    {possibleValues.map((value) => (
                        <FormControlLabel
                            value={value}
                            control={<Radio />}
                            label={
                                doTranslation
                                    ? intl.formatMessage({ id: value })
                                    : value
                            }
                        />
                    ))}
                </RadioGroup>
            </FormControl>
        );
    }, [
        intl,
        label,
        handleChangeValue,
        id,
        defaultValue,
        doTranslation,
        possibleValues,
        value,
    ]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );

    return [value, field];
};
