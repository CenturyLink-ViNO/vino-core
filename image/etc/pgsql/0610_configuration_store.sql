\o /dev/null
\c vino
\set VERBOSITY terse
set client_min_messages=WARNING;

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'SERVICE_ACTIVATION';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.SERVICE_ACTIVATION (
               ID VARCHAR NOT NULL,
               REFERENCE_ID VARCHAR NOT NULL,
               NAME VARCHAR NOT NULL,
               DESCRIPTION VARCHAR NOT NULL,
               VISIBLE BOOLEAN NOT NULL DEFAULT true,
               START_TIME BIGINT NOT NULL,
               CUSTOMER_NAME VARCHAR NOT NULL,
               NOTES VARCHAR,
               SETTINGS_ROOT_GROUP VARCHAR,
               INPUT_TEMPLATE JSONB,
               MSG JSONB,
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,3);
         when 1 then
            case version.minor
               when 0 then
                  case version.fix
                     when 0 then
                        case version.build
                           when 0 then
                              ALTER TABLE vino.SERVICE_ACTIVATION ADD COLUMN REFERENCE_ID VARCHAR(255) NOT NULL DEFAULT 'UNKNOWN';
                              perform abacus.tableVersion(schemaName, tableName, 1,0,0,1);
                           when 1 then
                              ALTER TABLE vino.SERVICE_ACTIVATION ADD COLUMN INPUT_TEMPLATE JSONB;
                              perform abacus.tableVersion(schemaName, tableName, 1,0,0,2);
                           when 2 then
                              ALTER TABLE vino.SERVICE_ACTIVATION ADD COLUMN VISIBLE BOOLEAN NOT NULL DEFAULT true;
                              perform abacus.tableVersion(schemaName, tableName, 1,0,0,3);
                           else
                              raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
                        end case;
                     else
                        raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
                  end case;
               else
                  raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
            end case;
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'SERVICE_ACTIVATION_STEP_WRAPPER';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.SERVICE_ACTIVATION_STEP_WRAPPER (
               ID UUID NOT NULL default uuid_generate_v4(),
               NODE_ID VARCHAR NOT NULL,
               SERVICE_ACTIVATION_ID VARCHAR REFERENCES vino.SERVICE_ACTIVATION (ID),
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'SERVICE_ACTIVATION_STEPS';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.SERVICE_ACTIVATION_STEPS (
               ID UUID NOT NULL default uuid_generate_v4(),
               NAME VARCHAR NOT NULL,
               DESCRIPTION VARCHAR NOT NULL,
               NODE_ID VARCHAR NOT NULL,
               ITERATION_COUNT INT NOT NULL,
               ACTIVATION_TIME BIGINT NOT NULL,
               STEP_WRAPPER_ID UUID REFERENCES vino.SERVICE_ACTIVATION_STEP_WRAPPER (ID),
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'INPUT_PARAMETER_DETAILS';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.INPUT_PARAMETER_DETAILS (
               ID UUID NOT NULL default uuid_generate_v4(),
               FROM_CONSTANTS BOOLEAN NOT NULL DEFAULT 'f',
               CONSTANTS_PATH TEXT,
               IS_OPTIONAL BOOLEAN NOT NULL DEFAULT 'f',
               IS_FINAL BOOLEAN NOT NULL DEFAULT 'f',
               OPTIONS TEXT,
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;

CREATE TYPE vino.output_parameter_details_type_enum AS ENUM('REGEX', 'XPATH', 'JSONPATH', 'CUSTOM');

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'OUTPUT_PARAMETER_DETAILS';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.OUTPUT_PARAMETER_DETAILS (
               ID UUID NOT NULL default uuid_generate_v4(),
               TYPE vino.output_parameter_details_type_enum NOT NULL,
               FORMAT VARCHAR NOT NULL,
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;

CREATE TYPE vino.parameter_type_enum AS ENUM('string', 'number', 'boolean', 'json', 'encodedString', 'enumerated', 'stringList', 'numberList', 'booleanList');

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'PARAMETER';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.PARAMETER (
               ID UUID NOT NULL default uuid_generate_v4(),
               NAME VARCHAR NOT NULL,
               KEY VARCHAR NOT NULL,
               ENCRYPT BOOLEAN NOT NULL DEFAULT 'f',
               DESCRIPTION VARCHAR NOT NULL,
               TYPE vino.parameter_type_enum NOT NULL,
               STRING_VALUE VARCHAR,
               BOOL_VALUE BOOLEAN,
               NUMBER_VALUE DOUBLE PRECISION,
               ENCODED_STRING_VALUE VARCHAR,
               ENUMERATED_STRING_VALUE VARCHAR,
               STRING_LIST_VALUE TEXT,
               NUMBER_LIST_VALUE TEXT,
               BOOLEAN_LIST_VALUE TEXT,
               JSON_VALUE TEXT,
               OUTPUT_DETAILS_ID UUID REFERENCES vino.OUTPUT_PARAMETER_DETAILS (ID),
               INPUT_DETAILS_ID UUID REFERENCES vino.INPUT_PARAMETER_DETAILS (ID),
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;


do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'SERVICE_ACTIVATION_STEP_INPUT_PARAMETERS';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.SERVICE_ACTIVATION_STEP_INPUT_PARAMETERS (
               PARAMETER_ID UUID NOT NULL REFERENCES vino.PARAMETER (ID),
               SERVICE_ACTIVATION_STEP_ID UUID NOT NULL REFERENCES vino.SERVICE_ACTIVATION_STEPS (ID),
               PRIMARY KEY (SERVICE_ACTIVATION_STEP_ID, PARAMETER_ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'SERVICE_ACTIVATION_STEP_OUTPUT_PARAMETERS';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.SERVICE_ACTIVATION_STEP_OUTPUT_PARAMETERS (
               PARAMETER_ID UUID NOT NULL REFERENCES vino.PARAMETER (ID),
               SERVICE_ACTIVATION_STEP_ID UUID NOT NULL REFERENCES vino.SERVICE_ACTIVATION_STEPS (ID),
               PRIMARY KEY (SERVICE_ACTIVATION_STEP_ID, PARAMETER_ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'SERVICE_STATUS';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.SERVICE_STATUS (
               ID UUID NOT NULL default uuid_generate_v4(),
               STATUS VARCHAR NOT NULL,
               TIME BIGINT NOT NULL,
               MESSAGE TEXT NOT NULL,
               STATUS_INDEX INT NOT NULL,
               SERVICE_ACTIVATION_ID VARCHAR NOT NULL REFERENCES vino.SERVICE_ACTIVATION(ID),
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;
