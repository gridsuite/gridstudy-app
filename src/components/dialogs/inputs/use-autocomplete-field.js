/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createFilterOptions } from '@mui/material/useAutocomplete';
import { func_identity, getId } from '../dialogUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { validateField } from '../../util/validation-functions';
import { Autocomplete, TextField } from '@mui/material';
import {
    FieldLabel,
    genHelperError,
    genHelperPreviousValue,
} from './hooks-helpers';

const QUESTIONABLE_SIZE = 1000;

/**
 * Returns the lowest index for which the two given arrays differ.
 * If full shallow match, return -1.
 * if not arrays, return undefined
 * @param a1 an array
 * @param a2 an other array
 * @returns {number|undefined}
 */
function arraysMismatchIndex(a1, a2) {
    if (!Array.isArray(a1) || !Array.isArray(a2)) return undefined;

    if (a1.length !== a2.length) return Math.min(a1.length, a2.length);

    for (var i in a2) {
        if (a1[i] !== a2[i]) {
            return i;
        }
    }
    return -1;
}

const filter = createFilterOptions();

const isWorthLoading = (term, elements, old, minLen, initValues) => {
    const idx = elements.findIndex((e) => e.label === term || e.id === term);
    if (idx >= 0) {
        return false;
    }
    if (term.length < minLen) {
        return false;
    }
    if (!term.startsWith(old)) {
        return true;
    }
    if (!initValues && !elements.length && !old && term) {
        return false;
    }
    if (minLen === 0) {
        return true;
    }
    if (old.length < minLen && (old.length > 0 || elements.length > 0)) {
        return true;
    }
    if (elements.length === QUESTIONABLE_SIZE) {
        return true;
    }

    return false;
};
export const useAutocompleteField = ({
    id,
    label,
    validation = {},
    inputForm,
    formProps,
    onSearchTermChange,
    minCharsBeforeSearch = 3,
    values,
    renderElement,
    getLabel = func_identity,
    allowNewValue = false,
    errorMsg,
    selectedValue,
    defaultValue,
    previousValue,
    loading = false,
}) => {
    const intl = useIntl();

    const [presentedOptions, setPresentedOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(loading);
    const [expanded, setExpanded] = useState(false);
    const [userStr, setUserStr] = useState('');
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState();

    const validationRef = useRef();

    const prevValues = useRef();

    console.debug(
        `autoc id:${id} userStr:'${userStr}'`,
        previousValue,
        defaultValue,
        selectedValue,
        value,
        values,
        isLoading,
        presentedOptions
    );
    validationRef.current = validation;

    useEffect(() => {
        if (defaultValue !== undefined) setValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        function validate() {
            const res = validateField(value, validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }

        if (inputForm) {
            inputForm.addValidation(id ? id : label, validate);
        }
    }, [label, validation, inputForm, value, selectedValue, id]);

    const handleChangeValue = useCallback((value) => {
        setValue(value);
    }, []);

    useEffect(() => {
        if (selectedValue) setValue(selectedValue);
    }, [selectedValue]);

    useEffect(() => {
        const mismatchIdx = arraysMismatchIndex(prevValues.current, values);
        const shouldUpdateValueToo =
            mismatchIdx >= 0 &&
            prevValues.current.length > mismatchIdx &&
            value === prevValues.current[mismatchIdx];

        console.log(
            'upd options',
            prevValues.current,
            values,
            mismatchIdx,
            value,
            shouldUpdateValueToo
        );
        const valuesChanged = prevValues.current !== values;
        prevValues.current = values;

        if (mismatchIdx === -1) {
            if (valuesChanged) setIsLoading(false);

            if (!getLabel) return;

            const inOps = presentedOptions.find((o) => getLabel(o) === value);
            if (inOps) {
                setValue(inOps);
            }

            return;
        }

        if (!values || typeof values === 'function') {
            setIsLoading(false);
            return;
        }

        if (typeof values?.then === 'function') setIsLoading(true);
        const valuePromise = Promise.resolve(values);
        valuePromise.then((vals) => {
            setPresentedOptions(vals);
            if (vals?.length > mismatchIdx && shouldUpdateValueToo) {
                setValue(vals[mismatchIdx]);
            }
            setIsLoading(false);
            if (values?.length === 0) setExpanded(false);
        });
    }, [values, id, defaultValue, getLabel, presentedOptions, value]);

    const handleForcedSearch = useCallback(
        (term) => {
            if (!onSearchTermChange) return;
            setIsLoading(true);
            setExpanded(true);
            onSearchTermChange(term, true);
        },
        [onSearchTermChange]
    );

    const onOpen = useCallback(() => {
        setExpanded(true);

        if (!onSearchTermChange) return;
        if (isWorthLoading(userStr, presentedOptions, userStr, 0, values)) {
            setIsLoading(true);
            console.log('why 1', values, value, presentedOptions, userStr);
            const term =
                !values && !presentedOptions.length && userStr === value
                    ? ''
                    : userStr;
            onSearchTermChange(term, false);
        }
    }, [presentedOptions, userStr, onSearchTermChange, values, value]);

    const handleSearchTermChange = useCallback(
        (term, evt) => {
            if (!onSearchTermChange) return;

            const min = minCharsBeforeSearch;

            setUserStr((old) => {
                console.log(
                    `supposed user str change to '${term}'`,
                    old,
                    values,
                    evt
                );
                if (isWorthLoading(term, presentedOptions, old, min, values)) {
                    setIsLoading(true);
                    onSearchTermChange(term, false);
                }
                return term;
            });
        },
        [values, minCharsBeforeSearch, onSearchTermChange, presentedOptions]
    );

    const field = useMemo(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.code === 'Space') {
                handleForcedSearch(userStr);
            }
        };

        const optionEqualsToValue = (option, input) =>
            option === input || option.id === input || option.id === input?.id;

        const filterOptionsFunc = (options, params) => {
            const filtered = filter(options, params);
            if (
                params.inputValue !== '' &&
                !options.find((opt) => opt.id === params.inputValue)
            ) {
                filtered.push({
                    inputValue: params.inputValue,
                    id: params.inputValue,
                });
            }
            return filtered;
        };

        return (
            <Autocomplete
                id={label}
                onChange={(event, newValue) => {
                    handleChangeValue(newValue);
                }}
                open={expanded}
                onOpen={onOpen}
                onClose={() => {
                    setExpanded(false);
                }}
                size={'small'}
                forcePopupIcon
                options={isLoading ? [] : presentedOptions}
                getOptionLabel={getLabel}
                defaultValue={defaultValue}
                value={value}
                loading={isLoading}
                loadingText={<FormattedMessage id="loadingOptions" />}
                {...(allowNewValue && {
                    freeSolo: true,
                    isOptionEqualToValue: optionEqualsToValue,
                    autoSelect: true,
                    autoComplete: true,
                    autoHighlight: true,
                    blurOnSelect: true,
                    clearOnBlur: true,
                })}
                {...(allowNewValue &&
                    getLabel === getId && {
                        filterOptions: filterOptionsFunc,
                    })}
                onInputChange={(ev, value) => handleSearchTermChange(value, ev)}
                noOptionsText={intl.formatMessage({
                    id: 'element_search/noResult',
                })}
                {...(renderElement && {
                    renderOption: (optionProps, element, { inputValue }) =>
                        renderElement({
                            ...optionProps,
                            element,
                            inputValue,
                        }),
                })}
                renderInput={(props) => (
                    <TextField
                        {...formProps}
                        {...props}
                        onKeyDown={handleKeyDown}
                        size="small"
                        label={
                            <FieldLabel
                                label={label}
                                optional={validation.isFieldRequired === false}
                            />
                        }
                        value={value}
                        {...genHelperPreviousValue(previousValue)}
                        {...genHelperError(error, errorMsg)}
                    />
                )}
            />
        );
    }, [
        label,
        presentedOptions,
        getLabel,
        allowNewValue,
        handleChangeValue,
        validation.isFieldRequired,
        value,
        defaultValue,
        previousValue,
        error,
        errorMsg,
        formProps,
        isLoading,
        expanded,
        handleSearchTermChange,
        handleForcedSearch,
        intl,
        renderElement,
        onOpen,
        userStr,
    ]);

    return [value, field, setValue];
};
