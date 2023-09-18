import { useImperativeHandle } from 'react';
import { useWatch } from 'react-hook-form';

const TableCellWrapper = ({ agGridRef, name, children }) => {
    const watchValues = useWatch({
        name,
    });

    useImperativeHandle(
        agGridRef,
        () => {
            return {
                getValue: () => {
                    return watchValues;
                },
            };
        },
        [watchValues]
    );

    return <>{children}</>;
};

export default TableCellWrapper;
