/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, {
    autocompleteClasses,
    AutocompleteProps,
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import { lighten, styled, Theme } from '@mui/material/styles';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import Typography from '@mui/material/Typography';
import { Checkbox } from '@mui/material';
import { useIntl } from 'react-intl';
import { OverflowableText } from '@gridsuite/commons-ui';

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
            backgroundColor: lighten(theme.palette.background.default, 0.16),
        },
        '&.Mui-focused': {
            '.MuiInputLabel-root': {
                zIndex: 21,
                width: 'auto',
            },
        },
    }),
    checkbox: {
        marginRight: 8,
    },
};

// the virtualized component is customized from the MUI example
// https://mui.com/material-ui/react-autocomplete/#virtualization

const LISTBOX_PADDING = 8; // px

const customOptionStyle = (originalStyle: React.CSSProperties) => ({
    ...originalStyle,
    top: isNaN(originalStyle.top as number)
        ? 0
        : (originalStyle.top as number) + LISTBOX_PADDING,
});

interface RowProps<T> extends React.HTMLAttributes<HTMLElement> {
    option: T;
    selected: boolean;
    getOptionLabel: (option: T) => string;
}

const Row = ({
    option,
    selected,
    getOptionLabel,
    style,
    ...otherProps
}: RowProps<any>) => {
    return (
        <Typography
            component="li"
            {...otherProps}
            noWrap
            style={customOptionStyle(style ?? {})}
        >
            <Checkbox style={styles.checkbox} checked={selected} />
            <OverflowableText text={getOptionLabel(option)} />
        </Typography>
    );
};

const renderRow = (props: ListChildComponentProps) => {
    const { data, index } = props;
    const [option, selected, getOptionLabel, otherProps] = data[index];

    return (
        <Row
            option={option}
            selected={selected}
            getOptionLabel={getOptionLabel}
            {...otherProps}
        />
    );
};

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
                    itemSize={(_index) => itemSize}
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

interface CheckboxAutocompleteProps<T>
    extends Omit<
        AutocompleteProps<T, true, false, false, any>,
        'renderInput' | 'renderOption' | 'inputValue'
    > {
    id?: string;
    virtualize?: boolean;
    maxSelection?: number;
    options: T[];
    getOptionLabel: (option: T) => string;
    onChangeCallback: (value: T[]) => void;
}

const CheckboxAutocomplete: React.FC<CheckboxAutocompleteProps<any>> = ({
    id = '',
    virtualize = false,
    maxSelection = 0,
    options,
    getOptionLabel,
    onChangeCallback,
    ...otherProps
}) => {
    const intl = useIntl();

    // used to manage search text
    const [inputValue, setInputValue] = useState<string>('');

    // these states used as conditions to manage input label
    const [isFocusInput, setIsFocusInput] = useState(false);
    const [isMaxLimitReached, setMaxLimitReached] = useState(false);

    const handleChange = (_event: React.SyntheticEvent, value: any) => {
        if (!maxSelection || value.length <= maxSelection) {
            setMaxLimitReached(false);
            // propagate change to the parent
            onChangeCallback(value);
        } else {
            setMaxLimitReached(true);
        }
    };

    // when lost focus, show number of options
    // when focused, check maxSelection reached to show infos
    const getInputLabel = () => {
        if (!isFocusInput) {
            return `${options?.length} ${intl.formatMessage({
                id: 'options',
            })}`;
        } else {
            if (isMaxLimitReached) {
                return `${maxSelection} ${intl.formatMessage({
                    id: 'maxSelection',
                })}`;
            }
        }
    };

    const renderInput = (params: AutocompleteRenderInputParams) => (
        <TextField
            {...params}
            label={getInputLabel()}
            onChange={(event) => {
                setInputValue(event.target.value);
            }}
            onFocus={() => {
                setIsFocusInput(true);
            }}
            onBlur={() => {
                setIsFocusInput(false);
                setMaxLimitReached(false);
            }}
            color={isMaxLimitReached ? 'warning' : undefined}
        />
    );

    const renderOption = (
        props: React.HTMLAttributes<HTMLElement>,
        option: any,
        state: AutocompleteRenderOptionState
    ) =>
        virtualize ? (
            ([option, state.selected, getOptionLabel, props] as React.ReactNode)
        ) : (
            <Row
                option={option}
                selected={state.selected}
                getOptionLabel={getOptionLabel}
                {...props}
            />
        );

    const handleBlur = () => {
        setInputValue('');
    };

    return (
        <Autocomplete
            id={`checkbox-autocomplete-${id}`}
            sx={styles.autocomplete}
            multiple
            disableCloseOnSelect
            size="small"
            disableListWrap
            PopperComponent={StyledPopper}
            ListboxComponent={virtualize ? ListboxComponent : undefined}
            options={options}
            noOptionsText={intl.formatMessage({ id: 'noOption' })}
            getOptionLabel={getOptionLabel}
            onChange={handleChange}
            inputValue={inputValue}
            onBlur={handleBlur}
            renderInput={renderInput}
            renderOption={renderOption}
            limitTags={1}
            {...otherProps}
        />
    );
};

export default CheckboxAutocomplete;
