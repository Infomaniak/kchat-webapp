import React from 'react';

// eslint-disable-next-line react/require-optimization
class KmeetCall extends React.Component {
    containerRef: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        const api = window.jitsiNodeAPI.setupRenderer(this.containerRef.current);
    }

    render() {
        return (
            <div
                style={{height: '100vh'}}
                ref={this.containerRef}
            />
        );
    }
}

export default KmeetCall;
