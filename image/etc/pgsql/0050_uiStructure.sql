\o /dev/null
\c vino
\set VERBOSITY terse
set client_min_messages=WARNING;

-- ===================================================================================================================

select createSchema('abacus_ui');

do $$
   declare version abacus.version_information;
   declare schemaName text;
   declare tableName text;
   begin
      tableName := 'menu_items';
      schemaName := 'abacus_ui';
      version := abacus.tableVersion(schemaName, tableName);
      case version.major
         when -1 then
            create table abacus_ui.menu_items
            (
               allowed_role varchar not null,
               parent_id varchar,
               id varchar primary key,
               title varchar,
               target varchar default('_self'),
               script varchar,
               command varchar,
               generator varchar,
               url varchar,
               glyphicon varchar,
               ordinal int
            );
            perform abacus.initializeTable(schemaName, tableName, 1,0,0,0);
         else
           raise info '%.% table at version [%] present, no upgrade needed', schemaName, tableName, version.major;
      end case;
   end
$$;

create or replace function abacus_ui.uiStructureAddMenuItem(roleName text,
                                                            parentId text,
                                                            menuId text,
                                                            newTitle text,
                                                            newTarget text,
                                                            newScript text,
                                                            newCommand text,
                                                            newGenerator text,
                                                            newUrl text,
                                                            newIcon text,
                                                            newOrdinal int default 0) returns void as $$
   begin
      if ( newIcon = null )
      then
      else
         newTitle = '&nbsp;' || newTitle;
      end if;

      if exists(select * from abacus_ui.menu_items where id = menuId )
      then
         update abacus_ui.menu_items
            set
               allowed_role = roleName,
               parent_id = parentId,
               title = newTitle,
               target = newTarget,
               script = newScript,
               command = newCommand,
               generator = newGenerator,
               url = newUrl,
               glyphicon = newIcon,
               ordinal = newOrdinal
            where id = menuId;
      else
         insert into abacus_ui.menu_items(allowed_role,
                                          parent_id,
                                          id,
                                          title,
                                          target,
                                          script,
                                          command,
                                          generator,
                                          url,
                                          glyphicon,
                                          ordinal)
            values (roleName, parentId, menuId, newTitle, newTarget, newScript, newCommand, newGenerator, newUrl, newIcon, newOrdinal);
      end if;
   end;
$$ language plpgsql;

