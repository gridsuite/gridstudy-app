/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Parameter } from '@gridsuite/commons-ui';

export function formatCaseImportParameters(params: Parameter[]): Parameter[] {
    // sort possible values alphabetically to display select options sorted
    return params?.map((parameter) => ({
        ...parameter,
        possibleValues: parameter.possibleValues?.sort((a: any, b: any) => a.localeCompare(b)),
    }));
}

export function customizeCurrentParameters(params: Parameter[]): Record<string, string> {
    return params.reduce(
        (obj, parameter) => {
            // we check if the parameter is for extensions. If so, we select all possible values by default.
            // the only way for the moment to check if the parameter is for extension, is by checking his name.
            // TODO: implement a cleaner way to determine the extensions field
            if (
                parameter.type === 'STRING_LIST' &&
                (parameter.name?.endsWith('included.extensions') || parameter.name?.endsWith('included-extensions'))
            ) {
                return { ...obj, [parameter.name]: parameter.possibleValues.toString() };
            }
            return obj;
        },
        {} as Record<string, string>
    );
}
