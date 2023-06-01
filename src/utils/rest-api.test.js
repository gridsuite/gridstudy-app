/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { store } from '../redux/store';

import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    fetchAppsAndUrls,
    fetchDefaultParametersValues,
    getRequestParamFromList,
    getToken,
    getUrlWithToken,
    handleError,
    parseError,
    prepareRequest,
    safeFetch,
    toModificationOperation,
} from './rest-api';

/** Functions mocks **/
jest.mock('../redux/store', () => ({
    store: {
        getState: jest.fn(),
    },
}));

/** Values mocks **/
const mockToken = 'mock-token';
const mockUrl = 'https://example.com/';
const mockUrlWithQuery = 'https://example.com/?param=paramValue';
const mockInit = { method: 'mock-method' };
const mockInitCopy = {
    headers: new Headers({ Authorization: 'Bearer mock-token' }),
    method: 'mock-method',
};
const mockAppsMetadata = [
    {
        name: 'Explore',
        url: 'http://localhost:80',
        appColor: '#33AFED',
        hiddenInAppsMenu: false,
    },
    {
        name: 'Study',
        url: 'http://localhost:84',
        appColor: '#0CA789',
        hiddenInAppsMenu: true,
        resources: [
            {
                types: ['STUDY'],
                path: '/studies/{elementUuid}',
            },
        ],
        predefinedEquipmentProperties: {
            substation: 'mock-substation',
        },
        defaultParametersValues: {
            fluxConvention: 'target',
            enableDeveloperMode: 'true',
            mapManualRefresh: 'false',
        },
    },
    {
        name: 'Merge',
        url: 'http://localhost:81',
        appColor: '#2D9BF0',
        hiddenInAppsMenu: false,
    },
    {
        name: 'Dynamic Mapping',
        url: 'http://localhost:83',
        appColor: '#FFC11B',
        hiddenInAppsMenu: false,
    },
];
const mockStatus = {
    error: 400,
    serverError: 500,
    notSafe: 204,
    safe: 200,
};

describe('rest-api', function () {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        delete global.fetch;
    });

    describe('fetchAppsAndUrls', () => {
        it('should fetch correctly apps metadata JSON', async () => {
            const mockRes = {
                appsMetadataServerUrl: 'http://example.com',
            };

            global.fetch.mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockRes),
            });
            global.fetch.mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockAppsMetadata),
            });

            const result = await fetchAppsAndUrls();

            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenNthCalledWith(1, 'env.json');
            expect(global.fetch).toHaveBeenNthCalledWith(
                2,
                `${mockRes.appsMetadataServerUrl}/apps-metadata.json`,
            );
            expect(result).toEqual(mockAppsMetadata);
        });
    });

    describe('fetchDefaultParametersValues', () => {
        it('should fetch apps and urls, and return default parameters values for Study metadata', async () => {
            global.fetch.mockImplementation(() =>
                Promise.resolve({
                    json: () => Promise.resolve(mockAppsMetadata),
                }),
            );

            const result = await fetchDefaultParametersValues();

            expect(result).toEqual(mockAppsMetadata[1].defaultParametersValues);
        });

        it('should handle missing Study metadata', async () => {
            global.fetch.mockImplementation(() =>
                Promise.resolve({
                    json: () =>
                        Promise.resolve([{ name: 'OtherApp', defaultParametersValues: {} }]),
                }),
            );

            await expect(fetchDefaultParametersValues()).rejects.toEqual(
                'Study entry could not be found in metadatas',
            );
        });
    });

    describe('toModificationOperation', () => {
        const valuesThatReturnObjectWithOpEqualToSET = [0, false, 'truly value', 1];
        const valuesThatReturnNull = [null, undefined, ''];

        it('should return an object with SET value for op key when value is one of 0, false or truly value', () => {
            const expectedReturn = { value: expect.anything(), op: 'SET' };
            valuesThatReturnObjectWithOpEqualToSET.forEach(value => {
                const result = toModificationOperation(value);
                expect(result).toEqual(expectedReturn);
            });
        });

        it('should return null when value is falsy and not 0 or false', () => {
            valuesThatReturnNull.forEach(value => {
                const result = toModificationOperation(value);
                expect(result).toBeNull();
            });
        });
    });

    describe('getToken', () => {
        it('should return the id_token from store', () => {
            store.getState.mockReturnValue({
                user: {
                    id_token: mockToken,
                },
            });

            expect(getToken()).toBe(mockToken);
        });
    });

    describe('parseError', () => {
        it('should returns parsed JSON object when valid JSON text is provided', () => {
            const text = '{"key": "value"}';
            const expected = { key: 'value' };
            const result = parseError(text);
            expect(result).toEqual(expected);
        });

        it('should returns null when invalid JSON text is provided', () => {
            const text = 'This is not valid JSON';
            const result = parseError(text);
            expect(result).toBeNull();
        });
    });

    describe('handleError', () => {
        it('should throw an Error with message parsed from response text json', async () => {
            const mockBadRequestResponse = {
                status: mockStatus.error,
                statusText: 'Bad Request',
                text: jest
                    .fn()
                    .mockResolvedValue(
                        '{"status": "mock-status", "error": "mock-error", "message": "mock-message"}',
                    ),
            };
            const expectedErrorMessage =
                'HttpResponseError : mock-status mock-error, message : mock-message';

            await expect(handleError(mockBadRequestResponse)).rejects.toThrow(expectedErrorMessage);
        });

        it('should throw an Error with message from provided reponse information', async () => {
            const response = {
                status: mockStatus.error,
                statusText: 'mock-statusText',
                text: jest.fn().mockResolvedValue('mock-resolved-text-value'),
            };
            const expectedErrorMessage = `HttpResponseError : ${mockStatus.error} mock-statusText, message : mock-resolved-text-value`;

            await expect(handleError(response)).rejects.toThrow(expectedErrorMessage);
        });
    });

    describe('prepareRequest', () => {
        it('should throw TypeError if init is neither an object nor undefined', () => {
            expect(() => {
                prepareRequest('not an object and not undefined');
            }).toThrow(TypeError);
        });

        it('should set Authorization header with the provided token', () => {
            const result = prepareRequest(mockInit, mockToken);

            expect(result.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
        });

        it('should add authorization header with token from getToken when token is not provided', () => {
            store.getState.mockReturnValue({
                user: {
                    id_token: 'mocked-token-returned-by-getToken',
                },
            });

            const init = {};

            const result = prepareRequest(init);

            expect(result.headers.get('Authorization')).toBe(
                'Bearer mocked-token-returned-by-getToken',
            );
        });
    });

    describe('safeFetch', () => {
        it('should return the response when response.ok is true (get successfully the response)', async () => {
            const mockResponse = { ok: true };
            fetch.mockResolvedValue(mockResponse);

            const result = await safeFetch(mockUrl, mockInitCopy);
            expect(result).toBe(mockResponse);
            expect(fetch).toHaveBeenCalledWith(mockUrl, mockInitCopy);
        });

        it('should handle error using handleError function when response is not successful', async () => {
            const mockInitCopy = { method: 'mock-method' };
            const mockResponse = {
                ok: false,
                status: mockStatus.serverError,
                statusText: 'mock-status-text',
                text: jest.fn().mockResolvedValue('mock-resolved-text-value'),
            };
            fetch.mockResolvedValue(mockResponse);

            const expectedErrorMessage = `HttpResponseError : ${mockStatus.serverError} mock-status-text, message : mock-resolved-text-value`;

            await expect(safeFetch(mockUrl, mockInitCopy)).rejects.toThrow(expectedErrorMessage);
            expect(fetch).toHaveBeenCalledWith(mockUrl, mockInitCopy);
        });
    });

    describe('backendFetch', () => {
        it('should fetch from the provided URL for safeFetch with the correct headers prepared by prepareRequest and return the good corresponding result', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: 'mocked json response',
            });

            const response = await backendFetch(mockUrl, mockInit, mockToken);

            expect(global.fetch).toHaveBeenCalledWith(mockUrl, mockInitCopy);
            expect(response.ok).toBe(true);
            expect(response.json).toEqual('mocked json response');
        });

        it('should throw an error if the request fails', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                text: () => Promise.resolve('Error message'),
            });

            await expect(backendFetch(mockUrl, mockInit, mockToken)).rejects.toThrow(
                'HttpResponseError',
            );
        });
    });

    describe('backendFetchText', () => {
        it('should make a request correctly and return the good response', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('mocked response'),
            });

            const response = await backendFetchText(mockUrl, mockInit, mockToken);

            expect(global.fetch).toHaveBeenCalledWith(mockUrl, mockInitCopy);
            expect(response).toBe('mocked response');
        });
    });

    describe('backendFetchJson', () => {
        it('should make the request correctly and return a safe successfully response corresponding to a status different to 204', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: mockStatus.safe,
                json: jest.fn().mockResolvedValue({ data: 'mocked response' }),
            });

            const response = await backendFetchJson(mockUrl, mockInit, mockToken);

            expect(global.fetch).toHaveBeenCalledWith(mockUrl, mockInitCopy);
            expect(response).toEqual({ data: 'mocked response' });
        });

        it('should return null if the response status is 204', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: mockStatus.notSafe,
                json: jest.fn().mockResolvedValue(null),
            });

            const response = await backendFetchJson(mockUrl, mockInit, mockToken);

            expect(response).toBeNull();
        });
    });

    describe('getRequestParamFromList', () => {
        it('should return URLSearchParams object with correct paramName-param', () => {
            const givenParams = ['mock-value1', 'mock-value2', 'mock-value3'];

            expect(getRequestParamFromList(givenParams, 'mock-param')).toEqual(
                new URLSearchParams([
                    ['mock-param', 'mock-value1'],
                    ['mock-param', 'mock-value2'],
                    ['mock-param', 'mock-value3'],
                ]),
            );
        });

        it('should return undefined if the params array is empty', () => {
            expect(getRequestParamFromList([], 'mock-param')).toBeUndefined();
        });
    });

    describe('getUrlWithToken', () => {
        it('should append the access_token parameter to the URL using "&" if url have params already', () => {
            store.getState.mockReturnValue({
                user: {
                    id_token: mockToken,
                },
            });

            expect(getUrlWithToken(mockUrlWithQuery)).toEqual(
                `${mockUrlWithQuery}&access_token=${mockToken}`,
            );
        });

        it('should append the access_token parameter to the URL using "?" do not have params', () => {
            store.getState.mockReturnValue({
                user: {
                    id_token: mockToken,
                },
            });

            expect(getUrlWithToken(mockUrl)).toEqual(`${mockUrl}?access_token=${mockToken}`);
        });
    });
});
