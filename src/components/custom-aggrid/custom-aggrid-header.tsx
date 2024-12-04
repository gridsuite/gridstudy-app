/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import { Grid } from '@mui/material';
import { SortPropsType } from '../../hooks/use-aggrid-sort';
import { CustomHeaderFilterParams } from './custom-aggrid-header.type';
import { CustomColumnConfigProps } from '../spreadsheet/custom-columns/custom-column-menu';
import { CustomAggridFilter } from './custom-aggrid-filters/custom-aggrid-filter';
import { CustomAggridSort } from './custom-aggrid-sort/custom-aggrid-sort';
import { useCustomAggridSort } from './custom-aggrid-sort/use-custom-aggrid-sort';
import { CustomMenu } from './custom-menu';

const styles = {
    displayName: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

interface CustomHeaderComponentProps {
    field: string;
    displayName: string;
    isSortable: boolean;
    sortParams: SortPropsType;
    isFilterable: boolean;
    filterParams: CustomHeaderFilterParams;
    getEnumLabel: (value: string) => string | undefined;
    isCountry: boolean;
    forceDisplayFilterIcon: boolean;
    tabIndex: number;
    isCustomColumn: boolean;
    Menu: React.FC<CustomColumnConfigProps>;
}

const CustomHeaderComponent = ({
    field,
    displayName,
    isSortable = false,
    sortParams,
    isFilterable = false,
    filterParams,
    getEnumLabel, // Used for translation of enum values in the filter
    isCountry, // Used for translation of the countries options in the filter
    forceDisplayFilterIcon = false,
    tabIndex,
    isCustomColumn = false,
    Menu,
}: CustomHeaderComponentProps) => {
    const [isHoveringColumnHeader, setIsHoveringColumnHeader] = useState(false);

    const { handleSortChange } = useCustomAggridSort(field, sortParams);
    const handleClickHeader = () => {
        if (isSortable) {
            handleSortChange();
        }
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
                            {isSortable && (
                                <Grid item>
                                    <CustomAggridSort field={field} sortParams={sortParams} />
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container item flex="1">
                    <CustomAggridFilter
                        field={field}
                        handleCloseFilter={handleCloseFilter}
                        getEnumLabel={getEnumLabel}
                        filterParams={filterParams}
                        isCountry={isCountry}
                        isFilterable={isFilterable}
                        isHoveringColumnHeader={isHoveringColumnHeader}
                        forceDisplayFilterIcon={forceDisplayFilterIcon}
                    />
                    {isCustomColumn && <CustomMenu field={field} tabIndex={tabIndex} Menu={Menu} />}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default CustomHeaderComponent;
