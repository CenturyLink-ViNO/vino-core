/* globals jQuery                    */
/* globals pageModule                */
/* globals AbstractController        */
/* globals ServiceActivationModel    */
/* globals ServiceActivationView     */
/* globals ServiceSelctorController  */
/* globals StatusController          */
/* globals SettingsServerModel       */
/* exported serviceActivationController*/

'use strict';

const ServiceActivationController = function()
{
   const outer = this;

   this.files = [];
   this.files.push('/vino/data/Action.js', '/vino/data/Conditional.js');
   this.files.push('/vino/data/Loop.js', '/vino/data/Parameter.js');
   this.files.push('/vino/data/Service.js');
   this.files.push('/vino/data/ServiceRevision.js');
   this.files.push('/vino/data/ServiceTemplate.js');
   this.files.push('/vino/data/Step.js');
   this.files.push('/vino/serviceActivation/serviceSelector/Controller.js');
   this.files.push('/vino/serviceActivation/Model.js');
   this.files.push('/vino/serviceActivation/View.js');
   this.files.push('/vino/serviceActivation/stepWizard/Controller.js');
   this.files.push('/vino/serviceActivation/stepWizard/View.js');
   this.files.push('/lib/abacus/BootstrapTabPanel.js');
   this.files.push('/vino/status/Controller.js');
   this.files.push('/vino/settingsServer/Model.js');

   this.showActivationPage = function()
   {
      pageModule.buildPage('serviceActivation', 'Service Activation');
      this.render('serviceActivation-bdy');
   };

   this.render = function(baseId)
   {
      jQuery.when(this.loadJs(this.files)).done(function()
      {
         const serviceSelectorController = new ServiceSelctorController();
         serviceSelectorController.render(baseId);
         jQuery.when(serviceSelectorController.awaitSelection()).done(function(service)
         {
            outer.model = new ServiceActivationModel();
            outer.view = new ServiceActivationView(outer, baseId);
            const settingsServerModel = new SettingsServerModel();

            jQuery.when(
               outer.model.getTemplate(service.id),
               settingsServerModel.getSettingsGroupsLists()
            ).done(function(template, settingsGroups)
            {
               outer.serviceTemplate = template;
               outer.service = service;
               outer.settingsGroups = settingsGroups;
               outer.view.clear();
               outer.view.showView(service, template, settingsGroups);
            });
         });
      });
   };
   this.selectService = function(serviceId)
   {
      this.view.clearForm();
      if (serviceId !== undefined)
      {
         jQuery.when(outer.model.getTemplate(serviceId)).done(function(data)
         {
            outer.serviceTemplate = data;
            outer.view.renderForm(outer.serviceTemplate);
         });
      }
   };

   this.showFinalReview = function()
   {
      outer.view.clear();
      outer.view.renderReviewPage(this.service, this.serviceTemplate);
   };
   this.activateService = function()
   {
      const valid = this.serviceTemplate.validate();
      if (valid.isValid)
      {
         const activationTemplate = this.serviceTemplate.toActivationTemplate();
         jQuery.when(this.model.activateService(outer.service.id, activationTemplate)).done(function(data)
         {
            const statusController = new StatusController(outer.baseId, outer.service.id);
            outer.jobId = statusController.parseJobId(data.data);
            if (outer.jobId === undefined)
            {
               outer.view.showError('Failure to get job ID');
            }
            else
            {
               jQuery.when(statusController.render('Activating Service...', true, outer)).done(function()
               {
                  statusController.pollStatus(outer.jobId);
               });
            }
         });
      }
      else
      {
         let errorIndex;
         const messages = [];
         for (errorIndex = 0; errorIndex < valid.errors.length; errorIndex = errorIndex + 1)
         {
            messages.push('Step ' + (valid.errors[errorIndex].index + 1) + ': ' + valid.errors[errorIndex].errors);
         }
         this.view.showError(messages);
      }
   };

   this.cancelService = function()
   {
      outer.model.cancelService(outer.service.id, outer.jobId);
   };

   this.ctor = function()
   {
      this.baseId = 'activateService';
      jQuery.extend(this, new AbstractController());
      return this;
   };

   return this.ctor();
};

window.serviceActivationController = new ServiceActivationController();
