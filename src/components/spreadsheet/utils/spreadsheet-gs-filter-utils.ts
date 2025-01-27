/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ExpertFilter } from '../../../services/study/filter';
import yup from '../../utils/yup-config';
import { FILTERS, ID, NAME, SPREADSHEET_GS_FILTER } from '../../utils/field-constants';

export type ExpertFilterForm = Omit<ExpertFilter, 'type' | 'equipmentType' | 'topologyKind' | 'rules'>;

export const spreadsheetGsFilterFormSchema = yup.object().shape({
    [SPREADSHEET_GS_FILTER]: yup.array().of(
        yup
            .object()
            .shape({
                [FILTERS]: yup
                    .array()
                    .of(
                        yup.object().shape({
                            [ID]: yup.string().required(),
                            [NAME]: yup.string().required(),
                        })
                    )
                    .min(1, 'FilterInputMinError'),
            })
            .required()
    ),
});

export type SpreadsheetGsFilterForm = yup.InferType<typeof spreadsheetGsFilterFormSchema>;

export const initialSpreadsheetGsFilterForm: Record<string, ExpertFilterForm[]> = {
    [SPREADSHEET_GS_FILTER]: [],
};

function isExpertFilter(obj: unknown): obj is ExpertFilter {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    const expertFilter = obj as ExpertFilter;
    if (expertFilter.id === undefined) {
        return false;
    }
    return true;
}

export function convertToExpertFilter(input: unknown): ExpertFilter[] {
    if (Array.isArray(input) && input.every(isExpertFilter)) {
        return input;
    }
    return [];
}

export function convertToExpertFilterForm(input: ExpertFilter[]): Record<string, ExpertFilterForm[]> {
    const filters = input?.map((filter) => {
        return { id: filter.id, name: filter.name };
    });

    return { [SPREADSHEET_GS_FILTER]: filters };
}
