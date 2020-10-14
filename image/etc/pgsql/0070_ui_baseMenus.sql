\o /dev/null
\set VERBOSITY terse
\c vino
SET client_min_messages=WARNING;

-- ===================================================================================================================

-- Default modules (moduleName, scriptDir)
-- select abacus_ui.uiStructureAddModule('user','user');
-- select abacus_ui.uiStructureAddModule('pageManipulation','util');
-- select abacus_ui.uiStructureAddModule('localStorage','util');

-- ===================================================================================================================


-- Insert the default home page
-- This home page will show a single acordian part which will have a button that removes it from the home page.
-- Just a sample default so that the UI doesn't look broken while we wait for some other module to add a home page.
-- Any module which provides a home page should remove this item in it's db script
-- select abacus_ui.uiAddHomePage('tasks', 'pageManipulation', 'admin', 'Tasks', 'lib/abacus/util/util.tasks.js', 'tasks.buildTaskHome', 't');

-- ===================================================================================================================

--     abacus_ui.uiStructureAddMenuItem(roleName, parentId, menuId, newTitle, newTarget,
--                                      newScript, newCommand,
--                                      newGenerator, newUrl,
--                                      newIcon, newOrdinal);

select abacus_ui.uiStructureAddMenuItem('user', null, 'control_menu', null, null, null, null, null, null, null, 0);

-- right side should have '<USERNAME> menu with user icon, with 'Account Settings' and 'Logout'
select abacus_ui.uiStructureAddMenuItem('user', 'control_menu', 'user_menu', 'user_menu', null,
                                        'lib/abacus/user/user.authentication.js', null,
                                        'userModule.addUserPanel()', null, null, 2);

select abacus_ui.uiStructureAddMenuItem('user', null, 'main_menu', null, null, null, null, null, null, null, 0);

select abacus_ui.uiStructureAddMenuItem('administrator,designer',    'main_menu', 'settings', 'Application Settings', null,
                                         null, null,
                                         null, null,
                                         'cog', 80);

--select abacus_ui.uiStructureAddMenuItem('admin', 'settings', 'user_mgt', 'User Management', null,
--                                        '/lib/abacus/user/user.management.js', 'userManagementModule.showUserManagement()',
--                                        null, null,
--                                        'user', 10);

--select abacus_ui.uiStructureAddMenuItem('admin', 'settings', 'whitelist_mgt', 'Whitelist Address Management', null,
--                                        '/lib/abacus/whitelist/whitelist.management.js', 'WhitelistAddressManagementModule.showWhitelistAddressManagement()',
--                                        null, null,
--                                        'user', 20);

select abacus_ui.uiStructureAddMenuItem('user', 'main_menu', 'help', 'Help', null,
                                        null, null,
                                        null, null,
                                        'question-sign',  90);

--select abacus_ui.uiStructureAddMenuItem('user', 'help', 'about', 'About', null,
--                                        '/lib/abacus/help/about/system/controller.js', 'abacus.About.controller.showModal()',
--                                        null, null,
--                                        'info-sign',  1);

--select abacus_ui.uiStructureAddMenuItem('user', 'help', 'swDetails', 'Installed Software Details', null,
--                                        '/lib/abacus/help/about/software/controller.js','abacus.Software.controller.showPanel()',
--                                        null, null,
--                                        'question-sign',  2);

select abacus_ui.uiStructureAddMenuItem('user', 'help', 'swDetailsNew', 'Installed Docker Containers Details', null,
                                        'lib/abacus/help/about/containers/controller.js','abacus.Containers.controller.showPanel()',
                                        null, null,
                                        'question-sign',  1);

select abacus_ui.uiStructureAddMenuItem('user', 'help', 'wshelp', 'Web Service Documentation', '_self',
                                        null, null,
                                        null, 'swagger',
                                        'resize-horizontal', 3);
