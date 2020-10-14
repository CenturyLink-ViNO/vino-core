/* globals jQuery              */
/* globals Service             */
/* globals AbstractModel       */
/* exported ServiceSelectorModel */

'use strict';

window.ServiceSelectorModel = function()
{
   this.parseServices = function(jsonData)
   {
      let json = jsonData;
      const services = [];
      if (json.hasOwnProperty('entries'))
      {
         json = json.entries.value;
      }
      if (json !== undefined && Array.isArray(json))
      {
         let jsonIndex;
         for (jsonIndex = 0; jsonIndex < json.length; jsonIndex = jsonIndex + 1)
         {
            services.push(new Service(json[jsonIndex]));
         }
      }
      return services;
   };

   this.getServices = function()
   {
      const outer = this;
      const def = jQuery.Deferred(function(deferred)
      {
         const url = 'rest/services';
         const success = function(json)
         {
            if (json === undefined)
            {
               deferred.reject();
            }
            else
            {
               const data = outer.parseServices(json);
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
