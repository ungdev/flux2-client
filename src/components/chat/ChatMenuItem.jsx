import React from 'react';

export default class ChatMenuItem extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            newMessages: props.newMessages,
            channel: props.channel
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            newMessages: nextProps.newMessages,
            channel: nextProps.channel
        });
    }

    render() {
        return (
            <div>
                {
                    this.state.newMessages
                        ?
                            <span className="Notification_bubble">{this.state.newMessages}</span>
                        :
                            null

                }
                <div className="ChatMenu__channel__nameContainer">{this.state.channel.split(':')[1]}</div>
            </div>
        );
    }

}
