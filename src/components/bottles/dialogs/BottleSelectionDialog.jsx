import React from 'react';

import Dialog from 'components/partials/ResponsiveDialog.jsx';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import { Row, Col } from 'react-flexbox-grid';

import BottleTypeService from 'services/BottleTypeService';
import NotificationActions from 'actions/NotificationActions';
import Confirm from 'components/partials/Confirm.jsx';


/**
 * @param {BottleType} type
 * @param {integer} count Current number of bottles available
 */
export default class BottleSelectionDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            type: props.type,
            count: props.count || 0,
            values: {
                'box': parseInt(props.selected / props.type.quantityPerBox) || 0,
                'bottle': (props.selected % props.type.quantityPerBox) || 0,
            },
            errors: {},
        };

        this.focus();

        // binding
        this._handleFieldChange = this._handleFieldChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
        this.focus = this.focus.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            type: props.type,
            count: props.count || 0,
            values: {
                'box': parseInt(props.selected / props.type.quantityPerBox) || 0,
                'bottle': (props.selected % props.type.quantityPerBox) || 0,
            },
            errors: {},
        });

        this.focus();
    }


    /**
     * Called on field change
     *
     * @param  {string} field Field name
     * @param  {string} value New value
     */
    _handleFieldChange(field, value) {
        let values = this.state.values;
        // Save new field value
        values[field] = value;

        // Integer number testing
        if(field === 'box' || field === 'bottle') {
            values[field] = values[field].replace(/[^0-9]/, '');

            if(values['box'] > parseInt(this.state.count / this.state.type.quantityPerBox)) {
                values['box'] = parseInt(this.state.count / this.state.type.quantityPerBox);
                values['bottle'] = parseInt(this.state.count % this.state.type.quantityPerBox);
            }
            if(values['bottle'] > this.state.count - (values['box'] * this.state.type.quantityPerBox)) {
                values['bottle'] =  this.state.count - (values['box'] * this.state.type.quantityPerBox);
            }
        }

        this.setState({
            values: values,
            errors: {},
        });
    }

    /**
     * Call the BottleType Service to update BottleType
     *
     * @param {Event} e Event like form submit that will be stopped
     */
    _handleSubmit(e) {
        if(e) {
            e.preventDefault();
        }

        if(this.props.submit) {

            let box = parseInt(this.state.values.box || 0);
            let bottle = parseInt(this.state.values.bottle || 0);
            let quantityPerBox = parseInt(this.state.type.quantityPerBox || 1);

            let selected = box * quantityPerBox + bottle;

            this.props.submit(selected);
        }

    }

    focus() {
        if(this.focusField) {
            if(this.focusField.input && this.focusField.input.setSelectionRange) {
                this.focusField.input.setSelectionRange(0, this.focusField.input.value.length)
            }
            else {
                this.focusField.focus();
            }
        }
    }


    render() {

        const actions = [
            <FlatButton
                label="Désélectionner"
                secondary={true}
                onTouchTap={() => (this.props.submit && this.props.submit(0))}
                className="Dialog__DeleteButon"
            />,
            <FlatButton
                label="Annuler"
                secondary={true}
                onTouchTap={this.props.close}
            />,
            <FlatButton
                label="Sélectionner"
                primary={true}
                type="submit"
                onTouchTap={this._handleSubmit}
            />,
        ];

        return (

            <Dialog
                title={'Sélection de ' + (this.state.values.byBottle?'bouteilles':'cartons') + ' : ' + this.state.type.name}
                open={this.props.show}
                actions={actions}
                onRequestClose={this.props.close}
            >

                <form onSubmit={this._handleSubmit}>
                    <button type="submit" style={{display:'none'}}>Hidden submit button, necessary for form submit</button>
                    Selectionner
                    <TextField
                        name="box"
                        errorText={this.state.errors.box}
                        maxLength="3"
                        value={this.state.values.box}
                        onChange={e => this._handleFieldChange('box', e.target.value)}
                        autoFocus={true}
                        ref={(field) => { this.focusField = field; }}
                        style={{width: '40px', display: 'inline-block', verticalAlign: 'middle', margin: '0 3px'}}
                        inputStyle={{textAlign: 'center'}}
                        /> carton{(this.state.values.box > 1 ? 's' : '')} et
                    <TextField
                        name="bottle"
                        errorText={this.state.errors.bottle}
                        maxLength="3"
                        value={this.state.values.bottle}
                        onChange={e => this._handleFieldChange('bottle', e.target.value)}
                        style={{width: '40px', display: 'inline-block', verticalAlign: 'middle', margin: '0 3px'}}
                        inputStyle={{textAlign: 'center'}}
                        /> bouteille{(this.state.values.bottle > 1 ? 's ' : ' ')}
                        de <strong>{this.state.type.name}</strong> (<strong>{this.state.type.shortName}</strong>).
                </form>
            </Dialog>
        );
    }

}
