import React from 'react';
import PropTypes from 'prop-types';

const TestJS = ({ title }) => {
    return (
        <>
            <h2>test JS</h2>
            <h1>{title}</h1>
        </>
    );
};

TestJS.propTypes = {
    title: PropTypes.string.isRequired,
};

export default TestJS;
