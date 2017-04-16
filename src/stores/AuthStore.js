import jwtDecode from 'jwt-decode';
import BaseStore from './BaseStore';
import AuthService from '../services/AuthService';
import UserService from '../services/UserService';
import TeamService from '../services/TeamService';
import AuthActions from '../actions/AuthActions';
import NotificationActions from '../actions/NotificationActions';

class AuthStore extends BaseStore {

    constructor() {
        super();
        this.subscribe(() => this._handleActions.bind(this));

        // active account
        this._jwt = null;

        // is not null if the user is logged as someone else
        this._loginAs = false;

        // contains data about the authenticated user
        this._user = null;

        // contains data about the teams
        this._team = null;

        // Roles->permission configuration
        // No need to listen to roles updates, because configuration can only
        // change on server reboot wich will trigger re-authentication anyway
        this._roles = null;

        // contain current user permissions
        this._permissions = null;
    }


    /**
     * init the store : pull current roles->permission association
     * @param {string} jwt The jwt return by the server after authentication
     */
    _init(jwt) {
        // Save decoded jwt
        try {
            this._jwt = jwtDecode(jwt);
            this.emitChange();
        } catch (e) {
            // If error in the jwt, logout user
            this._jwt = null;
            this._user = null;
            this._loginAs = false;
            this._team = null;
            this._roles = null;
            this._permissions = null;
            this.emitChange();
            return;
        }

        // get the roles->permission association
        AuthService.getRoles()
            .then(data => {
                this._roles = data;
                this.emitChange();
            })
            .catch(error => {
                NotificationActions.error('Impossible de récupérer les droits configurés sur le serveur.', error, null, true);
            });

        // Init current user and team
        UserService.getById(this.jwt.userId)
            .then(user => {
                this._user = user;
                iosocket.on('user', (e) => this._handleUserEvents(e));
                this.emitChange();
                return TeamService.getById(this.user.team);
            })
            .then(team => {
                this._team = team;
                this._permissions = this.roles[this.team.role];
                iosocket.on('team', (e) => this._handleTeamEvents(e));
                this.emitChange();
                AuthActions.authenticated(this.user, this.team);
            })
            .catch(error => {
                NotificationActions.error('Impossible de récupérer les informations sur l\'utilisateur actuel. Veuillez vous reconnecter.', error, null, true);
            });
    }

    /**
     * Handle webSocket events about the User model
     *
     * @param {object} e : the event data
     */
    _handleUserEvents(e) {
        if(this.user && this.user.id === e.id) {
            switch (e.verb) {
                case "destroyed":
                    AuthActions.logout();
                    NotificationActions.error('Votre utilisateur a été supprimé du serveur. Vous êtes maintenant déconnecté.',null,e);
                    break;
                case "updated":
                    this._user = e.data;
                    this.emitChange();
                    break;
            }
        }
    }

    /**
     * Handle webSocket events about the Team model
     *
     * @param {object} e : the event data
     */
    _handleTeamEvents(e) {
        if(this.team && this.team.id === e.id) {
            switch (e.verb) {
                case "destroyed":
                    AuthActions.logout();
                    NotificationActions.error('Votre équipe a été supprimé du serveur. Vous êtes maintenant déconnecté.',null,e);
                    break;
                case "updated":
                    this._team = e.data;
                    this.emitChange();
                    break;
            }
        }
    }


    /**
     * Check if the authenticated user has the permission
     *
     * @param  {string} permission permission name
     * @return {boolean}            true if the user has the permission
     */
    can(permission) {
        return (this.permissions && this.permissions.indexOf(permission) !== -1);
    }

    get jwt() {
        return this._jwt;
    }

    get loginAs() {
        return this._loginAs;
    }

    get user() {
        return this._user;
    }

    get team() {
        return this._team;
    }

    get permissions() {
        return this._permissions;
    }

    get roles() {
        return this._roles;
    }

    set loginAs(v) {
        this._loginAs = v;
        this.emitChange();
    }

    set jwt(jwt) {
        this._init(jwt);
    }

    _handleActions(action) {
        switch(action.type) {
            case "AUTH_JWT_SAVED":
                this._init(action.jwt);
                break;
            case "AUTH_LOGGED_OUT":
                this._init();
                break;
            case "AUTH_LOGGED_AS":
                this.loginAs = true;
                break;
            case "AUTH_LOGGED_BACK":
                this.loginAs = false;
                break;
        }
    }

}

export default new AuthStore();
