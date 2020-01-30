/* globals jQuery*/
/* globals SettingsGroup*/
/* globals AbstractModel*/
/* exported AbacusSettingsManagementModel */

'use strict';

window.AbacusSettingsManagementModel = function(controller)
{
   const outer = this;

   this.parseSettingsGroups = function(json)
   {
      const settingsGroups = [];
      if (json !== undefined && Array.isArray(json))
      {
         let jsonIndex;
         for (jsonIndex = 0; jsonIndex < json.length; jsonIndex = jsonIndex + 1)
         {
            settingsGroups.push(new SettingsGroup(json[jsonIndex]));
         }
      }
      return settingsGroups;
   };


   this.getSettingsGroups = function()
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/settings/all';
         const success = function(json)
         {
            if (json === undefined)
            {
               deferred.reject();
            }
            else
            {
               const data = outer.parseSettingsGroups(json.entries.value);
               deferred.resolve(data);
            }
         };
         const err = function()
         {
            deferred.reject();
         };
         outer.callWebservice(url, 'GET', 'json', null, success, err);
      });
      return def.promise();
   };


   this.updateSettingsGroup = function(data)
   {
      let settingsData = data;
      settingsData = JSON.stringify(data);
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/settings/replace';
         const success = function(json)
         {
            deferred.resolve(json);
            outer.controller.showSuccess('Changes saved');
         };
         const fail = function(xhr, error)
         {
            deferred.reject();
            if (xhr.status === 401)
            {
               outer.controller.showError('Unauthorized [401]. Please log in and try again.');
            }
            else
            {
               outer.controller.showError(error);
            }
         };
         outer.callWebservice(url, 'POST', 'json', settingsData, success, fail);
      });
      return def.promise();
   };


   this.storeSettingsGroup = function(data)
   {
      let settingsData = data;
      settingsData = JSON.stringify(data);
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/settings/group';
         const success = function(json)
         {
            deferred.resolve(json);
            outer.controller.showSuccess('Settings Loaded');
         };
         const fail = function(xhr, error)
         {
            deferred.reject();
            if (xhr.status === 401)
            {
               outer.controller.showError('Unauthorized [401]. Please log in and try again.');
            }
            else
            {
               outer.controller.showError(error);
            }
         };
         outer.callWebservice(url, 'POST', 'json', settingsData, success, fail);
      });
      return def.promise();
   };


   this.deleteRootGroup = function(data)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/settings/deleteRootGroup/' + data;
         const success = function(json)
         {
            deferred.resolve(json);
            outer.controller.showSuccess('Root group deleted');
         };
         const fail = function(xhr, error)
         {
            deferred.reject();
            if (xhr.status === 401)
            {
               outer.controller.showError('Unauthorized [401]. Please log in and try again.');
            }
            else
            {
               outer.controller.showError(error);
            }
         };
         outer.callWebservice(url, 'DELETE', 'json', null, success, fail);
      });
      return def.promise();
   };


   this.ctor = function(theController)
   {
      this.controller = theController;
      jQuery.extend(this, new AbstractModel());
      return this;
   };

   return this.ctor(controller);
};
