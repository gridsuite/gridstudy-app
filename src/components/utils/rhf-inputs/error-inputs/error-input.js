/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useController } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import React, { useEffect, useRef } from 'react';

const ErrorInput = ({ name, InputField }) => {
    const {
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name,
    });

    const errorRef = useRef(null);

    const errorProps = (errorMsg) => {
        if (typeof errorMsg === 'string') {
            return {
                id: errorMsg,
            };
        } else if (typeof errorMsg === 'object') {
            return {
                id: errorMsg.id,
                values: {
                    value: errorMsg.value,
                },
            };
        }
        return {};
    };

    useEffect(() => {
        // the scroll should be done only when the form is submitting
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubmitting]);

    return (
        <>
            {error?.message && (
                <div ref={errorRef}>
                    <InputField
                        message={
                            <FormattedMessage {...errorProps(error?.message)} />
                        }
                    />
                </div>
            )}
        </>
    );
};

export default ErrorInput;
