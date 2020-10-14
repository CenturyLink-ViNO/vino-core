/* globals jQuery              */
/* globals AbstractModel       */
/* exported SettingsServerModel*/

'use strict';

window.SettingsServerModel = function()
{
   const outer = this;
   this.getAllSettingsSubStrings = function(root, parentString, parentDisplayString)
   {
      const groupString = parentString ? parentString + '/' + root.name : root.name;
      const groupDisplayString = parentDisplayString ? parentDisplayString + '/' + root.displayName : root.displayName;
      let subStrings = [];
      subStrings.push({
         label: groupDisplayString,
         value: groupString
      });
      if (root.groups && Array.isArray(root.groups))
      {
         let groupsIndex;
         let subGroup;
         for (groupsIndex = 0; groupsIndex < root.groups.length; groupsIndex = groupsIndex + 1)
         {
            subGroup = root.groups[groupsIndex];
            subStrings = subStrings.concat(this.getAllSettingsSubStrings(subGroup, groupString, groupDisplayString));
         }
      }
      return subStrings;
   };
   this.parseSettingsGroups = function(json)
   {
      let settingsGroups = [];
      if (json !== undefined && Array.isArray(json))
      {
         let jsonIndex;
         for (jsonIndex = 0; jsonIndex < json.length; jsonIndex = jsonIndex + 1)
         {
            settingsGroups = settingsGroups.concat(this.getAllSettingsSubStrings(json[jsonIndex]));
         }
      }
      return settingsGroups;
   };
   this.getSettingsGroupsLists = function()
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = 'rest/settings/all';
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

   this.ctor = function(controller)
   {
      this.controller = controller;
      jQuery.extend(this, new AbstractModel());
      return this;
   };

   return this.ctor();
};
