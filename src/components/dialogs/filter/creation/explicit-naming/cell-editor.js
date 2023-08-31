import { AutocompleteInput } from '@gridsuite/commons-ui';
import { forwardRef } from 'react';
import TableCellWrapper from './table-cell-wrapper';

const CellEditor = forwardRef(({ ...props }, ref) => {
    const { name, data, options } = props;

    const getObjectId = (value) => {
        return value;
    };

    const outputTransform = () => {
        return options?.id;
    };

    return (
        options.length > 0 && (
            <TableCellWrapper agGridRef={ref} name={name}>
                <AutocompleteInput
                    allowNewValue
                    forcePopupIcon
                    name={data.agGridRowUuid}
                    options={options}
                    getOptionLabel={() => getObjectId(props.value)}
                    outputTransform={outputTransform}
                    //hack to work with freesolo autocomplete
                    //setting null programatically when freesolo is enable wont empty the field
                    inputTransform={(value) => value}
                    // outputTransform={(value) =>
                    //     value === '' ? null : getObjectId(value)
                    // }
                    size={'small'}
                    formProps={{
                        sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'unset', // Remove the border
                            },
                        },
                    }}
                />
            </TableCellWrapper>
        )
    );
});

export default CellEditor;
