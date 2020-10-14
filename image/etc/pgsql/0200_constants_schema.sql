\o /dev/null
\c vino
\set VERBOSITY terse
set client_min_messages=WARNING;

select createSchema('abacus_settings');

DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'ROOT_GROUP';
      schemaName := 'abacus_settings';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS abacus_settings.ROOT_GROUP
            (
               ID UUID NOT NULL default uuid_generate_v4(),
               NAME VARCHAR NOT NULL,
               DISPLAY_NAME VARCHAR NOT NULL DEFAULT '',
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
      tableName := 'SETTINGS_GROUP';
      schemaName := 'abacus_settings';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS abacus_settings.SETTINGS_GROUP (
               ID UUID NOT NULL default uuid_generate_v4(),
               NAME VARCHAR NOT NULL,
               DISPLAY_NAME VARCHAR NOT NULL DEFAULT '',
               IS_DEFAULT BOOLEAN NOT NULL DEFAULT FALSE,
               DEFAULT_FOR UUID REFERENCES abacus_settings.ROOT_GROUP (ID) ON DELETE CASCADE,
               ROOT_GROUP_ID UUID REFERENCES abacus_settings.ROOT_GROUP (ID) ON DELETE CASCADE,
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
      tableName := 'SCALAR_LIST';
      schemaName := 'abacus_settings';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS abacus_settings.SCALAR_LIST (
               ID UUID NOT NULL default uuid_generate_v4(),
               NAME VARCHAR NOT NULL,
               DISPLAY_NAME VARCHAR NOT NULL DEFAULT '',
               IS_DEFAULT BOOLEAN DEFAULT FALSE,
               PARENT_GROUP_ID UUID REFERENCES abacus_settings.SETTINGS_GROUP (id) ON DELETE CASCADE,
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;

CREATE TYPE abacus_settings.scalar_type_enum AS ENUM('string', 'number', 'bool');
do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'SCALAR';
      schemaName := 'abacus_settings';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS abacus_settings.SCALAR (
               ID UUID NOT NULL default uuid_generate_v4(),
               NAME VARCHAR NOT NULL,
               DISPLAY_NAME VARCHAR NOT NULL DEFAULT '',
               VALUE VARCHAR NOT NULL,
               REQUIRED BOOLEAN NOT NULL DEFAULT FALSE,
               ENCRYPT BOOLEAN NOT NULL DEFAULT FALSE,
               IS_DEFAULT BOOLEAN NOT NULL DEFAULT FALSE,
               TYPE abacus_settings.scalar_type_enum NOT NULL,
               PARENT_GROUP_ID UUID REFERENCES abacus_settings.SETTINGS_GROUP (id) ON DELETE CASCADE,
               SCALAR_LIST_ID UUID REFERENCES abacus_settings.SCALAR_LIST (id) ON DELETE CASCADE,
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         when 1 then
            case version.minor
               when 0 then
                  case version.fix
                     when 0 then
                           ALTER TABLE abacus_settings.SCALAR ADD COLUMN ENCRYPT BOOLEAN NOT NULL DEFAULT FALSE;
                           perform abacus.tableVersion(schemaName, tableName, 1,0,1,0);
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
      tableName := 'SETTINGS_GROUP_TO_SETTINGS_GROUP';
      schemaName := 'abacus_settings';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS abacus_settings.SETTINGS_GROUP_TO_SETTINGS_GROUP (
               PARENT_ID UUID NOT NULL REFERENCES abacus_settings.SETTINGS_GROUP (id) ON DELETE CASCADE,
               CHILD_ID UUID NOT NULL REFERENCES abacus_settings.SETTINGS_GROUP (id) ON DELETE CASCADE,
               PRIMARY KEY (PARENT_ID, CHILD_ID)
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
      tableName := 'SYSTEM_SETTING';
      schemaName := 'abacus_settings';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS abacus_settings.SYSTEM_SETTING (
               ID UUID NOT NULL default uuid_generate_v4(),
               NAME VARCHAR NOT NULL,
               KEY VARCHAR NOT NULL,
               VALUE VARCHAR NOT NULL,
               PRIMARY KEY (ID)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;
