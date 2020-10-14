/* globals pageModule*/
/* globals jsInclude*/
/* globals jQuery*/
/* globals AbacusSettingsController*/
/* exported settingsManagementModule */

'use strict';

const SettingsManagementModule = function()
{
   this.showSettingsManagement = function()
   {
      pageModule.buildPage(
         'settingsMgtPanel', 'Settings Management',
         'abacus-settings-server/lib/abacus/settingsManagement/Help.html'
      );
      jQuery.when(jsInclude('abacus-settings-server/lib/abacus/settingsManagement/Controller.js')).done(function()
      {
         const SettingsController = new AbacusSettingsController('settingsMgtPanel-bdy');
         SettingsController.renderPanel();
      });
   };
};

window.settingsManagementModule = new SettingsManagementModule();
