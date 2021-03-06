import React from 'react';

import {List, ListItem} from 'material-ui/List'
import Confirm from 'components/partials/Confirm.jsx'
import NotificationActions from 'actions/NotificationActions';
import DeveloperService from 'services/DeveloperService';

/**
 * @param {object} route The route state
 */
export default class DeveloperPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showRefreshDialog: false,
        };

        this._handleRefresh = this._handleRefresh.bind(this);
    }

    _handleRefresh() {
        NotificationActions.snackbar('Demande d\'actualisation lancée.');
        DeveloperService.refresh()
        .catch((error) => {
            NotificationActions.error('Une erreur s\'est produite pendant la demande d\'actualisation des navigateurs', error);
        });
    }

    render() {
        return (
            <div className={this.props.className}>
                <List>
                    <ListItem
                        primaryText="Actualiser les clients Flux"
                        secondaryText="Tout les navigateurs connectés seront redirigé vers la page d'accueil"
                        onClick={() => this.setState({showRefreshDialog: true})}
                        />
                </List>

                <Confirm
                    show={this.state.showRefreshDialog}
                    no={() => this.setState({showRefreshDialog: false})}
                    yes={this._handleRefresh}
                >
                    Voulez-vous vraiment rediriger tous les utilisateurs vers la page d'accueil de Flux ?
                </Confirm>
            </div>
        );
    }
}
