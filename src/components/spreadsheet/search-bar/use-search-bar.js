import { useCallback, useState } from 'react';

export const useSearchBar = (aggridRef) => {
    const [searchInput, setSearchInput] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const searchOccurencesInObjectValues = (object, str) => {
        const result = [];

        object.forEach((value, key) => {
            if (value?.toString().indexOf(str) >= 0) {
                result.push(key);
            }
        });

        return result;
    };

    const executeSearchOnRows = useCallback(
        (rowsToSearchFrom) => {
            console.log(searchInput);
            if (!searchInput) {
                setSearchResult([]);
                return;
            }

            const newSearchResult = [];
            rowsToSearchFrom.forEach((row, index) =>
                searchOccurencesInObjectValues(row, searchInput).forEach((r) =>
                    newSearchResult.push([index, r])
                )
            );

            setSearchResult(newSearchResult);
        },
        [searchInput]
    );

    const filterHiddenValuesFromRows = useCallback(
        (fullRows) =>
            fullRows.map((fullRow) => {
                const rowWithoutHiddenValue = new Map();
                // column definition depends on current AGGrid state
                // if user is moving/hiding the columns, this state will be up to date
                const currentColumnDefinition =
                    aggridRef.current?.api?.getColumnDefs();

                const displayedColumnsField = currentColumnDefinition
                    .filter((column) => column.hide !== true)
                    .map((column) => column.field);

                const rowKeys = Object.keys(fullRow);

                displayedColumnsField.forEach((displayedField) => {
                    if (rowKeys.includes(displayedField)) {
                        rowWithoutHiddenValue.set(
                            displayedField,
                            fullRow[displayedField]
                        );
                    }
                });

                return rowWithoutHiddenValue;
            }),
        []
    );

    const calculateSearchBarResults = useCallback(() => {
        console.log(aggridRef.current?.api);
        if (aggridRef.current?.api != null) {
            const results = [];
            aggridRef.current?.api.forEachNodeAfterFilterAndSort((rowNode) => {
                results.push(rowNode.data);
            });
            executeSearchOnRows(filterHiddenValuesFromRows(results));
        }
    }, [filterHiddenValuesFromRows, executeSearchOnRows]);

    const focusCell = useCallback((index, columnName) => {
        aggridRef.current?.api.ensureIndexVisible(index, 'middle');
        // ensureIndexVisible will scroll to the desired index, but it takes some time to render the rows
        // setFocusCell will do nothing if the selected cell is rendered yet, we need to wait for the scroll to be done
        setTimeout(() => {
            aggridRef.current?.api.setFocusedCell(index, columnName);
        }, 100);
    }, []);

    return {
        calculateSearchBarResults,
        focusCell,
        searchInput,
        setSearchInput,
        searchResult,
    };
};
