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
    useRef,
} from 'react';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { useIntl } from 'react-intl';
import Popper from '@mui/material/Popper';
import ListItemText from '@mui/material/ListItemText';
import {
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';

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

const Row = (props: ListChildComponentProps) => {
    const intl = useIntl();
    const { data, index, style } = props;
    const dataSet = data[index];
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
                {...dataSet[0]}
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
                {...dataSet[0]}
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
                key={dataSet[1]}
                value={dataSet[1]}
                {...dataSet[0]}
            >
                <Checkbox checked={dataSet[3]} />
                <ListItemText>{`#${dataSet[2] + 1} - ${
                    dataSet[1]
                }`}</ListItemText>
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
    const handleCheckAll = useCallback(() => {
        // propagate by callback
        onChange && onChange(options);
    }, [options, onChange]);

    const handleToggleOption = useCallback(
        (selectedOptions: any[]) => {
            // propagate by callback
            onChange && onChange(selectedOptions);
        },
        [onChange]
    );

    const handleClearOptions = useCallback(() => {
        // propagate by callback
        onChange && onChange([]);
    }, [onChange]);

    const handleChange = useCallback(
        (event: any, selectedOptions: any[], reason: any) => {
            if (['selectOption', 'removeOption'].includes(reason)) {
                // check whether Check All is selected
                if (
                    selectedOptions?.find(
                        (elem: any) => elem === CHECK_ALL.value
                    )
                ) {
                    // must check all items
                    handleCheckAll();
                } else if (
                    selectedOptions?.find(
                        (elem: any) => elem === UNCHECK_ALL.value
                    )
                ) {
                    handleClearOptions();
                } else {
                    handleToggleOption(selectedOptions);
                }
            } else if (['clear'].includes(reason)) {
                handleClearOptions();
            }
        },
        [handleCheckAll, handleToggleOption, handleClearOptions]
    );

    const filterOptions = useCallback((options: any[], params: any) => {
        const defaultFilter = createFilterOptions();
        const filteredOptions = defaultFilter(options, params);
        return [CHECK_ALL.value, UNCHECK_ALL.value, ...filteredOptions];
    }, []);

    const renderInput = (params: AutocompleteRenderInputParams) => (
        <TextField {...params} />
    );

    const renderTags = useCallback(
        (selectedOptions: any[]) => {
            if (selectedOptions.length === 1) {
                return getOptionLabel(selectedOptions[0]);
            } else if (selectedOptions.length > 1) {
                return `${getOptionLabel(
                    selectedOptions[selectedOptions.length - 1]
                )} ...`;
            }
            return '';
        },
        [getOptionLabel]
    );

    const renderOption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: any,
        state: AutocompleteRenderOptionState
    ) => [props, option, state.index, state.selected] as React.ReactNode;

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
            value={value}
            onChange={handleChange}
            filterOptions={filterOptions}
            renderTags={renderTags}
        />
    );
};

export default VirtualizedCheckboxAutocomplete;
