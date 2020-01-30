/* globals jQuery                 */
/* globals AbstractDataObject     */
/* exported ServiceRow  */

'use strict';

window.ServiceRow = function(json)
{
   this.ctor = function(jsonData)
   {
      jQuery.extend(this, new AbstractDataObject());
      this.id = '';
      this.customerName = '';
      this.podId = '';
      this.cugId = '';
      this.state = '';
      this.referenceId = '';

      if (typeof jsonData !== 'undefined')
      {
         this.fromJson(jsonData);
      }
      return this;
   };
   return this.ctor(json);
};
