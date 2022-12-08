import Serializable from "../model/serializable";

/**
 * Tipos de filtro.
 */
export const FilterTypes = {
    EQUALS: "EQUALS",
    NOT_EQUALS: "NOT_EQUALS",
    LIKE: "LIKE",
    NOT_LIKE: "NOT_LIKE",
    IN: "IN",
    NOT_IN: "NOT_IN",
    LESS_THAN: "LESS_THAN",
    LESS_THAN_OR_EQUALS: "LESS_THAN_OR_EQUALS",
    GREATER_THAN: "GREATER_THAN",
    GREATER_THAN_OR_EQUALS: "GREATER_THAN_OR_EQUALS",
    BETWEEN: "BETWEEN",
    STARTS_WITH: "STARTS_WITH",
    ENDS_WITH: "ENDS_WITH",
}

/**
 * Tipos de operadores.
 */
export const OperatorTypes = {
    AND: "AND",
    OR: "OR"
}

/**
 * Tipos de OrderBy.
 */
export const OrderByTypes = {
    ASC: "ASC",
    DESC: "DESC"
}

/**
 * Tipos de joins.
 */
export const JoinTypes = {
    INNER_JOIN: "INNER_JOIN",
    LEFT_JOIN: "LEFT_JOIN",
    RIGHT_JOIN: "RIGHT_JOIN"
}

/**
 * Funciones de agregado en SQL.
 */
export const AggregateFunctionTypes = {
    COUNT: "COUNT",
    MIN: "MIN",
    MAX: "MAX",
    SUM: "SUM",
    AVG: "AVG"
}

/**
 * Cláusula de filtrado para consultas contra la API.
 */
export class FilterClause extends Serializable {

    /**
     * Nombre del campo.
     */
    field_name: string;
    /**
     * Alias de la tabla.
     */
    table_alias: string | null;
    /**
     * Tipo de filtro.
     */
    filter_type: string;
    /**
     * Tipo de operador.
     */
    operator_type: string | null;
    /**
     * Objeto a comparar.
     */
    object_to_compare: any;
    /**
     * Filtros relacionados (paréntesis en la consulta SQL).
     */
    related_filter_clauses: Array<FilterClause> | null;

    // Constructor.
    constructor(field_name: string, filter_type: string, object_to_compare: any, table_alias: string | null = null, operator_type: string | null = null,
        related_filter_clauses: Array<FilterClause> | null = null) {
        super();
        this.field_name = field_name;
        this.filter_type = filter_type;
        this.object_to_compare = object_to_compare;
        this.table_alias = table_alias;
        this.operator_type = operator_type == null ? OperatorTypes.AND : operator_type;
        this.related_filter_clauses = related_filter_clauses;
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns FilterClause
     */
    public static fromJSON(serialized: string): FilterClause {
        const object_clause: ReturnType<FilterClause["toObject"]> = JSON.parse(serialized);
        const clause_ = object_clause as FilterClause;

        return new FilterClause(
            clause_.field_name,
            clause_.filter_type,
            clause_.object_to_compare,
            clause_.table_alias,
            clause_.operator_type,
            clause_.related_filter_clauses
        )
    }

}

/**
 * Cláusula de order by.
 */
export class OrderByClause extends Serializable {

    field_name: string;
    order_by_type: string;

    // Constructor.
    constructor(field_name: string, order_by_type: string) {
        super();
        /**
        * Nombre del campo.
        */
        this.field_name = field_name;
        /**
         * Tipo de orderby.
         */
        this.order_by_type = order_by_type;
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns OrderByClause
     */
    public static fromJSON(serialized: string): OrderByClause {
        const object_clause: ReturnType<JoinClause["toObject"]> = JSON.parse(serialized);
        const clause_ = object_clause as OrderByClause;

        return new OrderByClause(
            clause_.field_name,
            clause_.order_by_type
        )
    }

}

/**
 * Cláusula de join.
 */
export class JoinClause extends Serializable {

    field_name: string;
    join_type: string;
    is_join_with_fetch: boolean;

    // Constructor.
    constructor(field_name: string, join_type: string, is_join_with_fetch: boolean = false) {
        super();
        /**
        * Nombre de la tabla.
        */
        this.field_name = field_name;
        /**
         * Tipo de join.
         */
        this.join_type = join_type;
        /**
         * Join con fetch (traer la entidad al completo).
         */
        this.is_join_with_fetch = is_join_with_fetch;
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns JoinClause
     */
    public static fromJSON(serialized: string): JoinClause {
        const object_clause: ReturnType<JoinClause["toObject"]> = JSON.parse(serialized);
        const clause_ = object_clause as JoinClause;

        return new JoinClause(
            clause_.field_name,
            clause_.join_type,
            clause_.is_join_with_fetch
        )
    }

}

/**
 * Cláusula de group by.
 */
export class GroupByClause extends Serializable {

    field_name: string;

    // Constructor.
    constructor(field_name: string) {
        super();
        /**
        * Nombre del campo.
        */
        this.field_name = field_name;
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns GroupByClause
     */
    public static fromJSON(serialized: string): GroupByClause {
        const object_clause: ReturnType<GroupByClause["toObject"]> = JSON.parse(serialized);
        const clause_ = object_clause as GroupByClause;

        return new GroupByClause(
            clause_.field_name
        )
    }

}

/**
 * Cláusula de select.
 */
export class FieldClause extends Serializable {

    /**
    * Nombre del campo.
    */
    field_name: string;
    /**
     * Incluir distinct.
     */
    is_select_distinct: boolean;
    /**
     * Tipo de función de agregado.
     */
    aggregate_function: string | null;
    /**
     * Alias del campo.
     */
    field_label: string | null;

    // Constructor.
    constructor(field_name: string, aggregate_function: string | null = null, is_select_distinct: boolean = false, field_label: string | null = null) {
        super();
        this.field_name = field_name;
        this.aggregate_function = aggregate_function;
        this.is_select_distinct = is_select_distinct;
        this.field_label = field_label;
    }

    /**
     * Deserializa un objeto json.
     * 
     * @param serialized 
     * @returns FieldClause
     */
    public static fromJSON(serialized: string): FieldClause {
        const object_clause: ReturnType<FieldClause["toObject"]> = JSON.parse(serialized);
        const clause_ = object_clause as FieldClause;

        return new FieldClause(
            clause_.field_name,
            clause_.aggregate_function,
            clause_.is_select_distinct,
            clause_.field_label
        )
    }

}