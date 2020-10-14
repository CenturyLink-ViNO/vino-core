/* globals jQuery           */
/* globals Status           */
/* globals AbstractModel    */
/* exported StatusModel  */

'use strict';

window.StatusModel = function()
{
   const outer = this;
   this.parseStatus = function(json)
   {
      const data = [];
      if (json !== undefined && Array.isArray(json))
      {
         let jsonIndex;
         for (jsonIndex = 0; jsonIndex < json.length; jsonIndex = jsonIndex + 1)
         {
            data.push(new Status(json[jsonIndex]));
         }
      }
      return data;
   };
   this.getStatus = function(serviceId, jobId)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = 'rest/services/' + serviceId + '/status/' + jobId;
         const success = function(json)
         {
            if (json === undefined)
            {
               deferred.reject();
            }
            else
            {
               const data = outer.parseStatus(json);
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
   this.ctor = function()
   {
      jQuery.extend(this, new AbstractModel());
      return this;
   };
   return this.ctor();
};
