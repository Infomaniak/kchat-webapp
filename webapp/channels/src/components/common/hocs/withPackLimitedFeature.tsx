import React from 'react';
import {connect} from 'react-redux';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';

import {getPackLimitedFeature} from '../utils/getPackLimitedFeature';

type InjectedProps = {
    isPackFeatureEnabled: boolean;
    packLimitedModalRef: React.RefObject<any>;
    packLimitedOnClick: () => void;
    PackLimitedLabel: React.ReactNode;
    PackLimitedModal: React.ReactNode;
};

type Config = {
    isEnabled: (packName: string) => boolean;
    onAllowed: () => void;
    fallbackLabel?: React.ReactNode;
    modalContent?: React.ReactNode;
};

export function withPackLimitedFeature<P extends InjectedProps>(
    WrappedComponent: React.ComponentType<P>,
    config: Config,
) {
    class HOC extends React.Component<{packName: string}> {
        modalRef = React.createRef<any>();

        render() {
            const isEnabled = config.isEnabled(this.props.packName);

            const {onClick, Label, Modal} = getPackLimitedFeature({
                isEnabled,
                onAllowed: config.onAllowed,
                fallbackLabel: config.fallbackLabel,
                modalContent: config.modalContent,
                modalRef: this.modalRef,
            });

            return (
                <WrappedComponent
                    {...(this.props as Omit<P, keyof InjectedProps>)}
                    isPackFeatureEnabled={isEnabled}
                    packLimitedOnClick={onClick}
                    packLimitedModalRef={this.modalRef}
                    PackLimitedLabel={Label}
                    PackLimitedModal={Modal}
                />
            );
        }
    }

    const mapStateToProps = (state: any) => ({
        packName: getCurrentPackName(state),
    });

    return connect(mapStateToProps)(HOC);
}
