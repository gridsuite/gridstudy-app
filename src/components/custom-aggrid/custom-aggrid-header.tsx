/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ComponentType, useCallback, useState } from 'react';
import { Grid } from '@mui/material';
import { CustomAggridFilterParams, CustomHeaderMenuParams } from './custom-aggrid-header.type';
import { CustomAggridFilter } from './custom-aggrid-filters/custom-aggrid-filter';
import { CustomAggridSort } from './custom-aggrid-sort';
import { SortParams, useCustomAggridSort } from './hooks/use-custom-aggrid-sort';
import { CustomMenu } from './custom-menu';
import { CustomHeaderProps } from 'ag-grid-react';

const styles = {
    displayName: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

interface CustomHeaderComponentProps<F extends CustomAggridFilterParams> extends CustomHeaderProps {
    field: string;
    displayName: string;
    sortParams?: SortParams;
    customMenuParams: CustomHeaderMenuParams;
    forceDisplayFilterIcon: boolean;
    filterComponent: ComponentType<F>;
    filterComponentParams: F;
}

const CustomHeaderComponent = <F extends CustomAggridFilterParams>({
    field,
    displayName,
    sortParams,
    customMenuParams,
    forceDisplayFilterIcon,
    filterComponent,
    filterComponentParams,
    api,
}: CustomHeaderComponentProps<F>) => {
    const [isHoveringColumnHeader, setIsHoveringColumnHeader] = useState(false);

    const { handleSortChange } = useCustomAggridSort(field, sortParams);
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
                                    <CustomAggridSort field={field} sortParams={sortParams} />
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container item flex="1">
                    {filterComponent && (
                        <CustomAggridFilter
                            filterComponent={filterComponent}
                            filterComponentParams={{ ...filterComponentParams, field, api }}
                            isHoveringColumnHeader={isHoveringColumnHeader}
                            forceDisplayFilterIcon={forceDisplayFilterIcon}
                            handleCloseFilter={handleCloseFilter}
                        />
                    )}
                    {customMenuParams && <CustomMenu field={field} customMenuParams={customMenuParams} />}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default CustomHeaderComponent;
