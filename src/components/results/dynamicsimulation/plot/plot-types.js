import PropTypes from 'prop-types';

export const SeriesType = PropTypes.arrayOf(
    PropTypes.shape({
        index: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        data: PropTypes.shape({
            x: PropTypes.arrayOf(PropTypes.number),
            y: PropTypes.arrayOf(PropTypes.number),
        }),
    })
);
