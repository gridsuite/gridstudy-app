import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import { Option } from 'components/results/shortcircuit/shortcircuit-analysis-result.type';

// TODO temporary, remove it when SCA results will use full custom headers and filters
export default forwardRef((props: IFilterParams, ref) => {
    const [selectedValues, setSelectedValues] = useState<string[]>(
        props.colDef.filterParams.options.map((option: Option) => option.value)
    );

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            doesFilterPass(params: IDoesFilterPassParams) {
                return true; // we filter in the back end
            },

            // meaning we dont filter if everything is selected, and empty values will remain
            isFilterActive() {
                return (
                    selectedValues.length !==
                    props.colDef.filterParams.options.length
                );
            },

            getModel() {
                if (!this.isFilterActive()) {
                    return null;
                }

                return {
                    filterType: 'text',
                    type: 'equals',
                    filter: selectedValues.length ? selectedValues : null, // trick to select nothing
                };
            },

            setModel(values: string[]) {
                setSelectedValues(values);
            },
        };
    });

    const onChange = (event: any) => {
        const value = event.target.value;
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter((v) => v !== value));
        } else {
            setSelectedValues(selectedValues.concat(value));
        }
    };

    useEffect(() => {
        props.filterChangedCallback();
    }, [props, selectedValues]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 8,
            }}
        >
            <div style={{ fontWeight: 'bold', margin: 2 }}>Select values</div>
            {props.colDef.filterParams.options.map((option: Option) => (
                <label
                    key={option.value}
                    style={{ display: 'flex', alignItems: 'center', margin: 1 }}
                >
                    <input
                        style={{ marginRight: 7 }}
                        type="checkbox"
                        name="filter"
                        value={option.value}
                        checked={selectedValues.includes(option.value)}
                        onChange={onChange}
                    />{' '}
                    {option.label}
                </label>
            ))}
        </div>
    );
});
