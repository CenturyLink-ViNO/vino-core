/* globals jQuery        */
/* globals window        */
/* globals StatusModel   */
/* globals StatusView    */
/* globals jsInclude    */
/* exported StatusController  */

'use strict';

window.StatusController = function(baseId, serviceId)
{
   const outer = this;
   this.render = function(description, isActivate, downstreamController)
   {
      const def = jQuery.Deferred(function(deferred)
      {
         jQuery.when(
            jsInclude('/vino/status/View.js'),
            jsInclude('/vino/status/Model.js'),
            jsInclude('/vino/status/DataObject.js')
         ).done(function()
         {
            outer.model = new StatusModel();
            outer.view = new StatusView(outer.baseId);

            outer.view.createLoadingModal(description, isActivate, downstreamController);
            deferred.resolve();
         });
      });
      return def;
   };
   this.pollStatus = function(jobId, startTime)
   {
      const pollingFreq = 1000; // ms
      let waitingForResponse = false;

      const statusUpdateInterval = window.setInterval(function()
      {
         if (!waitingForResponse)
         {
            waitingForResponse = true;
            jQuery.when(outer.model.getStatus(outer.serviceId, jobId)).done(function(response)
            {
               if (Array.isArray(response) && response.length > 0)
               {
                  let entry;
                  let entryIndex;
                  outer.view.emptyStatusUpdates();
                  const entries = [];
                  for (entryIndex in response)
                  {
                     if (response.hasOwnProperty(entryIndex))
                     {
                        entry = response[entryIndex];
                        if (startTime)
                        {
                           if (entry.time >= startTime)
                           {
                              entries.push(entry);
                           }
                        }
                        else
                        {
                           entries.push(entry);
                        }
                     }
                  }
                  entries.sort(function(aItem, bItem)
                  {
                     return aItem.time - bItem.time;
                  });
                  for (entryIndex = 0; entryIndex < entries.length; entryIndex = entryIndex + 1)
                  {
                     entry = entries[entryIndex];
                     outer.view.addStatusUpdate(entry);
                     if (entry.status.toLowerCase() === 'complete' ||
                     entry.status.toLowerCase() === 'failed' ||
                     entry.status.toLowerCase() === 'deactivated')
                     {
                        outer.view.done();
                        window.clearInterval(statusUpdateInterval);
                     }
                     else if (entry.status.toLowerCase() === 'cancelled')
                     {
                        outer.view.cancelled();
                     }
                  }
               }
               waitingForResponse = false;
            }).
               fail(function()
               {
                  outer.view.showError(outer.baseId, 'Failed to get job status');
               });
         }
      }, pollingFreq);
   };
   this.parseJobId = function(json)
   {
      let jobId;
      if (json !== undefined)
      {
         if (Array.isArray(json) && json.length > 0 && json[0].hasOwnProperty('jobId'))
         {
            jobId = json[0].jobId;
         }
         else if (json.hasOwnProperty('jobId'))
         {
            jobId = json.jobId;
         }
      }
      return jobId;
   };
   this.parseStartTime = function(json)
   {
      let startTime = 0;
      if (json !== undefined)
      {
         if (Array.isArray(json) && json.length > 0 && json[0].hasOwnProperty('time'))
         {
            startTime = json[0].time;
         }
         else if (json.hasOwnProperty('time'))
         {
            startTime = json.time;
         }
      }
      return startTime;
   };
   this.parseFinishTime = function(statusArray)
   {
      let endTime = 0;
      if (statusArray)
      {
         if (Array.isArray(statusArray) && statusArray.length > 0)
         {
            statusArray.sort(function(aItem, bItem)
            {
               return aItem.time - bItem.time;
            });
            endTime = statusArray[statusArray.length - 1].time;
         }
      }
      return endTime;
   };
   this.ctor = function(theBaseId, theServiceId)
   {
      this.baseId = theBaseId;
      this.serviceId = theServiceId;
      return this;
   };

   return this.ctor(baseId, serviceId);
};
