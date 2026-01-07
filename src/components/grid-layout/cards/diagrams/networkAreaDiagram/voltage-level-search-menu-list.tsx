import * as React from 'react';
import { List, RowComponentProps } from 'react-window';

function MenuRow({
    index,
    style,
    items,
}: RowComponentProps<{ items: React.ReactElement<React.HTMLAttributes<HTMLLIElement>>[] }>) {
    const option = items[index];

    return React.cloneElement(option, {
        style: {
            ...(option.props.style ?? {}),
            ...style,
        },
    });
}

const ITEM_HEIGHT = 36;
const MAX_ITEMS = 8;
const LISTBOX_PADDING = 12;

// component based on exemple from mui v5 https://v5.mui.com/material-ui/react-autocomplete/#virtualization
// changed a little with methods from our react-window version
export const VoltageLevelSearchMenuList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
    (props, ref) => {
        const { children, ...other } = props;

        const items = children as React.ReactElement<React.HTMLAttributes<HTMLLIElement>>[];

        const height =
            (items.length > MAX_ITEMS ? ITEM_HEIGHT * MAX_ITEMS : items.length * ITEM_HEIGHT) + 2 * LISTBOX_PADDING;

        return (
            <div style={{ height }} ref={ref} {...other}>
                <List
                    rowCount={items.length}
                    rowHeight={ITEM_HEIGHT}
                    rowComponent={MenuRow}
                    rowProps={{ items }}
                    overscanCount={5}
                    style={{
                        height,
                        width: '100%',
                        overflow: 'auto',
                    }}
                />
            </div>
        );
    }
);
