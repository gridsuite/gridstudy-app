/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Autocomplete,
    autocompleteClasses,
    Checkbox,
    createFilterOptions,
    MenuItem,
    styled,
    Popper,
    ListItemText,
    TextField,
} from '@mui/material';
import React, {
    createContext,
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { useIntl } from 'react-intl';
import {
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
import { useDebounce } from '@gridsuite/commons-ui';
import { isEqual } from 'lodash';

const CHECK_ALL = { label: 'SelectAll', value: 'check_all' };
const UNCHECK_ALL = { label: 'UnselectAll', value: 'uncheck_all' };

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
});

// hook
const useResetCache = (data: any) => {
    const ref = useRef<VariableSizeList>(null);
    useEffect(() => {
        if (ref.current !== null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
};

const Row = (childProps: ListChildComponentProps) => {
    const intl = useIntl();
    const { data, index, style } = childProps;
    const [props, option, state] = data[index];
    const inlineStyle = {
        ...style,
        top: (style.top as number) + ITEM_PADDING_TOP,
    };
    if (index === 0) {
        return (
            <MenuItem
                style={inlineStyle}
                key={CHECK_ALL.value}
                value={CHECK_ALL.value}
                {...props}
            >
                <ListItemText
                    primary={intl.formatMessage({ id: CHECK_ALL.label })}
                />
            </MenuItem>
        );
    } else if (index === 1) {
        return (
            <MenuItem
                style={inlineStyle}
                key={UNCHECK_ALL.value}
                value={UNCHECK_ALL.value}
                {...props}
            >
                <ListItemText
                    primary={intl.formatMessage({ id: UNCHECK_ALL.label })}
                />
            </MenuItem>
        );
    } else {
        return (
            <MenuItem
                style={inlineStyle}
                key={option}
                value={option}
                {...props}
            >
                <Checkbox checked={state.selected} />
                <ListItemText>{`#${state.index} - ${option}`}</ListItemText>
            </MenuItem>
        );
    }
};

const OuterElementContext = createContext({});

const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
});

const VirtualizedList = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLElement> & { rowHeight: number; height: number }
>((props, ref) => {
    const { children, ...outerProps } = props;

    const itemData: React.ReactElement[] = [];
    (children as React.ReactElement[]).forEach(
        (item: React.ReactElement & { children?: React.ReactElement[] }) => {
            itemData.push(item);
            itemData.push(...(item.children || []));
        }
    );

    const itemCount = itemData.length;
    const gridRef = useResetCache(itemCount);
    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={outerProps}>
                <VariableSizeList
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    // innerElementType={'ul'}
                    overscanCount={5}
                    itemSize={() => props.rowHeight}
                    height={props.height}
                    itemCount={itemCount}
                    width={'100%'}
                    itemData={itemData}
                >
                    {Row}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

const VirtualizedListComponent = (props: any, ref: ForwardedRef<any>) => {
    return (
        <VirtualizedList
            ref={ref}
            rowHeight={ITEM_HEIGHT}
            height={ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP}
            {...props}
        />
    );
};

interface VirtualizedCheckboxAutocompleteProps {
    options: any[];
    getOptionLabel: (option: any) => string;
    onChange: (selectedOptions: any[]) => void;
    value: any;
}

const VirtualizedCheckboxAutocomplete = ({
    options,
    getOptionLabel,
    onChange,
    value,
}: VirtualizedCheckboxAutocompleteProps) => {
    // see https://codesandbox.io/p/sandbox/mutable-lake-yc52pp
    // manage the search input text
    const [isFocusInput, setIsFocusInput] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');

    // manage all selected options
    const [selectedOptions, setSelectedOptions] = useState<any[]>(value ?? []);
    // manage options filtered by input value
    const [filteredOptions, setFilteredOptions] = useState<any[]>([]);

    console.log('Virtualized-rerender', {
        selectedOptions,
        filteredOptions,
        searchInput: inputValue,
    });

    const clearSelected = useCallback(
        (candidates: any[]) => {
            // keep only elements which are not in the candidates
            if (candidates.length > 0) {
                setSelectedOptions(
                    selectedOptions.filter(
                        (elem) =>
                            !candidates.find((candidate) => candidate === elem)
                    )
                );
            } else {
                // no candidates => clear all
                setSelectedOptions([]);
            }
        },
        [selectedOptions]
    );
    const handleToggleOption = useCallback(
        (selectedOptions: any[]) => setSelectedOptions(selectedOptions),
        []
    );

    const handleClearOptions = useCallback(() => setSelectedOptions([]), []);

    const handleToggleAll = useCallback(
        (isSelected: boolean) => {
            let candidates = [];
            if (
                filteredOptions?.length > 0 &&
                filteredOptions.length !== options.length
            ) {
                // get only options which are in the filteredOptions
                candidates = options.filter((option) =>
                    filteredOptions.find(
                        (filteredOption) => filteredOption === option
                    )
                );
            }

            if (isSelected) {
                // check all
                if (candidates.length > 0) {
                    setSelectedOptions([...selectedOptions, ...candidates]);
                } else {
                    // no candidates => select all options
                    setSelectedOptions(options);
                }
            } else {
                // uncheck all
                clearSelected(candidates);
            }
        },
        [options, filteredOptions, selectedOptions, clearSelected]
    );

    const handleChange = useCallback(
        (event: any, selectedOptions: any[], reason: any) => {
            if (['selectOption', 'removeOption'].includes(reason)) {
                // check whether Check All is selected
                if (
                    selectedOptions?.find(
                        (option: any) => option === CHECK_ALL.value
                    )
                ) {
                    // must check all items
                    handleToggleAll(true);
                } else if (
                    selectedOptions?.find(
                        (option: any) => option === UNCHECK_ALL.value
                    )
                ) {
                    handleToggleAll(false);
                } else {
                    handleToggleOption(selectedOptions);
                }
            } else if (['clear'].includes(reason)) {
                handleClearOptions();
            }
        },
        [handleToggleAll, handleToggleOption, handleClearOptions]
    );

    // used for memorizing filtered options into component's state
    const updateFilteredOptions = useCallback(
        (newFilterOptions: any[]) => {
            if (
                newFilterOptions &&
                !isEqual(newFilterOptions, filteredOptions)
            ) {
                setFilteredOptions(newFilterOptions);
            }
        },
        [filteredOptions, setFilteredOptions]
    );
    const debouncedUpdateFilteredOptions = useDebounce(
        updateFilteredOptions,
        500
    );

    const filter = useMemo(() => createFilterOptions(), []);
    const filterOptions = useCallback(
        (options: any[], params: any) => {
            const filteredOptions = filter(options, params);

            // memorize filtered options which are taken when processing check all
            debouncedUpdateFilteredOptions(filteredOptions);

            return [CHECK_ALL.value, UNCHECK_ALL.value, ...filteredOptions];
        },
        [filter, debouncedUpdateFilteredOptions]
    );

    const renderTags = useCallback(
        (selectedItems: any[]) => {
            console.log('renderTags', { selectedItems });
            // when search input is focus, do not render tags
            if (isFocusInput) {
                return null;
            }

            if (selectedOptions.length === 1) {
                return getOptionLabel(selectedOptions[0]);
            } else {
                return `${getOptionLabel(
                    selectedOptions[selectedOptions.length - 1]
                )} (+${selectedOptions.length - 1})`;
            }
        },
        [getOptionLabel, isFocusInput, selectedOptions]
    );

    const renderInput = useCallback((params: AutocompleteRenderInputParams) => {
        return (
            <TextField
                {...params}
                onChange={(event) => {
                    setInputValue(event.target.value);
                }}
                onFocus={() => {
                    setIsFocusInput(true);
                }}
                onBlur={() => {
                    setIsFocusInput(false);
                }}
            />
        );
    }, []);

    const renderOption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: any,
        state: AutocompleteRenderOptionState
    ) => [props, option, state] as React.ReactNode;

    const ListBoxComponent = forwardRef(VirtualizedListComponent);

    return (
        <Autocomplete
            multiple
            PopperComponent={StyledPopper}
            disableListWrap
            disableClearable
            disableCloseOnSelect
            size={'small'}
            renderInput={renderInput}
            options={options}
            renderOption={renderOption}
            ListboxComponent={ListBoxComponent}
            value={selectedOptions}
            inputValue={inputValue}
            onChange={handleChange}
            filterOptions={filterOptions}
            renderTags={renderTags}
            limitTags={1}
            onBlur={() => {
                setInputValue('');
            }}
        />
    );
};

export default VirtualizedCheckboxAutocomplete;
