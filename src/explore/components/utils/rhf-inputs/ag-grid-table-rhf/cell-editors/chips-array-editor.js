import { forwardRef } from 'react';
import TableCellWrapper from './table-cell-wrapper';
import MultipleAutocompleteInput from '../../autocomplete-inputs/multiple-autocomplete-input';

const ChipsArrayEditor = forwardRef(({ ...props }, ref) => {
    const { name, node, colDef } = props;
    const cellName = `${name}.${node.rowIndex}.${colDef.field}`;
    return (
        <TableCellWrapper agGridRef={ref} name={cellName}>
            <MultipleAutocompleteInput
                name={cellName}
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
    );
});

export default ChipsArrayEditor;
