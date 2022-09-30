/* globals jQuery              */
/* globals AbstractModel       */

'use strict';

window.CuiAcknowledgementModel = function()
{
   const outer = this;

   this.getCuiAcknowledgement = function()
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = 'ui/cuiAcknowledgment/';
         const success = function()
         {
            deferred.resolve(true);
         };
         const err = function()
         {
            deferred.resolve(false);
         };
         outer.callWebservice(url, 'GET', 'text', null, success, err);
      });
      return def.promise();
   };
   this.postCuiAcknowledgement = function()
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = 'ui/cuiAcknowledgment/';
         const success = function()
         {
            deferred.resolve();
         };
         outer.callWebservice(url, 'POST', 'text', null, success, success);
      });
      return def.promise();
   };
   this.ctor = function()
   {
      jQuery.extend(this, new AbstractModel());
      return this;
   };

   return this.ctor();
};
