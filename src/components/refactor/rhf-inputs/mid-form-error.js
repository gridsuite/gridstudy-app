/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import React from 'react';
import { useController } from 'react-hook-form';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    midFormErrorMessage: {
        color: theme.palette.error.main,
        fontSize: 'small',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    },
}));

const MidFormError = ({ name }) => {
    const classes = useStyles();

    const {
        fieldState: { error },
    } = useController({
        name,
    });

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

    return (
        <div key={error?.message} className={classes.midFormErrorMessage}>
            <FormattedMessage {...errorProps(error?.message)} />
        </div>
    );
};

export default MidFormError;
