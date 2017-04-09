import React from 'react';

import BarrelService from '../../services/BarrelService';
import BarrelStore from '../../stores/BarrelStore';
import BarrelTypeStore from '../../stores/BarrelTypeStore';
import AuthStore from '../../stores/AuthStore';

import { Row, Col } from 'react-flexbox-grid';
import BarBarrel from './BarBarrel.jsx';

export default class BarBarrels extends React.Component {

    constructor() {
        super();

        this.state = {
            barrels: []
        };

        this.states = ["new", "opened", "empty"];

        // binding
        this._setBarrels = this._setBarrels.bind(this);
        this._backPreviousState = this._backPreviousState.bind(this);
        this._moveNextState = this._moveNextState.bind(this);
        this._updateBarrelState = this._updateBarrelState.bind(this);
    }

    componentDidMount() {
        // listen the stores changes
        BarrelStore.addChangeListener(this._setBarrels);
        BarrelTypeStore.addChangeListener(this._setBarrels);
        // init barrels list and barrelTypes list
        this._setBarrels();
    }

    componentWillUnmount() {
        // remove the stores listeners
        BarrelStore.removeChangeListener(this._setBarrels);
        BarrelTypeStore.removeChangeListener(this._setBarrels);
    }

    /**
     * If the barrel state is not the last state, call the method
     * to update the state of this barrel with the next state
     *
     * @param {object} barrel: the barrel to update
     */
    _moveNextState(barrel) {
        const currentState = this.states.indexOf(barrel.state);
        if (currentState < 2) {
            this._updateBarrelState(barrel, this.states[currentState + 1]);
        }
    }

    /**
     * If the barrel state is not the first state, call the method
     * to update the state of this barrel with the previous state
     *
     * @param {object} barrel: the barrel to update
     */
    _backPreviousState(barrel) {
        const currentState = this.states.indexOf(barrel.state);
        if (currentState > 0) {
            this._updateBarrelState(barrel, this.states[currentState - 1]);
        }
    }

    /**
     * Call the BarrelService to update the state of a barrel
     *
     * @param {object} barrel: the barrel to update
     * @param {string} newState: the new barrel state
     */
    _updateBarrelState(barrel, newState) {
        barrel.state = newState;
        BarrelService.updateBarrel(barrel.id, barrel, (error, result) => {
            if (error) {
                console.log("update barrel state error", error);
            }
        });
    }

    /**
     * Set the barrels in the store with the barrel of the user's team
     */
    _setBarrels() {
        // if the AuthStore.user attribute is not initialized yet, we don't know the user's team
        if (AuthStore.user && BarrelTypeStore.types) {
            const barrels = {
                "new": [],
                "opened": [],
                "empty": []
            };
            // put each barrel of the user's team in the matching state
            for (let barrel of BarrelStore.getTeamBarrels(AuthStore.user.team)) {
                barrels[barrel.state].push(barrel);
            }
            this.setState({ barrels });
        }
    }

    render() {
        // colors of the BarBarrel's avatars
        const colors = {
            new: "#00C853",
            opened: "#FF6D00",
            empty: "#DD2C00"
        };

        return (
            <Row className="hideContainer">
                <Col sm={4} className="hideContainer">
                    <h2>En stock</h2>
                    <div>
                        {
                            this.state.barrels.new && this.state.barrels.new.length
                                ?

                                    this.state.barrels.new.map((barrel, i) => {
                                        return  <BarBarrel
                                                    key={i}
                                                    barrel={barrel}
                                                    typeName={BarrelTypeStore.getBarrelName(barrel.type)}
                                                    color={colors.new}
                                                    moveNextState={this._moveNextState}
                                                />
                                    })

                                :
                                    "Aucun fût en stock."
                        }
                    </div>
                </Col>
                <Col sm={4} className="hideContainer">
                    <h2>Entamé</h2>
                    <div>
                        {
                            this.state.barrels.opened && this.state.barrels.opened.length
                                ?
                                    this.state.barrels.opened.map((barrel, i) => {
                                        return <BarBarrel
                                                    key={i}
                                                    barrel={barrel}
                                                    typeName={BarrelTypeStore.getBarrelName(barrel.type)}
                                                    color={colors.opened}
                                                    backPreviousState={this._backPreviousState}
                                                    moveNextState={this._moveNextState}
                                                />
                                    })
                                :
                                    "Aucun fût ouvert."
                        }
                    </div>
                </Col>
                <Col sm={4} className="hideContainer">
                    <h2>Terminé</h2>
                    <div>
                        {
                            this.state.barrels.empty && this.state.barrels.empty.length
                                ?
                                    this.state.barrels.empty.map((barrel, i) => {
                                        return <BarBarrel
                                                    key={i}
                                                    barrel={barrel}
                                                    typeName={BarrelTypeStore.getBarrelName(barrel.type)}
                                                    color={colors.empty}
                                                    backPreviousState={this._backPreviousState}
                                                />
                                    })
                                :
                                    "Aucun fût terminé."
                        }
                    </div>
                </Col>
            </Row>
        );
    }

}