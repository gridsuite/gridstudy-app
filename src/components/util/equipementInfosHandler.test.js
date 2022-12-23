import * as reactRedux from 'react-redux';
import { useNameOrId } from './equipmentInfosHandler';
import { act, renderHook } from '@testing-library/react';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));

describe('useNameOrId', () => {
    const useSelectorMock = reactRedux.useSelector;
    afterEach(() => {
        useSelectorMock.mockClear();
    });

    test('The `getNameOrId` could get the name if param use name is activated', () => {
        useSelectorMock.mockReturnValue(true);
        const { result } = renderHook(() => useNameOrId());
        const expected = 'name';
        let resultValue;
        act(() => {
            resultValue = result.current.getNameOrId('name', 'id');
        });
        expect(resultValue).toBe(expected);
    });

    test('The `getNameOrId` could get the id if param use name is disabled', () => {
        useSelectorMock.mockReturnValue(false);
        const { result } = renderHook(() => useNameOrId());
        const expected = 'id';
        let resultValue;
        act(() => {
            resultValue = result.current.getNameOrId('name', 'id');
        });
        expect(resultValue).toBe(expected);
    });

    test('The `getNameOrId` could get the id if param use name is activated and name is empty', () => {
        useSelectorMock.mockReturnValue(true);
        const { result } = renderHook(() => useNameOrId());
        const expected = 'id';
        let resultValue;
        act(() => {
            resultValue = result.current.getNameOrId('', 'id');
        });
        expect(resultValue).toBe(expected);
    });

    test('The `getNameOrId` could get the id if param use name is activated and name is empty with space', () => {
        useSelectorMock.mockReturnValue(true);
        const { result } = renderHook(() => useNameOrId());
        const expected = 'id';
        let resultValue;
        act(() => {
            resultValue = result.current.getNameOrId('  ', 'id');
        });
        expect(resultValue).toBe(expected);
    });

    test('The `getNameOrId` could get the id if param use name is activated and name is undefined ', () => {
        useSelectorMock.mockReturnValue(true);
        const { result } = renderHook(() => useNameOrId());
        const expected = 'id';
        let resultValue;
        act(() => {
            resultValue = result.current.getNameOrId(undefined, 'id');
        });
        expect(resultValue).toBe(expected);
    });
});
