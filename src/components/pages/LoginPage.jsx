import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import AuthService from '../../services/AuthService';
import NotificationActions from '../../actions/NotificationActions';

export default class LoginPage extends React.Component {

    /**
     *  Redirect the user to the EtuUtt auth page
     */
    _login() {
        NotificationActions.loading('Connexion depuis EtuUTT en cours..');
        AuthService.authWithEtuUTT()
            .then((data) => {
                window.location = data.redirectUri;
            })
            .catch((error) => {
                NotificationActions.error('Une erreur s\'est produite pendant l\'initialisation de la connexion via EtuUTT', error)
            });
    }

    render() {

        return (
            <div className="container">
                <h2 className="title">Flux</h2>
                <RaisedButton label="Se connecter avec un compte UTT" primary={true} onTouchTap={this._login} />
            </div>
        );
    }

}