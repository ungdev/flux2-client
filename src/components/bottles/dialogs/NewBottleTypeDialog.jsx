import React from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { Row, Col } from 'react-flexbox-grid';

import BottleTypeService from '../../../services/BottleTypeService';
import NotificationActions from '../../../actions/NotificationActions';

export default class NewBottleTypeDialog extends React.Component {

    constructor(props) {
        super(props);


        this.state = {
            values: {
                'name': '',
                'shortName': '',
                'quantityPerBox': '4',
                'sellPrice': '0',
                'supplierPrice': '0',
                'originalStock': '0',
            },
            errors: {},
            shortNameModified: false,
        };

        // binding
        this._handleFieldChange = this._handleFieldChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
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
        let shortNameModified = this.state.shortNameModified;

        // Set shortName modification flag
        if(field === 'shortName') {
            shortNameModified = (value !== '');
        }
        else if(values.shortName === '') {
            shortNameModified = false;
        }

        // Float number testing
        const numberAttributes = ["sellPrice", "supplierPrice", "quantityPerBox"];
        if (numberAttributes.indexOf(field) !== -1) {
            values[field] = values[field].replace(',', '.').replace(/[^0-9\.]/, '');
        }

        // Integer number testing
        if(!shortNameModified && field === 'count') {
            values[field] = values[field].replace(/[^0-9]/, '');
        }

        // Generate shortname
        if(!shortNameModified && field === 'name') {
            let words = value.split(' ');
            if(words.length > 2 && words[2]) {
                values.shortName = (words[0][0] + words[1][0] + words[2][0]).toUpperCase().trim();
            }
            else if(words.length > 1 && words[1]) {
                values.shortName = (words[0][0] + words[1][0]).toUpperCase().trim();
            }
            else {
                values.shortName = value.substr(0,3).toUpperCase().trim();
            }
        }

        // shortName testing
        if (field === 'name' || field === 'shortName') {
            values.shortName = values.shortName.toUpperCase().replace(/[^A-z]/, '');
        }

        this.setState({
            values: values,
            errors: {},
            shortNameModified: shortNameModified
        });
    }

    /**
     * Call the BottleType Service to create a new BottleType
     *
     * @param {Event} e Event like form submit that will be stopped
     */
    _handleSubmit(e) {
        if(e) {
            e.preventDefault();
        }
        // Submit
        BottleTypeService.create(this.state.values)
        .then((type) => {
            this.setState({
                values: {
                    'name': '',
                    'shortName': '',
                    'quantityPerBox': '4',
                    'sellPrice': '0',
                    'supplierPrice': '0',
                    'originalStock': '0',
                },
                errors: {},
            });

            NotificationActions.snackbar('Le type de bouteille ' + type.name + ' a bien été créé.');
            this.focusField.focus();
        })
        .catch((error) => {
            let errors = {};
            if(error.status === 'ValidationError' && error.formErrors) {
                for (let field in error.formErrors) {
                    if(error.formErrors[field][0].rule == 'string') {
                        errors[field] = 'Ce champ est vide ou contient une donnée invalide.';
                    }
                    else if(error.formErrors[field][0].rule == 'unique') {
                        errors[field] = 'Il existe déjà un autre type de bouteille avec cette valeur.';
                    }
                    else if(error.formErrors[field][0].rule == 'required') {
                        errors[field] = 'Ce champ est obligatoire.';
                    }
                    else {
                        errors[field] = error.formErrors[field][0].message;
                        console.warn('Validation message not translated. ', error.formErrors[field]);
                    }
                }
            }
            this.setState({ errors: errors });

            if(!Object.keys(errors).length) {
                NotificationActions.error('Une erreur s\'est produite pendant la création du type de bouteille', error);
            }
        });
    }

    render() {
        const actions = [
            <FlatButton
                label="Fermer"
                secondary={true}
                onTouchTap={this.props.close}
            />,
            <FlatButton
                label="Créer"
                primary={true}
                type="submit"
                onTouchTap={this._handleSubmit}
            />,
        ];

        return (
            <Dialog
                title={'Création d\'un type de bouteille'}
                open={this.props.show}
                actions={actions}
                autoScrollBodyContent={true}
                modal={false}
                onRequestClose={this.props.close}
            >

                Remplissez le formulaire ci-dessous pour créer un nouveau type de bouteille.


                <form onSubmit={this._handleSubmit}>
                    <button type="submit" style={{display:'none'}}>Hidden submit button, necessary for form submit</button>
                    <Row>
                        <Col xs={12} sm={6}>
                            <TextField
                                floatingLabelText="Nom"
                                errorText={this.state.errors.name}
                                value={this.state.values.name}
                                fullWidth={true}
                                onChange={e => this._handleFieldChange('name', e.target.value)}
                                autoFocus={true}
                                ref={(field) => { this.focusField = field; }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <TextField
                                floatingLabelText="Abréviation"
                                maxLength="3"
                                errorText={this.state.errors.shortName}
                                value={this.state.values.shortName}
                                fullWidth={true}
                                onChange={e => this._handleFieldChange('shortName', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={6}>
                        <TextField
                            floatingLabelText="Prix fournisseur (€)"
                            errorText={this.state.errors.supplierPrice}
                            value={this.state.values.supplierPrice}
                            fullWidth={true}
                            onChange={e => this._handleFieldChange('supplierPrice', e.target.value)}
                        />
                        </Col>
                        <Col xs={12} sm={6}>
                            <TextField
                                floatingLabelText="Prix de revente (€)"
                                errorText={this.state.errors.sellPrice}
                                value={this.state.values.sellPrice}
                                fullWidth={true}
                                onChange={e => this._handleFieldChange('sellPrice', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={6}>
                            <TextField
                                floatingLabelText="Nombre par caisse"
                                errorText={this.state.errors.quantityPerBox}
                                value={this.state.values.quantityPerBox}
                                fullWidth={true}
                                onChange={e => this._handleFieldChange('quantityPerBox', e.target.value)}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <TextField
                                floatingLabelText="Nombre de caisses"
                                errorText={this.state.errors.originalStock}
                                value={this.state.values.originalStock}
                                fullWidth={true}
                                onChange={e => this._handleFieldChange('originalStock', e.target.value)}
                            />
                        </Col>
                    </Row>
                </form>
            </Dialog>
        );
    }

}
