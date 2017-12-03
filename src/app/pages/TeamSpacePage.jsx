import React from 'react';

import AuthStore from 'stores/AuthStore';

import TeamSpaceMenu from 'app/Overview/TeamSpaceMenu.jsx';
import TeamStockScene from 'app/Stocks/TeamStockScene.jsx';
import ChatScene from 'app/Chat/ChatScene.jsx';
import AlertButtonScene from 'app/AlertButtons/AlertButtonScene.jsx';
import DataLoader from "app/components/DataLoader.jsx";

require('./TeamSpace.scss');

export default class TeamSpacePage extends React.Component {
    render() {
        return (
            <DataLoader
                filters={new Map([
                    ['Team', {id: parseInt(this.props.router.params.id)}],
                ])}
                onChange={ datastore => this.setState({
                    team: datastore.Team.first,
                })}
            >
                { () => {
                    const channel = 'public:' + this.state.team.name;
                    return (
                        <div className="TeamSpace">
                            <div className="TeamSpace__alerts TeamSpace__col--secondary">
                                <AlertButtonScene team={this.state.team} />
                            </div>
                            <div className="TeamSpace__stock">
                                <TeamStockScene team={this.state.team} />
                            </div>
                            <div className="TeamSpace__chat">
                                <ChatScene channel={channel} hideMenu/>
                            </div>
                            <div className="BarHomePage_nav TeamSpace__col--secondary">
                                <TeamSpaceMenu team={this.state.team} />
                            </div>
                        </div>
                    );
                }}
            </DataLoader>
        );
    }
}