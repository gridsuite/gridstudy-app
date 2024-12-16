/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FILTER_NUMBER_COMPARATORS, FILTER_TEXT_COMPARATORS } from 'components/custom-aggrid/custom-aggrid-header.type';
import { getEnumLabelById } from 'components/utils/utils';
import { EnumOption } from 'components/utils/utils-type';
import CountryCellRenderer from '../utils/country-cell-render';
import { BooleanCellRenderer, DefaultCellRenderer } from '../utils/cell-renderers';
import EnumCellRenderer from '../utils/enum-cell-renderer';
import { Writable } from 'type-fest';

const contains = (target: string, lookingFor: string): boolean => {
    if (target && lookingFor) {
        return target?.toLowerCase().indexOf(lookingFor.toLowerCase()) >= 0;
    }
    return false;
};

export const getEnumConfig = (enumOptions: Readonly<EnumOption[]>) => {
    return {
        filter: 'agTextColumnFilter',
        filterParams: {
            caseSensitive: false,
            maxNumConditions: 1,
            filterOptions: [FILTER_TEXT_COMPARATORS.CONTAINS],
            textMatcher: ({ value, filterText, context }: any): boolean => {
                if (value) {
                    const label = enumOptions
                        ? getEnumLabelById(enumOptions as EnumOption[], value.toUpperCase())
                        : value;
                    const displayedValue = label ? context.intl.formatMessage({ id: label }) : value;
                    return contains(displayedValue, filterText || '');
                }
                return false;
            },
            debounceMs: 200,
        },
        cellRenderer: EnumCellRenderer,
        cellRendererParams: {
            enumOptions: enumOptions as Writable<typeof enumOptions>,
            // @ts-expect-error TODO TS1360: Property value is missing in type
        } satisfies EnumCellRendererProps,
        getEnumLabel: (value: string) => getEnumLabelById(enumOptions as Writable<typeof enumOptions>, value),
    };
};

const textType = {
    filter: 'agTextColumnFilter',
    filterParams: {
        caseSensitive: false,
        maxNumConditions: 1,
        filterOptions: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
    },
    cellRendererSelector: (props: any) => {
        return {
            component: DefaultCellRenderer,
            props: props,
        };
    },
    sortable: true,
    resizable: true,
};

const numericType = {
    filter: 'agNumberColumnFilter',
    filterParams: {
        maxNumConditions: 1,
        filterOptions: Object.values(FILTER_NUMBER_COMPARATORS),
        debounceMs: 200,
    },
    cellRendererSelector: (props: any) => {
        return {
            component: DefaultCellRenderer,
            props: {
                isValueInvalid: props.colDef.cellRendererParams.colisValueInvalid,
                applyFluxConvention: props.context.applyFluxConvention,
            },
        };
    },
    sortable: true,
    resizable: true,
};

const booleanType = {
    cellRendererSelector: ({ value }: { value: string }) => {
        return {
            component: BooleanCellRenderer,
            props: {
                value,
            },
        };
    },
    filter: 'agTextColumnFilter',
    filterParams: {
        caseSensitive: false,
        maxNumConditions: 1,
        filterOptions: [FILTER_TEXT_COMPARATORS.EQUALS],
        textMatcher: ({ value, filterText, context }: any): boolean => {
            if (value) {
                const displayedValue = context.intl.formatMessage({ id: value }) ?? value;
                return contains(displayedValue, filterText || '');
            }
            return false;
        },
        debounceMs: 200,
    },
    sortable: true,
    resizable: true,
};

const countryType = {
    cellRendererSelector: ({ value }: { value: string }) => {
        return {
            component: CountryCellRenderer,
            params: {
                value,
            },
        };
    },
    filter: 'agTextColumnFilter',
    filterParams: {
        caseSensitive: false,
        maxNumConditions: 1,
        filterOptions: [FILTER_TEXT_COMPARATORS.CONTAINS],
        textMatcher: ({ value, filterText, context }: { value: string; filterText: string; context: any }) => {
            if (value) {
                const countryCode = value?.toUpperCase();
                const countryName = context?.translateCountryCode(countryCode);
                return contains(countryName, filterText || '') || contains(value, filterText);
            }
            return false;
        },
        debounceMs: 200,
    },
    sortable: true,
    resizable: true,
};

export const defaultColumnType = {
    textType,
    numericType,
    booleanType,
    countryType,
};
