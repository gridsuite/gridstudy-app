/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import PropTypes from 'prop-types';
import TreeItem from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import Label from '@mui/icons-material/Label';
import ReportTreeViewContext from './report-tree-view-context';
import { alpha } from '@mui/system';

const styles = {
    root: (theme) => ({
        color: theme.palette.text.secondary,
        '&:hover > .MuiTreeItem-content': {
            backgroundColor: theme.palette.action.hover,
        },
    }),
    content: (theme) => ({
        color: theme.palette.text.secondary,
        borderRadius: theme.spacing(2),
        width: 'fit-content',
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        '&.Mui-expanded': {
            fontWeight: theme.typography.fontWeightRegular,
        },
        /* &.MuiTreeItem-content.Mui-focused to increase specifity because mui5 has a rule for &.Mui-selected.Mui-focused */
        '&.MuiTreeItem-content.Mui-focused, &.Mui-selected': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
            color: 'var(--tree-view-color)',
        },
        // same as mui v4 behavior on label text only right after clicking in contrast to after moving away with arrow keys.
        '&.Mui-selected .MuiTreeItem-label:hover, &.Mui-selected.Mui-focused .MuiTreeItem-label':
            {
                borderRadius: theme.spacing(2),
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity +
                        theme.palette.action.hoverOpacity
                ),
            },
        '&.Mui-focused .MuiTreeItem-label, &:hover .MuiTreeItem-label, &Mui-selected .MuiTreeItem-label':
            {
                backgroundColor: 'transparent',
            },
    }),
    group: (theme) => ({
        marginLeft: '10px',
        '& .MuiTreeItem-content': {
            paddingLeft: theme.spacing(2),
        },
    }),
    expanded: {},
    selected: {},
    label: {
        fontWeight: 'inherit',
        color: 'inherit',
    },
    labelRoot: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),
    }),
    labelRootHighlighted: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),
        backgroundColor: theme.palette.action.selected,
    }),
    labelIcon: (theme) => ({
        marginRight: theme.spacing(1),
    }),
    labelText: (theme) => ({
        fontWeight: 'inherit',
        marginRight: theme.spacing(2),
    }),
};

const ReportItem = (props) => {
    // using a context because TreeItem uses useMemo on this. See report-viewer.js for the provider
    const { isHighlighted } = useContext(ReportTreeViewContext);

    const highlighted = isHighlighted ? isHighlighted(props.nodeId) : false;

    const { labelText, labelIconColor, className, ...other } = props;

    return (
        <TreeItem
            className={className}
            sx={{
                '&': styles.root,
                '& .MuiTreeItem-content': styles.content,
                '& .Mui-expanded': styles.expanded,
                '& .Mui-selected': styles.selected,
                '& .MuiTreeItem-group': styles.group,
                '& .MuiTreeItem-label': styles.label,
            }}
            label={
                <Box
                    sx={
                        highlighted
                            ? styles.labelRootHighlighted
                            : styles.labelRoot
                    }
                >
                    <Label htmlColor={labelIconColor} sx={styles.labelIcon} />
                    <Typography variant="body2" sx={styles.labelText}>
                        {labelText}
                    </Typography>
                </Box>
            }
            {...other}
        />
    );
};

ReportItem.propTypes = {
    bgColor: PropTypes.string,
    color: PropTypes.string,
    labelInfo: PropTypes.string,
    labelText: PropTypes.string.isRequired,
};

export default styled(ReportItem)({});
