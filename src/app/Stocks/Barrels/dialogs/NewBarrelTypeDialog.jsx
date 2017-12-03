import React from 'react';

import { DialogTitle, DialogActions, DialogContent } from 'material-ui/Dialog';
import Dialog from 'app/components/ResponsiveDialog.jsx';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { Grid, Row, Col } from 'react-flexbox-grid';

import BarrelTypeService from 'services/BarrelTypeService';
import NotificationActions from 'actions/NotificationActions';

export default class NewBarrelTypeDialog extends React.Component {

    constructor(props) {
        super(props);


        this.state = {
            values: {
                'name': '',
                'shortName': '',
                'liters': '30',
                'sellPrice': '0',
                'supplierPrice': '0',
                'count': '',
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
        if(field == 'shortName') {
            shortNameModified = (value != '');
        }
        else if(values.shortName == '') {
            shortNameModified = false;
        }

        // Float number testing
        const numberAttributes = ["sellPrice", "supplierPrice", "liters"];
        if (numberAttributes.indexOf(field) != -1) {
            values[field] = values[field].replace(',', '.').replace(/[^0-9\.]/, '');
        }

        // Integer number testing
        if(!shortNameModified && field == 'count') {
            values[field] = values[field].replace(/[^0-9]/, '');
        }

        // Generate shortname
        if(!shortNameModified && field == 'name') {
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
        if (field == 'name' || field == 'shortName') {
            values.shortName = values.shortName.toUpperCase().replace(/[^A-z]/, '');
        }

        this.setState({
            values: values,
            errors: {},
            shortNameModified: shortNameModified
        });
    }

    /**
     * Call the BarrelType Service to create a new BarrelType
     *
     * @param {Event} e Event like form submit that will be stopped
     */
    _handleSubmit(e) {
        if(e) {
            e.preventDefault();
        }
        // Submit
        let typeName = '';
        BarrelTypeService.create(this.state.values)
        .then((type) => {
            typeName = type.name;

            // Set the barrel number
            return BarrelTypeService.setBarrelNumber(type.id, this.state.values.count);
        })
        .then(() => {
            this.setState({
                values: {
                    'name': '',
                    'shortName': '',
                    'liters': '30',
                    'sellPrice': '0',
                    'supplierPrice': '0',
                    'count': '',
                },
                errors: {},
            });

            NotificationActions.snackbar('Le type de fût ' + typeName + ' a bien été créé.');
            if(this.focusField) this.focusField.focus();
        })
        .catch((error) => {
            if(error.formErrors && Object.keys(error.formErrors).length) {
                this.setState({ errors: error.formErrors });
            }
            else {
                NotificationActions.error('Une erreur s\'est produite pendant la création du type de fût', error);
            }
        });
    }

    render() {
        return (
            <Dialog
                open={this.props.show}
                onRequestClose={this.props.close}
            >
                <DialogTitle>Création d'un type de fût</DialogTitle>
                <DialogContent>

                    Remplissez le formulaire ci-dessous pour créer un nouveau type de fût.


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
                                label="Prix fournisseur d'un fût (€)"
                                error={this.state.errors.supplierPrice != ''}
                                helperText={this.state.errors.supplierPrice}
                                value={this.state.values.supplierPrice}
                                fullWidth
                                onChange={e => this._handleFieldChange('supplierPrice', e.target.value)}
                            />
                            </Col>
                            <Col xs={12} sm={6}>
                                <TextField
                                    label="Prix de revente d'un fût (€)"
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
                                    label="Nombre de litres par fût"
                                    error={this.state.errors.liters != ''}
                                    helperText={this.state.errors.liters}
                                    value={this.state.values.liters}
                                    fullWidth
                                    onChange={e => this._handleFieldChange('liters', e.target.value)}
                                />
                            </Col>
                            <Col xs={12} sm={6}>
                                <TextField
                                    label="Nombre de fûts"
                                    error={this.state.errors.count != ''}
                                    helperText={this.state.errors.count}
                                    value={this.state.values.count}
                                    fullWidth
                                    onChange={e => this._handleFieldChange('count', e.target.value)}
                                />
                            </Col>
                        </Row>
                    </form>
                </DialogContent>
                <DialogActions>
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
                        Créer
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

}