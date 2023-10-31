/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import Popper from '@mui/material/Popper';
import { useTheme, styled } from '@mui/material/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { Checkbox, MenuItem } from '@mui/material';
import { useCallback } from 'react';
import ListItemText from '@mui/material/ListItemText';

const LIST_BOX_PADDING = 4; // px

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const inlineStyle = {
        ...style,
        top: (style.top as number) + LIST_BOX_PADDING,
    };

    return (
        <MenuItem style={inlineStyle}>
            <Checkbox checked={true} />
            <ListItemText>{`#${dataSet[2] + 1} - ${dataSet[1]}`}</ListItemText>
        </MenuItem>
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

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
        noSsr: true,
    });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child: React.ReactElement) => {
        return itemSize;
    };

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LIST_BOX_PADDING}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(index) => getChildSize(itemData[index])}
                    overscanCount={5}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

function random(length: number) {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }

    return result;
}

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
});

const OPTIONS = Array.from(new Array(10000))
    .map(() => random(10 + Math.ceil(Math.random() * 20)))
    .sort((a: string, b: string) =>
        a.toUpperCase().localeCompare(b.toUpperCase())
    );

export default function VirtualizedCheckboxAutocompleteV2() {
    const tagRenderer = useCallback((selectedOptions: any) => {
        if (selectedOptions.length === 1) {
            return selectedOptions[0];
        } else if (selectedOptions.length > 1) {
            return `${selectedOptions[selectedOptions.length - 1]} ...`;
        }
        return '';
    }, []);

    return (
        <Autocomplete
            size={'small'}
            disableListWrap
            PopperComponent={StyledPopper}
            ListboxComponent={ListboxComponent}
            options={OPTIONS}
            renderInput={(params) => <TextField {...params} />}
            renderOption={(props, option, state) =>
                [props, option, state.index] as React.ReactNode
            }
            renderGroup={(params) => params as any}
            renderTags={tagRenderer}
        />
    );
}
