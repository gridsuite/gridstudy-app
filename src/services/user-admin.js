/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch } from '../utils/rest-api';

const PREFIX_USER_ADMIN_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/user-admin`;

export function fetchValidateUser(user) {
    const sub = user?.profile?.sub;
    if (!sub) {
        return Promise.reject(
            new Error(
                `Error : Fetching access for missing user.profile.sub : ${user}`
            )
        );
    }

    console.info(`Fetching access for user...`);
    const CheckAccessUrl = `${PREFIX_USER_ADMIN_SERVER_QUERIES}/v1/users/${sub}`;
    console.debug(CheckAccessUrl);

    return backendFetch(
        CheckAccessUrl,
        {
            method: 'head',
        },
        user?.id_token
    )
        .then((response) => {
            //if the response is ok, the responseCode will be either 200 or 204 otherwise it's a Http error and it will be caught
            return response?.status === 200;
        })
        .catch((error) => {
            if (error.status === 403) {
                return false;
            } else {
                throw error;
            }
        });
}
