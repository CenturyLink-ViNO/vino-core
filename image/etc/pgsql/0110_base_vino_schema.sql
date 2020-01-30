\o /dev/null
\c vino
\set VERBOSITY terse
set client_min_messages=WARNING;

select createSchema('vino');

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'SERVICE_REGISTRATION';
      schemaName := 'vino';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            CREATE TABLE IF NOT EXISTS vino.SERVICE_REGISTRATION (
               ID VARCHAR NOT NULL,
               NAME VARCHAR NOT NULL,
               DESCRIPTION TEXT NOT NULL,
               ENTRY_NODE_ID TEXT NOT NULL,
               PRIMARY KEY (id)
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
            raise info '%.% table at version [%.%.%.%]', schemaName, tableName, version.major, version.minor, version.fix, version.build;
      end case;
   end
$$;