import React from 'react';

import TextField from 'material-ui/TextField';
import { Row, Col } from 'react-flexbox-grid';

import UserService from 'services/UserService';
import NotificationActions from 'actions/NotificationActions';

export default class AddIpMemberForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            team: props.team,
            values: {
                'name': 'PC',
                'ip': '',
            },
            errors: {},
        };

        // binding
        this._handleFieldChange = this._handleFieldChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ team: nextProps.team });
    }

    /**
     * Called on field change
     *
     * @param  {string} field Field name
     * @param  {string} value New value
     */
    _handleFieldChange(field, value) {
        let values = this.state.values;
        values[field] = value;
        this.setState({values: values, errors: {}});
    }

    /**
     * Call the UserService to create user
     *
     * @param {Event} e Event like form submit that will be stopped
     */
    _handleSubmit(e) {
        if(e) {
            e.preventDefault();
        }

        // Submit
        UserService.create({
            teamId: this.state.team.id,
            name: this.state.values.name,
            ip: this.state.values.ip,
        })
        .then(user => {
            this.setState({ values: {
                name: 'PC',
                ip: '',
            } });
            NotificationActions.snackbar('L\'utilisateur ' + user.name + ' a bien été ajouté à l\'équipe ' + this.state.team.name);
            if(this.focusField) this.focusField.focus();
        })
        .catch(error => {
            if(error.formErrors && Object.keys(error.formErrors).length) {
                this.setState({ errors: error.formErrors });
            }
            else {
                NotificationActions.error('Une erreur s\'est produite pendant la création de l\'utilisateur', error);
            }
        });
    }

    /**
     * External call for _handleSubmit
     */
    submit() {
        this._handleSubmit();
    }

    render() {

        return (
            <div>
                Pour ajouter un membre à l'équipe <strong>{this.state.team.name}</strong> qui
                se connectera automatiquement en fonction de son ip, il vous
                suffit d'entrer l'ip et le nom du compte dans le formulaire ci-dessous.<br/>

                <form onSubmit={this._handleSubmit}>
                    <button type="submit" style={{display:'none'}}>Hidden submit button, necessary for form submit</button>
                    <Row>
                        <Col xs={12} sm={6}>
                            <TextField
                                label="Nom"
                                error={this.state.errors.name != ''}
                                helperText={this.state.errors.name}
                                value={this.state.values.name}
                                fullWidth
                                onChange={e => this._handleFieldChange('name', e.target.value)}
                                autoFocus={true}
                                inputRef={(field) => { this.focusField = field; }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <TextField
                                label="IP"
                                error={this.state.errors.ip != ''}
                                helperText={this.state.errors.ip}
                                value={this.state.values.ip}
                                fullWidth
                                onChange={e => this._handleFieldChange('ip', e.target.value)}
                            />
                        </Col>
                    </Row>
                </form>
            </div>
        );
    }

}