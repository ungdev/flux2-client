import React from 'react';

import { DialogTitle, DialogActions, DialogContent } from 'material-ui/Dialog';
import Dialog from 'app/components/ResponsiveDialog.jsx';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { Row, Col } from 'react-flexbox-grid';

import BottleTypeService from 'services/BottleTypeService';
import NotificationActions from 'actions/NotificationActions';
import Confirm from 'app/components/Confirm.jsx';


/**
 * @param {BottleType} type
 * @param {integer} count Current number of bottles in this type
 */
export default class UpdateBottleTypeDialog extends React.Component {

    constructor(props) {
        super(props);


        this.state = {
            values: {
                'name': props.type.name || '',
                'shortName': props.type.shortName || '',
                'quantityPerBox': props.type.quantityPerBox || '',
                'sellPrice': props.type.sellPrice || '',
                'supplierPrice': props.type.supplierPrice || '',
                'originalStock': props.type.originalStock || '',
            },
            errors: {},
            shortNameModified: true,
            showReduceDialog: false,
            showDeleteDialog: false,
        };

        this.submitted = false,

        // binding
        this._handleFieldChange = this._handleFieldChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
        this._handleDelete = this._handleDelete.bind(this);
    }

    componentWillReceiveProps(props) {
        if(!this.submitted) {
            this.setState({
                values: {
                    'name': props.type.name || '',
                    'shortName': props.type.shortName || '',
                    'quantityPerBox': props.type.quantityPerBox || '',
                    'sellPrice': props.type.sellPrice || '',
                    'supplierPrice': props.type.supplierPrice || '',
                    'originalStock': props.type.originalStock || '',
                },
                errors: {},
            });
        }
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
     * Call the BottleType Service to update BottleType
     *
     * @param {Event} e Event like form submit that will be stopped
     * @param {boolean} confirm has to be set to true to reduce bottle number
     */
    _handleSubmit(e, confirm) {
        if(e) {
            e.preventDefault();
        }

        // Check if bottle number has been reduced and warn if so
        if(confirm !== true && this.props.originalStock > this.state.values.originalStock) {
            this.setState({showReduceDialog: true});
            return;
        }



        // Submit
        this.submitted = true;
        BottleTypeService.update(this.props.type.id, this.state.values)
        .then((type) => {
            this.setState({
                errors: {},
                showReduceDialog: false,
            });

            this.submitted = false;
            NotificationActions.snackbar('Le type ' + this.state.values.name + ' a bien été modifié.');
            if(this.focusField) this.focusField.focus();
            this.props.close();
        })
        .catch((error) => {
            this.submitted = false;

            let errors = {};
            if(error.status === 'ValidationError' && error.formErrors) {
                for (let field in error.formErrors) {
                    if(error.formErrors[field][0].rule === 'string') {
                        errors[field] = 'Ce champ est vide ou contient une donnée invalide.';
                    }
                    else if(error.formErrors[field][0].rule === 'unique') {
                        errors[field] = 'Il existe déjà un autre type de bouteille avec cette valeur.';
                    }
                    else if(error.formErrors[field][0].rule === 'required') {
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
                NotificationActions.error("Une erreur s'est produite pendant la création du type de bouteille", error);
            }
        });
    }


    /**
     * Call the service to delete this element.
     * In case of success, close the update dialog
     */
    _handleDelete() {
        // Submit
        BottleTypeService.destroy(this.props.type.id)
        .then(() => {
            NotificationActions.snackbar('Les bouteilles ont bien été supprimées.');
            this.setState({showDeleteDialog: false});
            this.props.close();
        })
        .catch((error) => {
            NotificationActions.error('Une erreur s\'est produite pendant la supression des bouteilles', error);
        });
    }


    render() {

        return (

            <Dialog
                open={this.props.show}
                onRequestClose={this.props.close}
            >
                <DialogTitle>{'Modification des bouteilles ' + this.state.values.name}</DialogTitle>
                <DialogContent>

                    Modifier le formulaire ci-dessous pour modifier les bouteilles <strong>{this.state.values.name}</strong>.


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
                                    label="Abréviation"
                                    maxLength="3"
                                    error={this.state.errors.shortName != ''}
                                    helperText={this.state.errors.shortName}
                                    value={this.state.values.shortName}
                                    fullWidth
                                    onChange={e => this._handleFieldChange('shortName', e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} sm={6}>
                            <TextField
                                label="Prix fournisseur d'une bouteille (€)"
                                error={this.state.errors.supplierPrice != ''}
                                helperText={this.state.errors.supplierPrice}
                                value={this.state.values.supplierPrice}
                                fullWidth
                                onChange={e => this._handleFieldChange('supplierPrice', e.target.value)}
                            />
                            </Col>
                            <Col xs={12} sm={6}>
                                <TextField
                                    label="Prix de revente d'une bouteille (€)"
                                    error={this.state.errors.sellPrice != ''}
                                    helperText={this.state.errors.sellPrice}
                                    value={this.state.values.sellPrice}
                                    fullWidth
                                    onChange={e => this._handleFieldChange('sellPrice', e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} sm={6}>
                                <TextField
                                    label="Nombre de bouteille par caisse"
                                    error={this.state.errors.quantityPerBox != ''}
                                    helperText={this.state.errors.quantityPerBox}
                                    value={this.state.values.quantityPerBox}
                                    fullWidth
                                    onChange={e => this._handleFieldChange('quantityPerBox', e.target.value)}
                                />
                            </Col>
                            <Col xs={12} sm={6}>
                                <TextField
                                    label="Nombre de bouteilles"
                                    error={this.state.errors.originalStock != ''}
                                    helperText={this.state.errors.originalStock}
                                    value={this.state.values.originalStock}
                                    fullWidth
                                    onChange={e => this._handleFieldChange('originalStock', e.target.value)}
                                />
                            </Col>
                        </Row>
                    </form>

                    <Confirm
                        show={this.state.showReduceDialog}
                        no={() => this.setState({showReduceDialog: false})}
                        yes={() => this._handleSubmit(null, true)}
                    >
                        Vous avez réduit le nombre de bouteilles. Ces bouteilles ainsi que toutes les informations associés à ces bouteilles (historique, état, position) seront supprimées.
                        Voulez-vous continuer ?
                    </Confirm>

                    <Confirm
                        show={this.state.showDeleteDialog}
                        no={() => this.setState({showDeleteDialog: false})}
                        yes={this._handleDelete}
                    >
                        Voulez-vous vraiment supprimer le type de bouteilles <strong>{this.state.values.name}</strong> ainsi que tout les bouteilles associées ?
                    </Confirm>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="accent"
                        onTouchTap={() => this.setState({showDeleteDialog: true})}
                        className="Dialog__DeleteButon"
                    >
                        Supprimer
                    </Button>
                    <Button
                        color="accent"
                        onTouchTap={this.props.close}
                    >
                        Fermer
                    </Button>
                    <Button
                        color="primary"
                        type="submit"
                        onTouchTap={this._handleSubmit}
                    >
                        Modifier
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

}
