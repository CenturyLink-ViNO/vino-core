/* globals jQuery              */
/* globals AbstractDataObject  */
/* exported Service */

'use strict';

window.Service = function(data)
{
   this.id = '';
   this.url = '';
   this.name = '';
   this.description = '';

   this.ctor = function(theData)
   {
      jQuery.extend(this, new AbstractDataObject());
      if (theData !== undefined)
      {
         this.fromJson(theData);
         this.id = theData.id;
      }
      return this;
   };

   return this.ctor(data);
};
