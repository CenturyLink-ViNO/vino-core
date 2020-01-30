\o /dev/null
\set VERBOSITY terse
\c vino
SET client_min_messages=WARNING;

--     vino_ui.uiStructureAddMenuItem(roleName, parentId, menuId, title, target,
--                                      script, command,
--                                      generator, url,
--                                      icon, ordinal);

select abacus_ui.uiStructureAddMenuItem('user', 'main_menu', 'main', 'Main', '_self',
                                        null, null,
                                        null, '/',
                                        'home', 1);

select abacus_ui.uiStructureAddMenuItem('designer', 'main_menu', 'designer', 'Service Manager', '_self',
                                        null, null,
                                        null, '/service-manager',
                                       'pencil', 2);

select abacus_ui.uiStructureAddMenuItem('provisioner,designer', 'main_menu', 'generic_services', 'Activate a Service', null,
                                        '/vino/serviceActivation/Controller.js', 'serviceActivationController.showActivationPage()',
                                        null, null,
                                        'resize-horizontal', 3);


select abacus_ui.uiStructureAddMenuItem('administrator,designer', 'settings', 'settings_mgt', 'Settings Management', null,
                                        '/abacus-settings-server/lib/abacus/settingsManagement/SettingsManagement.js', 'settingsManagementModule.showSettingsManagement()',
                                        null, null,
                                        'th-list', 40);

select abacus_ui.uiStructureAddMenuItem('administrator', 'settings', 'user_mgt', 'User Management', null,
                                        null, null,
                                        null, '/auth',
                                        'user', 45);

-- select abacus_ui.uiStructureAddMenuItem('admin', 'settings', 'controlpod_mgt', 'Control Pod Management', null,
--                                         '/vino/ControlPods/Controller.js', 'controlPodsController.render()',
--                                         null, null,
--                                         'tasks', 4);

-- select abacus_ui.uiStructureAddMenuItem('admin', 'settings', 'nfvipod_mgt', 'NFVI Pod Management', null,
--                                         '/vino/NFVIPods/Controller.js', 'nfviPodsController.render()',
--                                         null, null,
--                                         'tasks', 5);
