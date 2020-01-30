/* globals jQuery              */
/* globals AbstractDataObject  */
/* exported ServiceRevison */

'use strict';

window.ServiceRevison = function(data)
{
   this.id = '';
   this.service = {};
   this.version = 0;
   this.description = '';
   this.serviceSteps = []; // Step[]


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
