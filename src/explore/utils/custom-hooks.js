/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useCallback, useReducer, useState } from 'react';

export const FetchStatus = {
    IDLE: 'IDLE',
    FETCHING: 'FETCHING',
    FETCH_SUCCESS: 'FETCH_SUCCESS',
    FETCH_ERROR: 'FETCH_ERROR',
};

export const ActionType = {
    START: 'START',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    ADD_ERROR: 'ADD_ERROR', // Use by multipleDeferredFetch when one request respond with error
    ADD_SUCCESS: 'ADD_SUCCESS', // Use by multipleDeferredFetch when one request respond with success
};

/**
 * This custom hook manage a fetch workflow and return a unique callback to defer process execution when needed.
 * It also returns a unique state which contains fetch status, results and error message if it failed.
 * @param {function} fetchFunction the fetch function to call
 * @param {Object} params Params of the fetch function. WARNING: Must respect order here
 * @param {function} onSuccess callback to call on request success
 * @param {function} errorToString callback to translate HTTPCode to string error messages
 * @param {function} onError callback to call if request failed
 * @param {boolean} hasResult Configure if fetchFunction return results or only HTTP request response
 * @returns {function} fetchCallback The callback to call to execute the request.
 *                     It accepts params as argument which must follow fetch function params.
 * @returns {state} state complete state of the request
 *          {Enum}  state.status Status of the request
 *          {String} state.errorMessage error message of the request
 *          {Object} state.data The JSON results of the request (see hasResult)
 */
export const useDeferredFetch = (
    fetchFunction,
    onSuccess,
    errorToString = undefined,
    onError = undefined,
    hasResult = true
) => {
    const initialState = {
        status: FetchStatus.IDLE,
        errorMessage: '',
        data: null,
    };

    const [state, dispatch] = useReducer((lastState, action) => {
        switch (action.type) {
            case ActionType.START:
                return { ...initialState, status: FetchStatus.FETCHING };
            case ActionType.SUCCESS:
                return {
                    ...initialState,
                    status: FetchStatus.FETCH_SUCCESS,
                    data: action.payload,
                };
            case ActionType.ERROR:
                return {
                    ...initialState,
                    status: FetchStatus.FETCH_ERROR,
                    errorMessage: action.payload,
                };
            default:
                return lastState;
        }
    }, initialState);

    const handleError = useCallback(
        (error, paramsOnError) => {
            const defaultErrorMessage = error.message;
            let errorMessage = defaultErrorMessage;
            if (error && errorToString) {
                const providedErrorMessage = errorToString(error.status);
                if (providedErrorMessage && providedErrorMessage !== '') {
                    errorMessage = providedErrorMessage;
                }
            }
            dispatch({
                type: ActionType.ERROR,
                payload: errorMessage,
            });
            if (onError) {
                onError(errorMessage, paramsOnError);
            }
        },
        [errorToString, onError]
    );

    const fetchData = useCallback(
        async (...args) => {
            dispatch({ type: ActionType.START });
            try {
                // Params resolution
                const response = await fetchFunction.apply(null, args);

                if (hasResult) {
                    const data = response;
                    dispatch({
                        type: ActionType.SUCCESS,
                        payload: data,
                    });
                    if (onSuccess) {
                        onSuccess(data, args);
                    }
                } else {
                    dispatch({
                        type: ActionType.SUCCESS,
                    });
                    if (onSuccess) {
                        onSuccess(null, args);
                    }
                }
            } catch (error) {
                if (!error.status) {
                    // an http error
                    handleError(null, args);
                    throw error;
                } else {
                    handleError(error, args);
                }
            }
        },
        [fetchFunction, onSuccess, handleError, hasResult]
    );

    const fetchCallback = useCallback(
        (...args) => {
            fetchData(...args);
        },
        [fetchData]
    );

    return [fetchCallback, state];
};

/////////////////////////////////////////////////////////////////:

/**
 * This custom hook manage multiple fetchs workflows and return a unique callback to defer process execution when needed.
 * It also return a unique state which concatenate all fetch results independently.
 * @param {function} fetchFunction the fetch function to call for each request
 * @param {function} onSuccess callback to call on all request success
 * @param {function} errorToString callback to translate HTTPCode to string error messages
 * @param {function} onError callback to call if one or more requests failed
 * @param {boolean} hasResult Configure if fetchFunction return results or only HTTP request response
 * @returns {function} fetchCallback The callback to call to execute the requests collection.
 *                      It accepts params array as arguments which define the number of fetch to execute.
 * @returns {state} state complete states of the requests collection
 *          {Enum}  state.status Status of the requests set
 *          {Array} state.errorMessage error message of the requests set
 *          {Array} state.paramsOnError The parameters used when requests set have failed
 *          {Array} state.data The results array of each request (see hasResult)
 */
export const useMultipleDeferredFetch = (
    fetchFunction,
    onSuccess,
    errorToString = undefined,
    onError = undefined,
    hasResult = true
) => {
    const initialState = {
        public: {
            status: FetchStatus.IDLE,
            errorMessage: [],
            paramsOnError: [],
            data: [],
            paramsOnSuccess: [],
        },
        counter: 0,
    };

    const [state, dispatch] = useReducer((lastState, action) => {
        switch (action.type) {
            case ActionType.START:
                return {
                    ...initialState,
                    public: {
                        ...initialState.public,
                        status: FetchStatus.FETCHING,
                    },
                };
            case ActionType.ADD_SUCCESS:
                return {
                    public: {
                        ...lastState.public,
                        data: lastState.public.data.concat([action.payload]),
                        paramsOnSuccess:
                            lastState.public.paramsOnSuccess.concat([
                                action.context,
                            ]),
                    },
                    counter: lastState.counter + 1,
                };
            case ActionType.ADD_ERROR:
                return {
                    public: {
                        ...lastState.public,
                        errorMessage: lastState.public.errorMessage.concat([
                            action.payload,
                        ]),
                        paramsOnError: lastState.public.paramsOnError.concat([
                            action.context,
                        ]),
                    },
                    counter: lastState.counter + 1,
                };
            case ActionType.SUCCESS:
                return {
                    ...lastState,
                    public: {
                        ...lastState.public,
                        status: FetchStatus.FETCH_SUCCESS,
                    },
                    counter: 0,
                };
            case ActionType.ERROR:
                return {
                    ...lastState,
                    public: {
                        ...lastState.public,
                        status: FetchStatus.FETCH_ERROR,
                    },
                    counter: 0,
                };
            default:
                return lastState;
        }
    }, initialState);

    const [paramList, setParamList] = useState([]);

    const onInstanceSuccess = useCallback((data, paramsOnSuccess) => {
        dispatch({
            type: ActionType.ADD_SUCCESS,
            payload: data,
            context: paramsOnSuccess,
        });
    }, []);

    const onInstanceError = useCallback((errorMessage, paramsOnError) => {
        // counter now stored in reducer to avoid counter and state being updated not simultenaously,
        // causing useEffect to be triggered once for each change, which would cause an expected behaviour
        dispatch({
            type: ActionType.ADD_ERROR,
            payload: errorMessage,
            context: paramsOnError,
        });
    }, []);

    const [fetchCB] = useDeferredFetch(
        fetchFunction,
        onInstanceSuccess,
        errorToString,
        onInstanceError,
        hasResult
    );

    const fetchCallback = useCallback(
        (cbParamsList) => {
            dispatch({ type: ActionType.START });
            setParamList(cbParamsList);
            for (let params of cbParamsList) {
                fetchCB(...params);
            }
        },
        [fetchCB]
    );

    useEffect(() => {
        if (paramList.length !== 0 && paramList.length === state.counter) {
            if (state.public.errorMessage.length > 0) {
                dispatch({
                    type: ActionType.ERROR,
                });
                if (onError) {
                    onError(
                        state.public.errorMessage,
                        paramList,
                        state.public.paramsOnError
                    );
                }
            } else {
                dispatch({
                    type: ActionType.SUCCESS,
                });
                if (onSuccess) {
                    onSuccess(state.public.data);
                }
            }
        }
    }, [paramList, onError, onSuccess, state]);

    return [fetchCallback];
};
