/* globals jQuery              */
/* globals Service             */
/* globals ServiceTemplate     */
/* globals AbstractModel     */
/* exported ServiceActivationModel  */

'use strict';

window.ServiceActivationModel = function()
{
   this.parseServices = function(json)
   {
      const services = [];
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
         const url = '/rest/services';
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
   this.getTemplate = function(serviceId)
   {
      const outer = this;
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/' + serviceId + '/template';
         const success = function(json)
         {
            if (json === undefined)
            {
               deferred.reject();
            }
            else
            {
               deferred.resolve(new ServiceTemplate(json));
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
   this.activateService = function(serviceId, serviceTemplate)
   {
      const outer = this;
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/' + serviceId + '/activate';
         const success = function(json)
         {
            if (json === undefined)
            {
               deferred.reject();
            }
            else
            {
               deferred.resolve({ data: json });
            }
         };
         const err = function()
         {
            deferred.reject();
         };
         outer.callWebservice(url, 'POST', 'json', serviceTemplate, success, err);
      });
      return def.promise();
   };
   this.cancelService = function(serviceId, jobId)
   {
      const outer = this;
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/' + serviceId + '/cancel/' + jobId;

         const success = function(json)
         {
            if (json === undefined)
            {
               deferred.reject();
            }
            else
            {
               deferred.resolve({ data: json });
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
   this.deactivateService = function(serviceId, jobId)
   {
      const outer = this;
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/' + serviceId + '/deactivate/' + jobId;

         const success = function(json)
         {
            if (json === undefined)
            {
               deferred.reject();
            }
            else
            {
               deferred.resolve({ data: json });
            }
         };
         const err = function()
         {
            deferred.reject();
         };
         outer.callWebservice(url, 'DELETE', 'json', null, success, err);
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
