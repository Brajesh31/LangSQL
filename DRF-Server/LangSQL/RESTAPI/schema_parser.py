import json

def convert_schema_to_model_format(db_metadata):
    """
    Converts database metadata into a structured format for the LLM.
    Explicitly includes primary keys and foreign keys.
    """
    tables = db_metadata.get("data", {}).get("tables", [])
    schema_parts = []
    
    for table in tables:
        table_name = table["name"]
        columns = table.get("columns", [])
        
        column_definitions = []
        primary_keys = []
        foreign_keys = []

        for column in columns:
            col_name = column["name"]
            col_type = column["type"]
            column_definitions.append(f'"{col_name}" {col_type}')

            # Extract primary key (if explicitly mentioned in schema)
            if column.get("is_primary", False):  
                primary_keys.append(f'"{col_name}"')

        # Extract foreign keys (if defined)
        for fk in table.get("foreign_keys", []):  # Assuming foreign keys are stored in table['foreign_keys']
            fk_column = fk["column"]
            ref_table = fk["references"]["table"]
            ref_column = fk["references"]["column"]
            foreign_keys.append(f'"{fk_column}" REFERENCES "{ref_table}"("{ref_column}")')

        # Format table definition
        schema_part = f'"{table_name}" ' + " , ".join(column_definitions)
        if primary_keys:
            schema_part += f' , PRIMARY KEY: {" , ".join(primary_keys)}'
        if foreign_keys:
            schema_part += f' , FOREIGN KEY: {" , ".join(foreign_keys)}'

        schema_parts.append(schema_part + " [SEP]")
    return " ".join(schema_parts)

def convert_mongo_type(mongo_type):
    """
    Converts MongoDB column types to SQL-like types.
    """
    type_mapping = {
        "int": "integer",
        "varchar(3)": "character varying",
        "varchar(50)": "character varying",
        "varchar(30)": "character varying",
        "varchar(1)": "character varying",
        "datetime": "timestamp without time zone"
    }
    return type_mapping.get(mongo_type, mongo_type)


def convert_mongo_metadata_to_json(metadata):
    """
    Converts MongoDB metadata to the required JSON schema format.
    """
    formatted_data = {
        "db_name": metadata.get("db_name", ""),
        "tables": []
    }

    for table in metadata.get("tables", []):
        formatted_table = {
            "name": table.get("name", ""),
            "columns": []
        }

        for column in table.get("columns", []):
            formatted_column = {
                "name": column.get("name", ""),
                "type": convert_mongo_type(column.get("type", "")),
                "nullable": column.get("nullable", False),
                "unique": column.get("unique", False),
                "indexed": column.get("indexed", False),
                "description": column.get("description", "Column of unknown type")
            }
            formatted_table["columns"].append(formatted_column)

        formatted_data["tables"].append(formatted_table)

    return formatted_data