/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { CASE_FILE } from '../../utils/field-constants';
import { UniqueNameInput } from './unique-name-input';
import { ElementType } from '../../../utils/elementType';

interface PrefilledNameInputProps {
    label: string;
    name: string;
    elementType: ElementType;
}

/**
 * Input component that automatically fill the field when a case is uploaded
 * Used for CreateCaseDialog and CreateStudyDialog
 */
const PrefilledNameInput: FunctionComponent<PrefilledNameInputProps> = ({
    label,
    name,
    elementType,
}) => {
    const {
        setValue,
        clearErrors,
        watch,
        formState: { errors },
    } = useFormContext();

    const [modifiedByUser, setModifiedByUser] = useState(false);

    const caseFile = watch(CASE_FILE) as File;
    const caseFileErrorMessage = errors.caseFile?.message;
    const apiCallErrorMessage = errors.root?.apiCall?.message;

    useEffect(() => {
        // we replace the name only if some conditions are respected
        if (
            caseFile &&
            !modifiedByUser &&
            !apiCallErrorMessage &&
            !caseFileErrorMessage
        ) {
            const { name: caseName } = caseFile;

            if (caseName) {
                clearErrors(name);
                setValue(name, caseName?.substring(0, caseName.indexOf('.')), {
                    shouldDirty: true,
                });
            }
        }
    }, [
        caseFile,
        modifiedByUser,
        apiCallErrorMessage,
        caseFileErrorMessage,
        setValue,
        clearErrors,
        name,
    ]);

    return (
        <UniqueNameInput
            name={name}
            label={label}
            elementType={elementType}
            autoFocus={!caseFile}
            onManualChangeCallback={() => setModifiedByUser(true)}
        />
    );
};

export default PrefilledNameInput;
