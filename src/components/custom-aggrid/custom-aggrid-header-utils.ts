/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CustomHeaderComponent from './custom-aggrid-header';
import { CustomAggridFilterParams, CustomColDef } from './custom-aggrid-filters/custom-aggrid-filter.type';

export const makeAgGridCustomHeaderColumn = <F extends CustomAggridFilterParams = CustomAggridFilterParams>({
    context,
    ...props // agGrid column props
}: CustomColDef<any, F>) => {
    const {
        sortParams,
        forceDisplayFilterIcon,
        filterComponent,
        filterComponentParams,
        tabIndex,
        isCustomColumn,
        Menu,
        fractionDigits,
        numeric,
    } = context || {};
    const { headerName, field = '' } = props;
    const isSortable = !!sortParams;

    let minWidth = 75;
    if (isSortable) {
        minWidth += 30;
    }
    if (!!filterComponent) {
        minWidth += 30;
    }

    return {
        headerTooltip: headerName,
        minWidth,
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            field,
            displayName: headerName,
            sortParams,
            customMenuParams: {
                tabIndex: tabIndex,
                isCustomColumn: isCustomColumn,
                Menu: Menu,
            },
            forceDisplayFilterIcon: forceDisplayFilterIcon,
            filterComponent: filterComponent,
            filterComponentParams,
        },
        filterParams: context?.agGridFilterParams || undefined,
        ...props,
        context: {
            ...context,
            fractionDigits: numeric && !fractionDigits ? 2 : fractionDigits,
        },
    };
};
