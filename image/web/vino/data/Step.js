/* globals jQuery           */
/* globals AbstractDataObject  */
/* globals Action              */
/* globals Loop                */
/* globals Conditional         */
/* exported Step */

'use strict';

window.Step = function(data)
{
   this.id = '';
   this.type = '';
   this.name = '';
   this.description = '';
   this.settingsRoot = '';

   this.format = {};
   this.editFormat = {};
   this.readOnlyFormat = {};


   this.setReadOnlyFormat = function()
   {
      if (jQuery.isEmptyObject(this.readOnlyFormat))
      {
         this.generatReadOnlyFormat();
      }
      this.format = this.readOnlyFormat;
   };

   this.setEditFormat = function()
   {
      if (jQuery.isEmptyObject(this.editFormat))
      {
         this.generateEditFormat();
      }
      this.format = this.editFormat;
   };

   this.generatReadOnlyFormat = function()
   {
      if (jQuery.isEmptyObject(this.editFormat))
      {
         this.generateEditFormat();
      }
      let field;
      for (field in this.editFormat)
      {
         if (this.editFormat.hasOwnProperty(field))
         {
            this.readOnlyFormat[field] =
            {
               label: this.editFormat[field].label,
               id: this.editFormat[field].id,
               type: 'info'
            };
         }
      }
   };

   this.ctor = function(theData)
   {
      jQuery.extend(this, new AbstractDataObject());

      if (theData !== undefined)
      {
         theData.id = theData.id.replace(/\./g, '-');
         if (theData.hasOwnProperty('steps'))
         {
            return new Loop(theData, theData.id);
         }
         else if (theData.hasOwnProperty('trueSteps'))
         {
            return new Conditional(theData, theData.id);
         }

         return new Action(theData, theData.id);
      }
      return this;
   };

   return this.ctor(data);
};
