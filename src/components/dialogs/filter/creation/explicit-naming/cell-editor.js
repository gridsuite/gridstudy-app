import { AutocompleteInput } from '@gridsuite/commons-ui';
import { forwardRef } from 'react';

const CellEditor = forwardRef(({ ...props }, ref) => {
    const { name, options, colDef, node } = props;
    const cellName = `${name}.${node.rowIndex}.${colDef.field}`;

    return (
        <AutocompleteInput
            allowNewValue
            name={cellName}
            options={options}
            getOptionLabel={(option) => option?.id ?? option}
            inputTransform={(val) => val.id ?? val}
            outputTransform={(val) => val.id ?? val}
            size={'small'}
            formProps={{
                sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: 'unset', // Remove the border
                    },
                },
            }}
        />
    );
});

export default CellEditor;
