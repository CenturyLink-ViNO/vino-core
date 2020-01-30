/* globals jQuery              */
/* globals AbstractDataObject  */
/* globals Scalar  */
/* globals ScalarList  */
/* globals SettingsGroup  */
/* exported SettingsGroup */

'use strict';

window.SettingsGroup = function(data, isNew)
{
   this.name = '';
   this.idName = '';
   this.displayName = '';
   this.defaults = null;
   this.groups = [];
   this.scalars = [];
   this.scalarLists = [];
   this.deleted = false;
   this.isNew = false;
   this.isDefault = false;
   this.parentIsDefaults = false;

   this.format =
   {
      name:
      {
         label: 'Name',
         id: 'name',
         extraClasses: 'name',
         isInline: true
      },
      displayName:
      {
         label: 'Display Name',
         id: 'displayName',
         extraClasses: 'displayName',
         isInline: true
      },
      showCancel: true
   };


   this.getFormat = function()
   {
      const outer = this;
      if (outer.name !== '')
      {
         outer.format.name.type = 'info';
      }
      if (outer.format.hasOwnProperty('type'))
      {
         delete outer.format.type;
      }
      return outer.format;
   };


   this.getJsonDataToPost = function(excludeNew, excludeIsDefaultFlag)
   {
      const outer = this;
      let json = {};
      if (outer.deleted || excludeNew && outer.isNew || !outer.parentIsDefaults && outer.isDefault)
      {
         json = null;
      }
      else
      {
         json.name = outer.name;
         json.displayName = outer.displayName;
         if (!excludeIsDefaultFlag)
         {
            json.isDefault = outer.isDefault;
         }
         if (outer.defaults !== null && outer.defaults !== undefined)
         {
            json.defaults = outer.defaults.getJsonDataToPost(excludeNew, excludeIsDefaultFlag);
            if (json.defaults === null)
            {
               if (outer.type === 'root')
               {
                  json.defaults = {};
               }
               delete json.defaults;
            }
         }
         json.groups = this.getJsonDataFromGroups(excludeNew, excludeIsDefaultFlag);
         if (json.groups.length === 0)
         {
            delete json.groups;
         }
         json.scalars = this.getJsonDataFromScalars(excludeNew, excludeIsDefaultFlag);
         if (json.scalars.length === 0)
         {
            delete json.scalars;
         }
         json.scalarLists = this.getJsonDataFromScalarLists(excludeNew, excludeIsDefaultFlag);
         if (json.scalarLists.length === 0)
         {
            delete json.scalarLists;
         }
      }
      return json;
   };


   this.getJsonDataFromGroups = function(excludeNew, excludeIsDefaultFlag)
   {
      const outer = this;
      let groupIndex;
      const jsonGroups = [];
      for (groupIndex in outer.groups)
      {
         if (outer.groups.hasOwnProperty(groupIndex))
         {
            const group = outer.groups[groupIndex].getJsonDataToPost(excludeNew, excludeIsDefaultFlag);
            if (group !== null)
            {
               jsonGroups.push(group);
            }
         }
      }
      return jsonGroups;
   };


   this.getJsonDataFromScalars = function(excludeNew, excludeIsDefaultFlag)
   {
      const outer = this;
      let scalarIndex;
      const jsonScalars = [];
      for (scalarIndex in outer.scalars)
      {
         if (outer.scalars.hasOwnProperty(scalarIndex))
         {
            const scalar = outer.scalars[scalarIndex].getJsonDataToPost(excludeNew, excludeIsDefaultFlag);
            if (scalar !== null)
            {
               jsonScalars.push(scalar);
            }
         }
      }
      return jsonScalars;
   };


   this.getJsonDataFromScalarLists = function(excludeNew, excludeIsDefaultFlag)
   {
      const outer = this;
      let scalarListIndex;
      const jsonScalarLists = [];
      for (scalarListIndex in outer.scalarLists)
      {
         if (outer.scalarLists.hasOwnProperty(scalarListIndex))
         {
            const scalarConstantList = outer.scalarLists[scalarListIndex].getJsonDataToPost(excludeNew, excludeIsDefaultFlag);
            if (scalarConstantList !== null)
            {
               jsonScalarLists.push(scalarConstantList);
            }
         }
      }
      return jsonScalarLists;
   };


   this.saveChanges = function(dataObject, viewInfo)
   {
      const outer = this;
      const object = dataObject;
      const tree = viewInfo.tree;
      const view = viewInfo.view;
      let type = viewInfo.type;
      const updateNode = viewInfo.updateNode;
      outer.type = type;
      if (type === undefined)
      {
         type = 'group';
      }
      const parentNode = viewInfo.parentNode;
      const containerId = viewInfo.containerId;
      return function(btn)
      {
         btn.button('loading');
         const nameElement = jQuery('#' + containerId).find('#name');
         if (nameElement.is('input'))
         {
            object.name = nameElement.val().trim();
         }
         else
         {
            object.name = nameElement.text().trim();
         }
         if (object.idName === '' || object.idName === undefined)
         {
            object.idName = object.name.replace(/-|\s/g, '');
         }
         object.displayName = jQuery('#' + containerId).find('#displayName').
            val();
         if (type === 'root')
         {
            object.defaults = {};
         }
         else
         {
            const subRootId = parentNode.id.split('-')[0] + '-' + parentNode.id.split('-')[1];
            if (tree.jstree(true).get_node(subRootId).type === 'defaults')
            {
               object.isDefault = true;
            }
            else
            {
               object.isDefault = false;
            }
         }
         if (tree !== undefined)
         {
            view.updateTreeWithNode(object, type, parentNode, updateNode);
         }
         jQuery('.modal').remove();
         btn.button('reset');
      };
   };


   this.ctor = function(groupData, isNewGroup)
   {
      const outer = this;
      jQuery.extend(this, new AbstractDataObject());
      if (groupData !== undefined)
      {
         this.fromJson(groupData);
         this.format = this.getFormat('');
         if (this.idName === '')
         {
            this.idName = this.name.replace(/-|\s/g, '');
         }
         if (isNewGroup !== null && isNewGroup !== undefined)
         {
            this.isNew = isNewGroup;
         }
         else
         {
            this.isNew = false;
         }
      }
      let groupIndex;
      let scalarIndex;
      let scalarListIndex;
      let group;
      let scalar;
      let scalarList;
      if (this.defaults !== null && this.defaults !== undefined)
      {
         this.defaults = new SettingsGroup(this.defaults);
      }
      for (groupIndex = 0; groupIndex < this.groups.length; groupIndex = groupIndex + 1)
      {
         group = this.groups[groupIndex];
         this.groups[groupIndex] = new SettingsGroup(group);
      }
      for (scalarIndex = 0; scalarIndex < this.scalars.length; scalarIndex = scalarIndex + 1)
      {
         scalar = this.scalars[scalarIndex];
         this.scalars[scalarIndex] = new Scalar(scalar);
      }
      for (scalarListIndex = 0; scalarListIndex < this.scalarLists.length; scalarListIndex = scalarListIndex + 1)
      {
         scalarList = this.scalarLists[scalarListIndex];
         this.scalarLists[scalarListIndex] = new ScalarList(scalarList);
      }
      this.format.submitFunction = outer.saveChanges;
      return this;
   };

   return this.ctor(data, isNew);
};
