/* globals jQuery*/
/* globals AbacusSettingsManagementModel*/
/* globals AbacusSettingsManagementView*/
/* globals AbstractController*/
/* exported AbacusSettingsController */

'use strict';

window.AbacusSettingsController = function(baseId)
{
   const jsFiles = [];
   jsFiles.push('abacus-settings-server/lib/abacus/data/Scalar.js');
   jsFiles.push('abacus-settings-server/lib/abacus/data/ScalarList.js');
   jsFiles.push('abacus-settings-server/lib/abacus/data/SettingsGroup.js');
   jsFiles.push('abacus-settings-server/lib/abacus/settingsManagement/Model.js');
   jsFiles.push('abacus-settings-server/lib/abacus/settingsManagement/View.js');
   this.renderPanel = function()
   {
      const uiBase = this.baseId;
      const outer = this;
      jQuery.when(outer.loadJs(jsFiles)).done(function()
      {
         outer.model = new AbacusSettingsManagementModel(outer);
         outer.view = new AbacusSettingsManagementView(outer, uiBase);
         jQuery.when(outer.model.getSettingsGroups()).done(function(data)
         {
            outer.view.showView(data);
         });
      });
   };


   this.ctor = function(theBaseId)
   {
      this.baseId = theBaseId;
      return jQuery.extend(this, new AbstractController());
   };


   this.showError = function(msg)
   {
      this.view.showError(baseId, msg);
   };


   this.showSuccess = function(msg)
   {
      this.view.showSuccess(baseId, msg);
   };

   return this.ctor(baseId);
};
