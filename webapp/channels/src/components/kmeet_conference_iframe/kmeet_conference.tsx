import React from 'react';

// eslint-disable-next-line react/require-optimization
class KmeetCall extends React.Component {
    containerRef: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        const loadCall = async () => {
            const callInfo = await (window as any).jitsiNodeAPI.getCallInfo();
            (window as any).jitsiNodeAPI.setupRenderer(this.containerRef.current, callInfo);
        };

        loadCall();
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
