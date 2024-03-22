/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as React from 'react';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import {
    TreeItem,
    TreeItemContentProps,
    TreeItemProps,
    useTreeItemState,
} from '@mui/x-tree-view/TreeItem';

/**
 To have a custom MUI TreeItem where we can toggle a node without changing the current node / triggering handleSelection.
 */
const CustomContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps,
    ref
) {
    const {
        classes,
        className,
        label,
        itemId,
        icon: iconProp,
        expansionIcon,
        displayIcon,
    } = props;

    const {
        disabled,
        expanded,
        selected,
        focused,
        handleExpansion,
        handleSelection,
        preventSelection,
    } = useTreeItemState(itemId);

    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        preventSelection(event);
    };

    const handleExpansionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        handleExpansion(event);
    };

    const handleSelectionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        handleSelection(event);
    };

    return (
        <div
            className={clsx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            onMouseDown={handleMouseDown}
            ref={ref as React.Ref<HTMLDivElement>}
        >
            <div
                onClick={handleExpansionClick}
                className={classes.iconContainer}
            >
                {icon}
            </div>
            <Typography
                onClick={handleSelectionClick}
                component="div"
                className={classes.label}
            >
                {label}
            </Typography>
        </div>
    );
});

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
    props: TreeItemProps,
    ref: React.Ref<HTMLLIElement>
) {
    return <TreeItem ContentComponent={CustomContent} {...props} ref={ref} />;
});

export default CustomTreeItem;
