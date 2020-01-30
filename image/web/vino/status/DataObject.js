/* exported Status  */

'use strict';

window.Status = function(data)
{
   this.status = '';
   this.jobId = '';
   this.message = '';
   this.time = '';

   this.fromJson = function(theData)
   {
      let param;
      const outer = this;
      for (param in theData)
      {
         if (theData.hasOwnProperty(param) && typeof theData[param] !== 'function' && theData[param] !== null &&
         theData[param] !== '' && theData[param] !== undefined)
         {
            if (outer.hasOwnProperty(param) && typeof outer[param] !== 'function')
            {
               outer[param] = theData[param];
            }
         }
      }
   };
   this.toJson = function()
   {
      let param;
      const json = {};
      for (param in this)
      {
         if (this.hasOwnProperty(param) && param !== 'toJson' && typeof this[param] !== 'function' &&
         typeof this[param] !== 'object' && param !== 'controller')
         {
            json[param] = this[param];
         }
      }
      return json;
   };
   this.ctor = function(theData)
   {
      if (theData !== undefined)
      {
         this.fromJson(theData);
      }
      return this;
   };

   return this.ctor(data);
};
