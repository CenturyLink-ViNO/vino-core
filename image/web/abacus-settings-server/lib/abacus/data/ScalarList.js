/* globals jQuery              */
/* globals AbstractDataObject  */
/* globals Scalar  */
/* exported ScalarList */

'use strict';

window.ScalarList = function(data, isNew)
{
   this.name = '';
   this.idName = '';
   this.displayName = '';
   this.entries = [];
   this.isDefault = '';
   this.deleted = false;
   this.isNew = false;
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
         json.entries = [];
         let entryIndex;
         for (entryIndex in outer.entries)
         {
            if (outer.entries.hasOwnProperty(entryIndex))
            {
               const entry = outer.entries[entryIndex].getJsonDataToPost(excludeNew, excludeIsDefaultFlag);
               if (entry !== null)
               {
                  json.entries.push(entry);
               }
            }
         }
      }
      return json;
   };


   this.saveChanges = function(dataObject, viewInfo)
   {
      const object = dataObject;
      const tree = viewInfo.tree;
      const view = viewInfo.view;
      const updateNode = viewInfo.updateNode;
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
         object.isDefault = false;
         object.entries = [];
         if (tree !== undefined)
         {
            view.updateTreeWithNode(object, 'scalarList', parentNode, updateNode);
         }
         jQuery('.modal').remove();
         btn.button('reset');
      };
   };


   this.ctor = function(theData, isNewScalarList)
   {
      const outer = this;
      jQuery.extend(this, new AbstractDataObject());
      if (theData !== undefined)
      {
         this.fromJson(theData);
         if (this.idName === '')
         {
            this.idName = this.name.replace(/-|\s/g, '');
         }
         if (isNewScalarList !== null && isNewScalarList !== undefined)
         {
            this.isNew = isNewScalarList;
         }
         else
         {
            this.isNew = false;
         }
      }
      let entryIndex;
      let entry;
      for (entryIndex = 0; entryIndex < this.entries.length; entryIndex = entryIndex + 1)
      {
         entry = this.entries[entryIndex];
         this.entries[entryIndex] = new Scalar(entry);
      }
      this.format.submitFunction = outer.saveChanges;
      return this;
   };

   return this.ctor(data, isNew);
};
