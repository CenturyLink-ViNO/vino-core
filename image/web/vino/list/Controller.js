/* globals jQuery                         */
/* globals jsInclude                      */
/* globals ServiceListModel               */
/* globals ServiceActivationDetailController */
/* globals ServiceListView               */
/* globals ServiceActivationModel        */
/* globals StatusController    */
/* globals moment    */
/* exported ServiceListController  */

'use strict';

window.ServiceListController = function(baseId)
{
   const outer = this;
   outer.filteredActivationData = null;
   outer.activationData = null;
   this.render = function()
   {
      jQuery.when(
         jsInclude('/vino/list/View.js'),
         jsInclude('/vino/list/Model.js'),
         jsInclude('/vino/list/DataObject.js'),
         jsInclude('/vino/status/Controller.js'),
         jsInclude('/vino/serviceActivation/Model.js')
      ).done(function()
      {
         outer.view = new ServiceListView(outer, outer.baseId);
         outer.serviceListModel = new ServiceListModel();
         const statusController = new StatusController(outer.baseId, outer.statusUrl);
         jQuery.when(outer.serviceListModel.loadServiceList(true)).done(function(activatedServices)
         {
            let key2;

            outer.filteredActivationData = { data: [] };
            for (key2 in activatedServices)
            {
               if (activatedServices.hasOwnProperty(key2))
               {
                  const service = activatedServices[key2];
                  const status = service.status[service.status.length - 1].status.toLowerCase();
                  switch (status)
                  {
                  case 'complete':
                     service.stateString = 'Activated';
                     if (service.activationSuccessDescriptor)
                     {
                        service.stateString = service.activationSuccessDescriptor;
                     }
                     service.state = 'ACTIVATED';
                     break;
                  case 'failed':
                  case 'failed_activate_rollback_successful':
                     service.stateString = 'Activation Failed';
                     service.state = 'FAILED';
                     break;
                  case 'failed_activate_rollback_failed':
                     service.stateString = 'Activation and Rollback Failed';
                     if (service.activationFailureDescriptor)
                     {
                        service.stateString = service.activationFailureDescriptor;
                     }
                     service.state = 'FAILED';
                     break;
                  case 'deactivated':
                     service.stateString = 'Terminated';
                     if (service.terminationSuccessDescriptor)
                     {
                        service.stateString = service.terminationSuccessDescriptor;
                     }
                     service.state = 'DEACTIVATED';
                     break;
                  case 'failed_deactivate':
                     service.stateString = 'Termination Failed';

                     if (service.terminationFailureDescriptor)
                     {
                        service.stateString = service.terminationFailureDescriptor;
                     }
                     service.state = 'DEACTIVATED';
                     break;
                  case 'cancelled':
                     service.stateString = 'Service Activation Canceled';
                     service.state = 'CANCELED';
                     break;
                  default:
                     service.stateString = 'Unknown';
                     service.state = 'UNKNOWN';
                     break;
                  }
                  service.endTime = moment(statusController.parseFinishTime(service.status)).format('YYYY-MM-DD HH:mm:ss');
                  outer.filteredActivationData.data.push(service);
                  service.logButton = '<button>' + service.id + '.log</button>';
                  if (service.visible)
                  {
                     service.visibleSelect = '<select><option value=true selected>Yes</option><option value=false>No</option></select>';
                  }
                  else
                  {
                     service.visibleSelect = '<select><option value=true>Yes</option><option value=false selected>No</option></select>';
                  }
               }
            }
            outer.view.showView(outer.filteredActivationData);
            outer.filteredActivationData = outer.filteredActivationData.data;
         }).
            fail(function()
            {
               outer.view.showError('Failed to load activated Services.');
            });
      });
   };
   this.loadAllActivatedData = function()
   {
      if (outer.activationData === null)
      {
         const statusController = new StatusController(outer.baseId, outer.statusUrl);
         jQuery.when(outer.serviceListModel.loadServiceList(false)).done(function(activatedServices)
         {
            let key;

            outer.activationData = [];
            for (key in activatedServices)
            {
               if (activatedServices.hasOwnProperty(key))
               {
                  const service = activatedServices[key];
                  const status = service.status[service.status.length - 1].status.toLowerCase();
                  switch (status)
                  {
                     case 'complete':
                     service.stateString = 'Activated';
                     if (service.activationSuccessDescriptor)
                     {
                        service.stateString = service.activationSuccessDescriptor;
                     }
                     service.state = 'ACTIVATED';
                     break;
                     case 'failed':
                     case 'failed_activate_rollback_successful':
                     service.stateString = 'Activation Failed';
                     service.state = 'FAILED';
                     break;
                     case 'failed_activate_rollback_failed':
                     service.stateString = 'Activation and Rollback Failed';
                     if (service.activationFailureDescriptor)
                     {
                        service.stateString = service.activationFailureDescriptor;
                     }
                     service.state = 'FAILED';
                     break;
                     case 'deactivated':
                     service.stateString = 'Terminated';
                     if (service.terminationSuccessDescriptor)
                     {
                        service.stateString = service.terminationSuccessDescriptor;
                     }
                     service.state = 'DEACTIVATED';
                     break;
                     case 'failed_deactivate':
                     service.stateString = 'Termination Failed';

                     if (service.terminationFailureDescriptor)
                     {
                        service.stateString = service.terminationFailureDescriptor;
                     }
                     service.state = 'DEACTIVATED';
                     break;
                     case 'cancelled':
                     service.stateString = 'Service Activation Canceled';
                     service.state = 'CANCELED';
                     break;
                     default:
                     service.stateString = 'Unknown';
                     service.state = 'UNKNOWN';
                     break;
                  }
                  service.endTime = moment(statusController.parseFinishTime(service.status)).format('YYYY-MM-DD HH:mm:ss');
                  outer.activationData.push(service);
                  service.logButton = '<button>' + service.id + '.log</button>';
                  outer.setVisibleSelectHtml(service);
               }
            }
            outer.view.updateView(outer.activationData);
         }).
         fail(function()
         {
            outer.view.showError('Failed to load activated Services.');
         });
      }
      else
      {
         outer.view.updateView(outer.activationData);
      }
   };
   this.setVisibleSelectHtml = function(service)
   {
      if (service.visible)
      {
         service.visibleSelect = '<select class="visible-select"><option value=true selected>True</option><option value=false>False</option></select>';
      }
      else
      {
         service.visibleSelect = '<select class="visible-select"><option value=true>True</option><option value=false selected>False</option></select>';
      }
   };
   this.selectedService = function(selectedJobId, state)
   {
      const outer = this;
      this.selectedJobId = selectedJobId;
      jQuery.when(jsInclude('/vino/serviceActivationDetails/Controller.js')).done(function()
      {
         jQuery.when(
             outer.serviceListModel.loadService(selectedJobId),
             outer.serviceListModel.loadServiceSteps(selectedJobId)
         ).done(function(selectedServiceData, selectedServiceStepMetadata)
         {
            outer.selectedServiceId = selectedServiceData.referenceId;
            outer.selectedJobStatus = state;
            selectedServiceData.state = state;
            selectedServiceData.steps = selectedServiceStepMetadata;
            outer.selectedInputTemplate = selectedServiceData.inputTemplate;
            const serviceDetailsController = new ServiceActivationDetailController(
               selectedServiceData,
               outer.baseId, outer.view.serviceModelPanel, outer.serviceListModel, outer.selectedJobId
            );
            serviceDetailsController.render();
         });
      });
   };
   this.selectActivationLog = function(activationId)
   {
      const outer = this;
      jQuery.when(outer.serviceListModel.logs(activationId)).done(function(activationLog)
      {
         outer.view.showActivationLog(activationId, activationLog);
      });
   };

   this.deactivateService = function()
   {
      const outer = this;
      const model = new ServiceActivationModel();

      jQuery.when(model.deactivateService(this.selectedServiceId, this.selectedJobId)).done(function(data)
      {
         const statusController = new StatusController(outer.baseId, outer.selectedServiceId);
         const jobId = outer.selectedJobId;
         const startTime = statusController.parseStartTime(data.data);

         if (jobId === undefined)
         {
            outer.view.showError('Failure to get job ID');
         }
         else
         {
            statusController.render('Deactivating Service...');
            statusController.pollStatus(jobId, startTime);
         }
      });
   };
   this.reactivateService = function()
   {
      const outer = this;
      const model = new ServiceActivationModel();

      if (this.selectedInputTemplate)
      {
         jQuery.when(model.activateService(this.selectedServiceId, this.selectedInputTemplate)).done(function(data)
         {
            const statusController = new StatusController(outer.baseId, outer.selectedServiceId);
            const jobId = statusController.parseJobId(data.data);
            if (jobId === undefined)
            {
               outer.view.showError('Failure to get job ID');
            }
            else
            {
               jQuery.when(statusController.render('Activating Service...', true, outer)).done(function()
               {
                  statusController.pollStatus(jobId);
               });
            }
         });
      }
      else
      {
         outer.view.showError('Existing service does not contain original activation template. Cannot reactivate.');
      }
   };
   this.ctor = function(theBaseId)
   {
      this.baseId = theBaseId;
      this.selectedJobId = null;
      this.selectedJobStatus = null;
      this.statusUrl = '/rest/service/status/';
      return this;
   };
   return this.ctor(baseId);
};
