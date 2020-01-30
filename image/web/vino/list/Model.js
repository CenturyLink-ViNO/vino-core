/* globals jQuery               */
/* globals AbstractModel        */
/* exported ServiceListModel  */

'use strict';

window.ServiceListModel = function(json)
{
   const outer = this;
   this.cache = {};
   this.stepsCache = {};
   this.stepsDetailCache = {};
   this.loadServiceList = function(filterVisible)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/activated/?filterVisible=' + filterVisible;
         const success = function(data)
         {
            if (data === undefined)
            {
               deferred.reject();
            }
            else
            {
               deferred.resolve(data);
            }
         };
         const err = function(xhr)
         {
            if (xhr.status === 404)
            {
               deferred.resolve([]);
            }
            else
            {
               deferred.reject();
            }
         };
         outer.callWebservice(url, 'GET', 'json', null, success, err);
      });
      return def.promise();
   };
   this.loadService = function(jobId)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/activated/' + jobId;
         const success = function(data)
         {
            if (data === undefined)
            {
               deferred.reject();
            }
            else
            {
               outer.cache[jobId] = data;
               deferred.resolve(data);
            }
         };
         const err = function(xhr)
         {
            if (xhr.status === 404)
            {
               deferred.resolve();
            }
            else
            {
               deferred.reject();
            }
         };
         if (outer.cache.hasOwnProperty(jobId))
         {
            deferred.resolve(outer.cache[jobId]);
         }
         else
         {
            outer.callWebservice(url, 'GET', 'json', null, success, err);
         }
      });
      return def.promise();
   };
   this.loadServiceSteps = function(jobId)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/activated/' + jobId + '/steps';
         const success = function(data)
         {
            if (data === undefined)
            {
               deferred.reject();
            }
            else
            {
               outer.stepsCache[jobId] = data;
               deferred.resolve(data);
            }
         };
         const err = function(xhr)
         {
            if (xhr.status === 404)
            {
               deferred.resolve();
            }
            else
            {
               deferred.reject();
            }
         };
         if (outer.stepsCache.hasOwnProperty(jobId))
         {
            deferred.resolve(outer.stepsCache[jobId]);
         }
         else
         {
            outer.callWebservice(url, 'GET', 'json', null, success, err);
         }
      });
      return def.promise();
   };
   this.loadServiceStepDetails = function(jobId, stepId)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/activated/' + jobId + '/steps/' + stepId;
         const success = function(data)
         {
            if (data === undefined)
            {
               deferred.reject();
            }
            else
            {
               outer.stepsDetailCache[stepId] = data;
               deferred.resolve(data);
            }
         };
         const err = function(xhr)
         {
            if (xhr.status === 404)
            {
               deferred.resolve();
            }
            else
            {
               deferred.reject();
            }
         };
         if (outer.stepsDetailCache.hasOwnProperty(stepId))
         {
            deferred.resolve(outer.stepsDetailCache[stepId]);
         }
         else
         {
            outer.callWebservice(url, 'GET', 'json', null, success, err);
         }
      });
      return def.promise();
   };
   this.changeVisibilty = function(jobId, visible)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/service/activated/' + jobId + '/' + visible;
         const success = function(data)
         {
            if (data === undefined)
            {
               deferred.reject();
            }
            else
            {
               outer.cache[jobId] = data;
               deferred.resolve(data);
            }
         };
         const err = function(xhr)
         {
            if (xhr.status === 404)
            {
               deferred.resolve();
            }
            else
            {
               deferred.reject();
            }
         };
         if (outer.cache.hasOwnProperty(jobId))
         {
            deferred.resolve(outer.cache[jobId]);
         }
         else
         {
            outer.callWebservice(url, 'PUT', 'json', null, success, err);
         }
      });
      return def.promise();
   };

   this.logs = function(jobId)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         const url = '/rest/services/activationlog/' + jobId;
         const success = function(log)
         {
            if (log === undefined)
            {
               deferred.reject();
            }
            else
            {
               deferred.resolve(log);
            }
         };
         const err = function(xhr)
         {
            if (xhr.status === 404)
            {
               deferred.resolve('No log found for job ID: ' + jobId);
            }
            else
            {
               deferred.reject();
            }
         };
         outer.callWebservice(url, 'GET', 'text', null, success, err);
      });
      return def.promise();
   };

   this.ctor = function(jsonData)
   {
      jQuery.extend(this, new AbstractModel());
      if (typeof jsonData !== 'undefined')
      {
         this.fromJson(jsonData);
      }
      return this;
   };
   return this.ctor(json);
};
