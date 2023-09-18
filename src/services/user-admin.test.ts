/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fetchValidateUser } from './user-admin';

const mockBackendFetch = jest.fn();
jest.mock('./utils', () => ({
    ...jest.requireActual('./utils'),
    backendFetch: (...params: any[]) => mockBackendFetch(...params),
}));

const mockIdToken = 'mock-id-token';
const mockUser = {
    profile: {
        sub: '',
    },
    id_token: mockIdToken,
};

const mockValidUser = {
    profile: {
        sub: 'mock-sub',
    },
    id_token: mockIdToken,
};

describe('fetchValidateUser', () => {
    beforeEach(() => {
        mockBackendFetch.mockClear();
    });

    it('should reject with an error and not call backendFetch if user.profile.sub is missing', async () => {
        await expect(fetchValidateUser(mockUser)).rejects.toThrow(
            'Error : Fetching access for missing user.profile.sub'
        );
        expect(mockBackendFetch).not.toHaveBeenCalled();
    });

    it('should return true if the response status is 200', async () => {
        mockUser.profile.sub = 'mock-sub';

        mockBackendFetch.mockResolvedValueOnce({
            status: 200,
        });

        const result = await fetchValidateUser(mockUser);

        expect(result).toBe(true);
        expect(mockBackendFetch).toHaveBeenCalledWith(
            expect.stringContaining('/v1/users/mock-sub'),
            {
                method: 'head',
            },
            mockIdToken
        );
    });

    it('should return false if the response status is 403', async () => {
        mockBackendFetch.mockRejectedValueOnce({
            status: 403,
        });

        const result = await fetchValidateUser(mockValidUser);

        expect(result).toBe(false);
        expect(mockBackendFetch).toHaveBeenCalledWith(
            expect.stringContaining('/v1/users/mock-sub'),
            {
                method: 'head',
            },
            mockIdToken
        );
    });
});
