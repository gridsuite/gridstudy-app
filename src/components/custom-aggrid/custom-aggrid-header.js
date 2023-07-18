/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDownward, ArrowUpward, Menu } from '@mui/icons-material';

import {
    Popover,
    IconButton,
    Grid,
    Autocomplete,
    TextField,
    Badge,
} from '@mui/material';
import PropTypes from 'prop-types';

const FONT_SIZE = '0.75rem';
const FILTER_TEXT_FIELD_WIDTH = '250px';

const CustomHeaderComponent = ({
    field,
    displayName,
    filterOptions,
    sortConfig,
    onSortChanged,
    updateFilter,
    filterSelectedOption,
}) => {
    const { colKey, sortWay } = sortConfig || {};
    const isSortActive = colKey === field;

    const [anchorEl, setAnchorEl] = useState(null);
    const [displayFilterIcon, setDisplayFilterIcon] = useState(
        !!filterSelectedOption
    );

    const agGridHeaderContainer = useRef(null);

    const handleShowFilter = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseFilter = () => {
        setAnchorEl(null);
        if (!filterSelectedOption) {
            setDisplayFilterIcon(false);
        }
    };

    const handleFilterChange = (field, data) => {
        updateFilter(field, data);
    };

    const handleSortChange = () => {
        let newSort = null;
        if (!isSortActive || !sortWay) {
            newSort = 1;
        } else if (sortWay > 0) {
            newSort = -1;
        }

        onSortChanged(newSort);
    };

    /* did not use onMouseEnter and onMouseLeave events because there is a
     loader showing on all the page (when fetching new results on sort change)
     making mouse cursor out of the header hiding the filter icon */
    const handleMouseMove = useCallback(
        (event) => {
            const { top, left, bottom, right } =
                agGridHeaderContainer?.current?.getBoundingClientRect() || {};

            const { clientX, clientY } = event || {};

            const isCursorInsideHeader =
                clientX >= left &&
                clientY >= top &&
                clientX <= right &&
                clientY <= bottom;

            setDisplayFilterIcon(
                isCursorInsideHeader || !!filterSelectedOption || anchorEl
            );
        },
        [anchorEl, filterSelectedOption]
    );

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseMove]);

    const open = Boolean(anchorEl);
    const popoverId = open ? `${field}-filter-popover` : undefined;
    const isFilterActive = !!filterOptions.length;

    return (
        <Grid
            ref={agGridHeaderContainer}
            container
            alignItems="center"
            sx={{ height: '100%' }}
        >
            <Grid
                container
                item
                direction={'row'}
                alignItems={'center'}
                sx={{ height: '100%' }}
                xs={10}
                onClick={handleSortChange}
            >
                <Grid item>{displayName}</Grid>
                {isSortActive && sortWay && (
                    <Grid item>
                        <IconButton fontSize="small">
                            {sortWay === 1 ? (
                                <ArrowUpward sx={{ fontSize: FONT_SIZE }} />
                            ) : (
                                <ArrowDownward sx={{ fontSize: FONT_SIZE }} />
                            )}
                        </IconButton>
                    </Grid>
                )}
            </Grid>
            {isFilterActive && displayFilterIcon && (
                <Grid item xs={2}>
                    <IconButton onClick={handleShowFilter}>
                        <Badge
                            color="secondary"
                            variant="dot"
                            invisible={!filterSelectedOption}
                        >
                            <Menu sx={{ fontSize: FONT_SIZE }} />
                        </Badge>
                    </IconButton>
                </Grid>
            )}
            <Popover
                id={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handleCloseFilter}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Autocomplete
                    value={filterSelectedOption || ''}
                    isOptionEqualToValue={(option, value) =>
                        value === '' || option === value
                    }
                    options={filterOptions}
                    onChange={(_, data) => {
                        handleFilterChange(field, data);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            size="small"
                            style={{ width: FILTER_TEXT_FIELD_WIDTH }}
                        />
                    )}
                />
            </Popover>
        </Grid>
    );
};

CustomHeaderComponent.propTypes = {
    field: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    filterOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    sortConfig: PropTypes.shape({
        colKey: PropTypes.string,
        selector: PropTypes.shape({
            sortKeysWithWeightAndDirection: PropTypes.object,
        }),
        sortWay: PropTypes.number,
    }).isRequired,
    onSortChanged: PropTypes.func.isRequired,
    updateFilter: PropTypes.func.isRequired,
    filterSelectedOption: PropTypes.string,
};

export default CustomHeaderComponent;
