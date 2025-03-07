/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ComponentType, useCallback, useState } from 'react';
import { Grid } from '@mui/material';
import { CustomAggridFilter } from './custom-aggrid-filters/custom-aggrid-filter';
import { CustomAggridSort } from './custom-aggrid-sort';
import { SortParams, useCustomAggridSort } from './hooks/use-custom-aggrid-sort';
import { CustomMenu, CustomMenuProps } from './custom-aggrid-menu';
import { CustomHeaderProps } from 'ag-grid-react';
import { CustomAggridFilterParams } from './custom-aggrid-filters/custom-aggrid-filter.type';

const styles = {
    displayName: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

interface CustomHeaderComponentProps<F extends CustomAggridFilterParams, T> extends CustomHeaderProps {
    displayName: string;
    sortParams?: SortParams;
    menu?: CustomMenuProps<T>;
    forceDisplayFilterIcon: boolean;
    filterComponent: ComponentType<F>;
    filterComponentParams: F;
}

const CustomHeaderComponent = <F extends CustomAggridFilterParams, T>({
    column,
    displayName,
    sortParams,
    menu,
    forceDisplayFilterIcon,
    filterComponent,
    filterComponentParams,
    api,
}: CustomHeaderComponentProps<F, T>) => {
    const [isHoveringColumnHeader, setIsHoveringColumnHeader] = useState(false);

    const { handleSortChange } = useCustomAggridSort(column.getId(), sortParams);
    const isSortable = !!sortParams;
    const handleClickHeader = () => {
        handleSortChange && handleSortChange();
    };

    const handleCloseFilter = () => {
        setIsHoveringColumnHeader(false);
    };

    const handleMouseEnter = useCallback(() => {
        setIsHoveringColumnHeader(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHoveringColumnHeader(false);
    }, []);

    return (
        <Grid container onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Grid container alignItems={'center'} wrap={'nowrap'}>
                {/* We tweak flexBasis to stick the column filter and custom menu either next the column name or on the far right of the header */}
                <Grid
                    container
                    sx={{
                        cursor: isSortable ? 'pointer' : 'default',
                    }}
                    flexBasis={forceDisplayFilterIcon ? '0%' : '100%'}
                >
                    <Grid
                        container
                        sx={{
                            overflow: 'hidden',
                        }}
                        onClick={handleClickHeader}
                    >
                        <Grid container sx={styles.displayName} alignItems={'center'} wrap="nowrap">
                            <Grid item>{displayName}</Grid>
                            {sortParams && (
                                <Grid item>
                                    <CustomAggridSort colId={column.getId()} sortParams={sortParams} />
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container flex="1" wrap="nowrap">
                    {filterComponent && (
                        <CustomAggridFilter
                            filterComponent={filterComponent}
                            filterComponentParams={{ ...filterComponentParams, colId: column.getId(), api }}
                            isHoveringColumnHeader={isHoveringColumnHeader}
                            forceDisplayFilterIcon={forceDisplayFilterIcon}
                            handleCloseFilter={handleCloseFilter}
                        />
                    )}
                    {menu && <CustomMenu {...menu} />}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default CustomHeaderComponent;
