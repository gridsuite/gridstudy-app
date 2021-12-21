/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LoaderWithOverlay from '../loader-with-overlay';
import PageNotFound from '../page-not-found';

const WaitingLoader = ({ loading, message, errMessage, children }) => {
    if (errMessage !== undefined) {
        /* TODO errMessage -> error {status, message} to get 404, 403 and adapt Page*/
        return <PageNotFound message={errMessage} />;
    } else if (loading === true)
        return (
            <LoaderWithOverlay
                color="inherit"
                loaderSize={70}
                loadingMessageText={message}
            />
        );
    return <>{children}</>;
};

export default WaitingLoader;
