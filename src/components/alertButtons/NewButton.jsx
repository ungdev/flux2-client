import React from "react";

import AlertButtonService from '../../services/AlertButtonService';

import Dialog from 'material-ui/Dialog';
import { Row, Col } from 'react-flexbox-grid';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';

export default class NewButton extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            categories: [
                "manque",
                "sante",
                "securite",
                "technique"
            ],
            teams: props.teams,
            formData: {
                title: {
                    error: null,
                    value: ""
                },
                category: {
                    error: null,
                    value: null
                },
                receiver: {
                    error: null,
                    value: null
                },
                messageRequired: {
                    value: false
                },
                placeholder: {
                    value: ""
                }
            }
        };

        // binding
        this._submitForm = this._submitForm.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ teams: nextProps.teams });
    }

    /**
     * Update an attribute of the alert button object in the component state
     *
     * @param {string} attribute
     * @param {string|boolean} value
     */
    _setFormDataAttribute(attribute, value) {
        const state = this.state;
        state.formData[attribute].value = value;
        this.setState(state);
    }

    /**
     * Check if the fields are valid
     * In this case, call the AlertButtonService to create a new AlertButton
     */
    _submitForm() {
        const state = this.state;

        // check if required attributes are set
        let errCounter = 0;
        if (!state.formData.title.value) {
            state.formData.title.error = "Title required";
            errCounter++;
        }
        if (!state.formData.category.value) {
            state.formData.category.error = "Category required";
            errCounter++;
        }
        if (!state.formData.receiver.value) {
            state.formData.receiver.error = "Receiver required";
            errCounter++;
        }

        // if no error, submit the form
        if (errCounter === 0) {
            const data = {
                receiver: state.formData.receiver.value,
                title: state.formData.title.value,
                message: state.formData.messageRequired.value,
                messagePlaceholder: state.formData.placeholder.value,
                category: state.formData.category.value,
            };
            AlertButtonService.create(data)
                .then(data => this.props.close())
                .catch(error => console.log("create alert button error : ", error));
        } else {
            // else display errors
            this.setState(state);
        }
    }

    render() {

        const formData = this.state.formData;

        const actions = [
            <FlatButton
                label="Créer le bouton"
                primary={true}
                onClick={this._submitForm}
            />,
            <FlatButton
                label="Annuler"
                secondary={true}
                onClick={this.props.close}
            />
        ];


        return (
            <Dialog
                title="Creation d'un bouton d'alerte"
                open={this.props.show}
                modal={true}
                onRequestClose={this.props.close}
                actions={actions}
            >
                <Row>
                    <Col xs={12}>
                        <TextField
                            fullWidth={true}
                            floatingLabelText="Button title"
                            value={formData.title.value}
                            onChange={e => this._setFormDataAttribute("title", e.target.value)}
                            errorText={formData.title.error}
                        />
                    </Col>
                    <Col xs={12} sm={6}>
                        <AutoComplete
                            floatingLabelText="Categorie"
                            dataSource={this.state.categories}
                            onUpdateInput={v => this._setFormDataAttribute("category", v)}
                        />
                        <SelectField
                            onChange={(e, i, v) => this._setFormDataAttribute("receiver", v)}
                            value={formData.receiver.value}
                            errorText={formData.receiver.error}
                            floatingLabelText="Destinataire"
                        >
                            {
                                this.state.teams.map((team, i) => {
                                    return <MenuItem key={i} value={team.id} primaryText={team.name} />
                                })
                            }
                        </SelectField>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Toggle
                            label="Message obligatoire :"
                            onToggle={_ => this._setFormDataAttribute("messageRequired", !formData.messageRequired.value)}
                            style={{maxWidth: 250}}
                        />
                        <TextField
                            floatingLabelText="Message placeholder"
                            value={formData.placeholder.value}
                            onChange={e => this._setFormDataAttribute("placeholder", e.target.value)}
                        />
                    </Col>
                </Row>
            </Dialog>
        );
    }

}