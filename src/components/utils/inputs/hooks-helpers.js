/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import React from 'react';

export function genHelperPreviousValue(previousValue, adornment) {
    return {
        ...((previousValue || previousValue === 0) && {
            error: false,
            helperText:
                previousValue + (adornment ? ' ' + adornment?.text : ''),
        }),
    };
}

export function genHelperError(...errors) {
    const inError = errors.find((e) => e);
    if (inError) {
        return {
            error: true,
            helperText: <FormattedMessage id={inError} />,
        };
    }
    return {};
}

export const FieldLabel = ({ label, optional, values = undefined }) => {
    return (
        <>
            <FormattedMessage id={label} values={values} />
            {optional && <FormattedMessage id="Optional" />}
        </>
    );
};
