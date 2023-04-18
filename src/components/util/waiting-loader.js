/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LoaderWithOverlay from './loader-with-overlay';
import PageNotFound from '../page-not-found';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';

const WaitingLoader = ({ loading, message, errMessage, children }) => {
    if (errMessage !== undefined) {
        /* TODO errMessage -> error {status, message} to get 404, 403 and adapt Page*/
        return <PageNotFound message={errMessage} />;
    } else if (loading === true) {
        return (
            <Paper className={'singlestretch-child'}>
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    loadingMessageText={message}
                />
            </Paper>
        );
    }
    return <>{children}</>;
};

export default WaitingLoader;

WaitingLoader.propTypes = {
    children: PropTypes.node,
    errMessage: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    message: PropTypes.string,
};
