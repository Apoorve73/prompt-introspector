import React from 'react';

/**
 * Loading spinner component with customizable size and message
 */
const LoadingSpinner = ({
        size = 'medium',
        message = 'Loading...',
        className = '',
        inline = false
    }) => {
        const sizeClasses = {
            small: 'w-4 h-4',
            medium: 'w-6 h-6',
            large: 'w-8 h-8',
        };

        const spinnerSize = sizeClasses[size] || sizeClasses.medium;

        const spinner = ( <
            div className = { `spinner ${spinnerSize} ${className}` }
            />
        );

        if (inline) {
            return ( <
                div className = "loading" > { spinner } {
                    message && < span > { message } < /span>} <
                        /div>
                );
            }

            return ( <
                div className = "text-center"
                style = {
                    { padding: '2rem' } } > { spinner } {
                    message && ( <
                        p className = "text-gray-600"
                        style = {
                            { marginTop: '1rem' } } > { message } <
                        /p>
                    )
                } <
                /div>
            );
        };

        export default LoadingSpinner;