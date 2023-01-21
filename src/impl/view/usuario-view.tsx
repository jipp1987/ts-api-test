import DataTableHeader from '../../core/view/table-header';
import { FieldClause } from '../../core/utils/dao-utils';
import { ViewStates, ViewValidators } from '../../core/utils/helper-utils';
import ViewController from '../../core/view/view-controller';
import { ICoreControllerProps, ICoreControllerState } from '../../core/view/core-controller';
import Usuario from '../model/usuario';

import InputText from '../../core/components/input-text';
import { FormattedMessage } from "react-intl";
import { toast } from 'react-hot-toast';

/**
 * Interfaz de estado para poder añadir estados propios al controlador a mayores de los de CoreController.
 */
interface IUsuarioViewState extends ICoreControllerState {

}

/**
 * @class Controlador de mantenimiento de clientes.
 */
export default class UsuarioView extends ViewController<Usuario, IUsuarioViewState> {

    /**
     * Crea una instancia del controlador de vista.
     * 
     * @param {props} 
     */
    constructor(props: ICoreControllerProps) {
        super(props);

        /**
         * Clase de la entidad principal.
         */
        this.entity_class = Usuario;

        /**
         * Nombre de la clase.
         */
        this.table_name = "Usuario";

        /**
         * Título de la vista.
         */
        this.view_title = "i18n_usuarios_title";

        /**
         * Nombre del campo id.
         */
        this.id_field_name = this.entity_class.getIdFieldName();

        /**
             * Campos para la SELECT.
             */
        this.fields = [
            new FieldClause("id", null),
            new FieldClause("username", null),
        ];

        /**
         * Array de objetos HeaderHelper para modelar las cabeceras.
         */
        this.headers = [
            new DataTableHeader(0, 'username', 'i18n_usuarios_username', '100px', null),
        ];

        // Establecer estado para atributos de lectura/escritura.
        this.state = {
            items: [],
            viewState: ViewStates.LIST,
            modalList: []
        };
    }

    /**
    * Sobrescritura. Prepara una nueva instancia del elemento seleccionado para la creación.
    */
    prepareCreate() {
        this.selectedItem = new Usuario();
        this.selectedItem.repeatPassword = null;
    }

    /**
     * Comprueba si los passwords coinciden.
     * 
     * @returns boolean 
     */
    doesPasswordMatch = (): boolean => {
        if (this.selectedItem !== undefined && this.selectedItem !== null
            && this.selectedItem.password !== undefined && this.selectedItem.password !== null
            && this.selectedItem.repeatPassword !== undefined && this.selectedItem.repeatPassword !== null) {
                // Comprueba si coinciden los passwords.
                if (this.selectedItem.password !== this.selectedItem.repeatPassword) {
                    toast.error(<FormattedMessage id="i18n_usuarios_password_not_match" />);
                    return false;
                }
        }

        return true;
    }

    /**
     * Sobrescritura método saveChanges.
     * 
     * @param {event} e Evento de javascript. 
     */
    saveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Comprobar que coinciden los passwords antes de guardar la entidad.
        if (this.doesPasswordMatch()) {
            return super.saveChanges(e);
        }
    }

    /**
     * Implementación de renderizado de formulario de edición y detalle. Pensado para implementar.
     * 
     * @returns Componente visual de formulario de edición/detalle.
     */
    renderDetailEditForm(isInDetailMode: boolean = false) {
        // El campo de password que sea visible sólo durante la creación.
        const passwordField = this.doesSelectedEntityHaveId() ? null :
            <>
                <InputText
                    id={this.id + "_password"}
                    entity={this.selectedItem}
                    valueName="password"
                    isPassword={true}
                    label={<FormattedMessage id="i18n_usuarios_password" />}
                    maxLength={60}
                    isEditing={!isInDetailMode}
                    isRequired={true}
                    validation={() => this.doesPasswordMatch()} />

                <InputText
                    id={this.id + "_repeatPassword"}
                    entity={this.selectedItem}
                    valueName="repeatPassword"
                    isPassword={true}
                    label={<FormattedMessage id="i18n_usuarios_repeatPassword" />}
                    maxLength={60}
                    isEditing={!isInDetailMode}
                    isRequired={true}
                    validation={() => this.doesPasswordMatch()} />
            </>;

        return (
            <div>
                <fieldset style={{ float: "left" }}>

                    <legend className='form-card-legend'><FormattedMessage id="i18n_mainInfo_title" /></legend>

                    <InputText
                        id={this.id + "_username"}
                        entity={this.selectedItem}
                        valueName="username"
                        label={<FormattedMessage id="i18n_usuarios_username" />}
                        maxLength={50}
                        isEditing={!isInDetailMode}
                        isRequired={true}
                        validation={() => this.validateField(this.selectedItem, "username", [ViewValidators.CODE_VALIDATOR])} />

                    {passwordField}
                </fieldset>
            </div>
        );
    }

}