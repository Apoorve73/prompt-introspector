import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // You can also log the error to an error reporting service
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.handleRetry);
            }

            // Default fallback UI
            return ( <
                div className = "alert alert-error" >
                <
                h3 > Something went wrong < /h3> <
                p >
                We 're sorry, but something unexpected happened. Please try refreshing the page. <
                /p> {
                    process.env.NODE_ENV === 'development' && ( <
                        details style = {
                            { marginTop: '1rem' } } >
                        <
                        summary > Error Details(Development Only) < /summary> <
                        pre style = {
                            {
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '4px',
                                fontSize: '12px',
                                overflow: 'auto'
                            }
                        } > { this.state.error && this.state.error.toString() } { this.state.errorInfo.componentStack } <
                        /pre> <
                        /details>
                    )
                } <
                button className = "btn btn-primary"
                onClick = { this.handleRetry }
                style = {
                    { marginTop: '1rem' } } >
                Try Again <
                /button> <
                /div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;