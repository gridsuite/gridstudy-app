/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { elementExists } from '../../utils/rest-api';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import { useDebounce } from '@gridsuite/commons-ui';

const NameWrapper = ({
    initialValue = '',
    titleMessage,
    contentType,
    children,
    handleNameValidation,
}) => {
    const [value, setValue] = useState(initialValue);
    const [loadingCheckName, setLoadingCheckName] = useState(false);
    const intl = useIntl();
    const [errorMessage, setErrorMessage] = React.useState('');
    const activeDirectory = useSelector((state) => state.activeDirectory);

    const setFormState = useCallback(
        (errorMessage, isNameValid, name) => {
            setErrorMessage(errorMessage);
            handleNameValidation(isNameValid, name);
        },
        [handleNameValidation]
    );

    /**
     * on change input check if name already exist
     * @param name
     */
    const updateFormState = useCallback(
        (name) => {
            if (name === '') {
                setFormState(
                    intl.formatMessage({ id: 'nameEmpty' }),
                    false,
                    name
                );
                setLoadingCheckName(false);
            } else if (name.match(/^\s*$/)) {
                setFormState(
                    intl.formatMessage({ id: 'nameEmpty' }),
                    false,
                    name
                );
                setLoadingCheckName(false);
            } else {
                //If the name is not only white spaces
                elementExists(activeDirectory, name, contentType)
                    .then((data) => {
                        setFormState(
                            data
                                ? intl.formatMessage({
                                      id: 'nameAlreadyUsed',
                                  })
                                : '',
                            !data,
                            name
                        );
                    })
                    .catch((error) => {
                        setFormState(
                            intl.formatMessage({
                                id: 'nameValidityCheckErrorMsg',
                            }) + error.message,
                            false,
                            name
                        );
                    })
                    .finally(() => {
                        setLoadingCheckName(false);
                    });
            }
        },
        [activeDirectory, contentType, intl, setFormState]
    );
    const debouncedUpdateFormState = useDebounce(updateFormState, 700);

    const handleNameChanges = (name) => {
        setValue(name);
        setLoadingCheckName(true);
        debouncedUpdateFormState(name);
    };

    const renderNameStatus = () => {
        const showOk = value !== '' && !loadingCheckName && errorMessage === '';
        return (
            <div
                style={{
                    display: 'inline-block',
                    verticalAlign: 'bottom',
                }}
            >
                {loadingCheckName && <CircularProgress size="1rem" />}
                {showOk && <CheckIcon style={{ color: 'green' }} />}
            </div>
        );
    };

    return (
        <>
            <TextField
                onChange={(e) => handleNameChanges(e.target.value)}
                margin="dense"
                value={value}
                type="text"
                error={!!value && !(errorMessage === '') && !loadingCheckName}
                style={{ width: '100%' }}
                label={<FormattedMessage id={titleMessage} />}
                helperText={errorMessage ?? ''}
            />
            {renderNameStatus()}
            {children}
        </>
    );
};

NameWrapper.propTypes = {
    initialValue: PropTypes.string,
    titleMessage: PropTypes.string,
    contentType: PropTypes.string,
    children: PropTypes.node,
    handleNameValidation: PropTypes.func,
};

export default NameWrapper;
