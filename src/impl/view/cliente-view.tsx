import React from 'react';
import ViewController from 'src/core/view/view-controller';
import Cliente from '../model/cliente';

export default class ClienteView extends ViewController<Cliente> {

    render() {
        return (
            <div>
                <h1>CLIENTES</h1>
            </div>
        );
    }

}