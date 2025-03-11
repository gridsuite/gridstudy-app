/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LoaderWithOverlay from './loader-with-overlay';
import PageNotFound from '../page-not-found';
import Paper from '@mui/material/Paper';
import { PropsWithChildren } from 'react';

interface WaitingLoaderProps extends PropsWithChildren {
    loading?: boolean;
    message: string;
    errMessage?: string;
}

const WaitingLoader = ({ loading, message, errMessage, children }: WaitingLoaderProps) => {
    if (errMessage !== undefined) {
        /* TODO errMessage -> error {status, message} to get 404, 403 and adapt Page*/
        return <PageNotFound message={errMessage} />;
    } else if (loading === true) {
        return (
            <Paper className={'singlestretch-child'}>
                <LoaderWithOverlay color="inherit" loaderSize={70} loadingMessageText={message} />
            </Paper>
        );
    }
    return <>{children}</>;
};

export default WaitingLoader;
