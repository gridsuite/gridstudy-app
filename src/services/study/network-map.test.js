/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    fetchEquipmentInfos,
    fetchEquipments,
    fetchEquipmentsIds,
    fetchVoltageLevelEquipments,
} from './network-map';

const mockBackendFetchJson = jest.fn();
jest.mock('../../utils/rest-api', () => ({
    ...jest.requireActual('../../utils/rest-api'),
    backendFetchJson: (...params) => mockBackendFetchJson(...params),
}));

const studyUuidMock = 'mock-study-uuid';
const currentNodeUuidMock = 'mock-current-node-uuid';
const substationsIdsMock = ['mock-sub-id-1', 'mock-sub-id-1'];
const elementTypeMock = 'mock-element-type';
const equipmentTypeMock = 'mock-equipment-type';
const equipmentPathMock = 'mock-equipment-path';
const voltageLevelIdMock = 'mock-voltage-level-id';
const equipmentIdMock = 'mock-equipment-id';

describe('fetchEquipmentsIds', () => {
    it('should fetch equipments ids with the good url', () => {
        mockBackendFetchJson.mockResolvedValue('mocked response');

        const result = fetchEquipmentsIds(
            studyUuidMock,
            currentNodeUuidMock,
            substationsIdsMock,
            elementTypeMock,
            true
        );

        // eslint-disable-next-line jest/valid-expect
        expect(result).resolves.toBe('mocked response');

        expect(mockBackendFetchJson).toHaveBeenCalledWith(
            expect.stringContaining(
                `study/v1/studies/${studyUuidMock}/nodes/${currentNodeUuidMock}/network-map/equipments-ids?substationId=${substationsIdsMock[0]}&substationId=${substationsIdsMock[1]}&equipmentType=${elementTypeMock}`
            )
        );
    });

    it('should fetch equipments with the good url', () => {
        mockBackendFetchJson.mockResolvedValue('mocked response');

        const result = fetchEquipments(
            studyUuidMock,
            currentNodeUuidMock,
            substationsIdsMock,
            equipmentTypeMock,
            equipmentPathMock,
            true
        );

        // eslint-disable-next-line jest/valid-expect
        expect(result).resolves.toBe('mocked response');

        expect(mockBackendFetchJson).toHaveBeenCalledWith(
            expect.stringContaining(
                `study/v1/studies/${studyUuidMock}/nodes/${currentNodeUuidMock}/network-map/${equipmentPathMock}?substationId=${substationsIdsMock[0]}&substationId=${substationsIdsMock[1]}`
            )
        );
    });

    it('should fetch Voltage Level Equipments with the good url', () => {
        mockBackendFetchJson.mockResolvedValue('mocked response');

        const result = fetchVoltageLevelEquipments(
            studyUuidMock,
            currentNodeUuidMock,
            substationsIdsMock,
            voltageLevelIdMock,
            true
        );

        // eslint-disable-next-line jest/valid-expect
        expect(result).resolves.toBe('mocked response');

        expect(mockBackendFetchJson).toHaveBeenCalledWith(
            expect.stringContaining(
                `study/v1/studies/${studyUuidMock}/nodes/${currentNodeUuidMock}/network-map/voltage-level-equipments/${voltageLevelIdMock}?substationId=${substationsIdsMock[0]}&substationId=${substationsIdsMock[1]}`
            )
        );
    });

    it('should fetch Equipment Infos with the good url', () => {
        mockBackendFetchJson.mockResolvedValue('mocked response');

        const result = fetchEquipmentInfos(
            studyUuidMock,
            currentNodeUuidMock,
            equipmentPathMock,
            equipmentIdMock,
            true
        );

        // eslint-disable-next-line jest/valid-expect
        expect(result).resolves.toBe('mocked response');

        expect(mockBackendFetchJson).toHaveBeenCalledWith(
            expect.stringContaining(
                `study/v1/studies/${studyUuidMock}/nodes/${currentNodeUuidMock}/network-map/${equipmentPathMock}/${equipmentIdMock}?`
            )
        );
    });
});
