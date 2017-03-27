import React from 'react';

import { List } from 'material-ui/List';
import Button from 'material-ui/Button';
import TeamMember from './TeamMember.jsx';
import UpdateTeam from './UpdateTeam.jsx';

export default class TeamDetails extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selected: props.selected,
            showUpdateDialog: false
        };

        // binding
        this._toggleUpdateDialog = this._toggleUpdateDialog.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ selected: nextProps.selected });
    }

    _toggleUpdateDialog() {
        this.setState({showUpdateDialog: !this.state.showUpdateDialog});
    }

    render() {
        if (this.state.selected.team) {
            return (
                <div>
                    <h2>{this.state.selected.team.name}</h2>
                    <div>
                        <Button raised primary onClick={this._toggleUpdateDialog}>Update Team</Button>
                    </div>
                    {
                        (this.state.selected.members && this.state.selected.members.length)
                            ?
                            <List>
                                {
                                    this.state.selected.members.map((member, i) => {
                                        return <TeamMember member={member} key={i}/>
                                    })
                                }
                            </List>
                            :
                            <span>No members</span>
                    }
                    <UpdateTeam
                        show={this.state.showUpdateDialog}
                        close={this._toggleUpdateDialog}
                        team={this.state.selected}
                    />
                </div>
            );
        }
        return (
            <div>
                <span>Select a team to see the details.</span>
            </div>
        );
    }

}