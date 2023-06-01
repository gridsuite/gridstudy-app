/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fetchNetworkElementInfos, fetchNetworkElementsInfos } from './network-elements';

const mockBackendFetchJson = jest.fn();
jest.mock('../../utils/rest-api', () => ({
    ...jest.requireActual('../../utils/rest-api'),
    backendFetchJson: (...params) => mockBackendFetchJson(...params),
}));

console.info = jest.fn();
console.debug = jest.fn();

const studyUuidMock = 'mock-study-uuid';
const currentNodeUuidMock = 'mock-current-node-uuid';
const substationsIdsMock = ['mock-sub-id-1', 'mock-sub-id-1'];
const elementTypeMock = 'mock-element-type';
const infoTypeMock = 'mock-info-type';
const elementIdMock = 'mock-element-id';
describe('fetchNetworkElementsInfos', () => {
    it('should fetch network elements infos with the good url where inUpstreamBuiltParentNodeMock is true', () => {
        mockBackendFetchJson.mockResolvedValue('mocked response');

        const result = fetchNetworkElementsInfos(
            studyUuidMock,
            currentNodeUuidMock,
            substationsIdsMock,
            elementTypeMock,
            infoTypeMock,
            true,
        );

        // eslint-disable-next-line jest/valid-expect
        expect(result).resolves.toBe('mocked response');

        expect(mockBackendFetchJson).toHaveBeenCalledWith(
            expect.stringContaining(
                `study/v1/studies/${studyUuidMock}/nodes/${currentNodeUuidMock}/network/elements?substationId=${substationsIdsMock[0]}&substationId=${substationsIdsMock[1]}&elementType=${elementTypeMock}&infoType=${infoTypeMock}`,
            ),
        );
    });

    it('should fetch network elements infos with the good url where inUpstreamBuiltParentNodeMock is false', () => {
        mockBackendFetchJson.mockResolvedValue('mocked response');

        const result = fetchNetworkElementsInfos(
            studyUuidMock,
            currentNodeUuidMock,
            substationsIdsMock,
            elementTypeMock,
            infoTypeMock,
            false,
        );

        // eslint-disable-next-line jest/valid-expect
        expect(result).resolves.toBe('mocked response');

        expect(mockBackendFetchJson).toHaveBeenCalledWith(
            expect.stringContaining(
                `study/v1/studies/${studyUuidMock}/nodes/${currentNodeUuidMock}/network/elements?substationId=${substationsIdsMock[0]}&substationId=${substationsIdsMock[1]}&inUpstreamBuiltParentNode=false&elementType=${elementTypeMock}&infoType=${infoTypeMock}`,
            ),
        );
    });
});

describe('fetchNetworkElementInfos', () => {
    it('should fetch network element infos with the good url where inUpstreamBuiltParentNodeMock is true', () => {
        mockBackendFetchJson.mockResolvedValue('mocked response');

        const result = fetchNetworkElementInfos(
            studyUuidMock,
            currentNodeUuidMock,
            elementTypeMock,
            elementIdMock,
            infoTypeMock,
            true,
        );

        // eslint-disable-next-line jest/valid-expect
        expect(result).resolves.toBe('mocked response');

        expect(mockBackendFetchJson).toHaveBeenCalledWith(
            expect.stringContaining(
                `study/v1/studies/${studyUuidMock}/nodes/${currentNodeUuidMock}/network/elements/${infoTypeMock}?elementType=${elementTypeMock}&infoType=${elementIdMock}`,
            ),
        );
    });
});
