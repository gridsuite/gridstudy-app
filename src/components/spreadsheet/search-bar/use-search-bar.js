import { useCallback, useState } from 'react';

// aggridRef is a ref to AGGrid in order to use the Aggrid API
// eslint can't tell it's a ref when passing it as an argument, we need to add it to hooks dependencies even if it won't change
export const useSearchBar = (aggridRef) => {
    const [searchInput, setSearchInput] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const searchOccurencesInObjectValues = (object, str) => {
        return (
            Object.values(object).filter(
                (value) => value?.toString().indexOf(str) >= 0
            ).length > 0
        );
    };

    const executeSearchOnRows = useCallback(
        (rowsToSearchFrom) => {
            if (!searchInput) {
                setSearchResult([]);
                return;
            }

            const newSearchResult = [];
            rowsToSearchFrom.forEach((row, index) => {
                if (searchOccurencesInObjectValues(row, searchInput)) {
                    newSearchResult.push(index);
                }
            });

            setSearchResult(newSearchResult);
        },
        [searchInput]
    );

    const filterHiddenValuesFromRows = useCallback(
        (fullRows) =>
            fullRows.map((fullRow) => {
                const rowWithoutHiddenValue = {};
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
                        rowWithoutHiddenValue[displayedField] =
                            fullRow[displayedField];
                    }
                });

                return rowWithoutHiddenValue;
            }),
        [aggridRef]
    );

    const calculateSearchBarResults = useCallback(() => {
        if (aggridRef.current?.api != null) {
            const results = [];
            aggridRef.current?.api.forEachNodeAfterFilterAndSort((rowNode) => {
                results.push(rowNode.data);
            });
            executeSearchOnRows(filterHiddenValuesFromRows(results));
        }
    }, [filterHiddenValuesFromRows, executeSearchOnRows, aggridRef]);

    const focusCell = useCallback(
        (index) => {
            aggridRef.current?.api.ensureIndexVisible(index, 'middle');
            aggridRef.current?.api
                .getDisplayedRowAtIndex(index)
                .setSelected(true);
        },
        [aggridRef]
    );

    return {
        calculateSearchBarResults,
        focusCell,
        searchInput,
        setSearchInput,
        searchResult,
    };
};
