/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import { lighten, styled, Theme } from '@mui/material/styles';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import Typography from '@mui/material/Typography';
import { Checkbox, Chip } from '@mui/material';
import { useDebounce } from '@gridsuite/commons-ui';

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const [optionProps, option, selected, getOptionLabel] = data[index];
    const inlineStyle = {
        ...style,
        top: (style.top as number) + LISTBOX_PADDING,
    };

    return (
        <Typography component="li" {...optionProps} noWrap style={inlineStyle}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            {`${getOptionLabel(option)}`}
        </Typography>
    );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
        if (ref.current != null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactElement[] = [];
    (children as React.ReactElement[]).forEach(
        (item: React.ReactElement & { children?: React.ReactElement[] }) => {
            itemData.push(item);
            itemData.push(...(item.children || []));
        }
    );

    const itemCount = itemData.length;
    const itemSize = 48;

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.length * itemSize;
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LISTBOX_PADDING}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(index) => itemSize}
                    overscanCount={5}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
});

const styles = {
    autocomplete: (theme: Theme) => ({
        '.MuiAutocomplete-inputRoot': {
            height: '40px',
            backgroundColor: 'unset', // prevents the field from changing size when selected with the keyboard
        },
        '.Mui-expanded, .Mui-focused, .Mui-focusVisible': {
            position: 'absolute',
            width: 'inherit',
            height: 'inherit',
            zIndex: 20,
            background: lighten(theme.palette.background.paper, 0.1),
        },
        '.MuiInputLabel-root': {
            zIndex: 'inherit',
            width: 'auto',
        },
    }),
};

interface CheckboxAutocompleteProps {
    id?: string;
    options: any[];
    virtualize?: boolean;
    getOptionLabel: (option: any) => string;
    onChange: (value: any[]) => void;
}

const CheckboxAutocomplete = ({
    id = '',
    options,
    virtualize,
    getOptionLabel,
    onChange,
}: CheckboxAutocompleteProps) => {
    const [isFocusInput, setIsFocusInput] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');

    const debouncedOnChange = useDebounce(onChange, 500);

    const handleChange = (_event: React.SyntheticEvent, value: any) => {
        debouncedOnChange(value);
    };

    return (
        <Autocomplete
            id={`checkbox-autocomplete-${id}`}
            getOptionLabel={getOptionLabel}
            sx={styles.autocomplete}
            multiple
            disableCloseOnSelect
            size="small"
            disableListWrap
            PopperComponent={StyledPopper}
            ListboxComponent={virtualize ? ListboxComponent : undefined}
            options={options}
            onChange={handleChange}
            inputValue={inputValue}
            onBlur={() => {
                setInputValue('');
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={
                        !isFocusInput ? `${options?.length} options` : undefined
                    }
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
            )}
            renderOption={(props, option, state) =>
                virtualize ? (
                    ([
                        props,
                        option,
                        state.selected,
                        getOptionLabel,
                    ] as React.ReactNode)
                ) : (
                    <Typography
                        component="li"
                        {...props}
                        noWrap
                        style={{
                            ...props.style,
                            top: (props.style?.top as number) + LISTBOX_PADDING,
                        }}
                    >
                        <Checkbox
                            style={{ marginRight: 8 }}
                            checked={state.selected}
                        />
                        {getOptionLabel(option)}
                    </Typography>
                )
            }
            renderTags={(value, getTagProps) =>
                value.map((element, index) => (
                    <Chip
                        size={'small'}
                        label={getOptionLabel(element)}
                        {...getTagProps({ index })}
                    />
                ))
            }
            limitTags={1}
        />
    );
};

export default CheckboxAutocomplete;
