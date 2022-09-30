/* globals jQuery                 */
/* globals pageModule             */
/* globals StepWizardController   */
/* globals FormBuilder            */
/* globals bootbox                */
/* exported ServiceActivationView  */

'use strict';

window.ServiceActivationView = function(controller, baseId)
{
   const outer = this;
   this.showView = function(service, serviceTemplate, settingsGroups)
   {
      this.renderServiceDetails(service);
      this.renderCustomerSection(settingsGroups);
      const wizardPanelId = 'service-wizard';
      const wizardPanel = pageModule.getNewPanel('Service Steps');
      wizardPanel.css('width', 'calc(100%)');
      wizardPanel.addClass('panel-primary');
      jQuery('#' + this.baseId).append(wizardPanel);
      wizardPanel.attr('id', wizardPanelId);
      const wizardController = new StepWizardController(
         serviceTemplate.steps,
         {
            reviewTab: false,
            onComplete: this.controller.showFinalReview.bind(this.controller)
         }
      );

      wizardController.render(wizardPanelId);
   };

   this.renderServiceDetails = function(service)
   {
      this.serviceInfoPanel = pageModule.getNewPanel('Service Info');
      this.serviceInfoPanel.css('width', 'calc(100%)');
      this.serviceInfoPanel.addClass('panel-primary');
      jQuery('.panel-body', this.serviceInfoPanel).attr('id', 'service-info-panel-bdy');
      jQuery('#' + this.baseId).append(this.serviceInfoPanel);
      const formBuilder = new FormBuilder({
         selectedServiceName: service.name,
         selectedServiceDesc: service.description,
         format:
            {
               name:
               {
                  label: 'Service Name',
                  id: 'selectedServiceName',
                  type: 'info',
                  isInline: true
               },
               description:
               {
                  label: 'Description',
                  id: 'selectedServiceDesc',
                  type: 'info',
                  isInline: true
               }
            }
      });
      formBuilder.buildForm('#service-info-panel-bdy');
   };

   this.renderCustomerSection = function(settingsGroups)
   {
      this.customerInfoPanel = pageModule.getNewPanel('Customer Info');
      this.customerInfoPanel.css('width', 'calc(100%)');
      this.customerInfoPanel.addClass('panel-primary');
      jQuery('.panel-body', this.customerInfoPanel).attr('id', 'customer-info-panel-bdy');
      jQuery('#' + this.baseId).append(this.customerInfoPanel);
      const formBuilder = new FormBuilder({
         settingsRoot: this.controller.serviceTemplate.settingsRoot || '',
         cugId: this.controller.serviceTemplate.cugId || '',
         customerName: this.controller.serviceTemplate.customerName || '',
         format:
            {
               settingsRoot:
               {
                  label: 'Settings Root',
                  id: 'settingsRoot',
                  type: 'select',
                  isInline: true,
                  options: settingsGroups,
                  handlers: {
                     'change': function()
                     {
                        outer.controller.serviceTemplate.settingsRoot = jQuery(this).val();
                     }
                  }
               },
               customerName:
               {
                  label: 'Customer Name',
                  id: 'customerName',
                  type: 'text',
                  isInline: true,
                  handlers: {
                     'change': function()
                     {
                        outer.controller.serviceTemplate.customerName = jQuery(this).val().trim();
                     }
                  }
               },
               isUsFederalCustomer:
               {
                  label: 'US Federal Customer',
                  id: 'isUsFederalCustomer',
                  type: 'select',
                  isInline: true,
                  maxItems: 1,
                  options:
                  [
                     {
                        label: 'Yes',
                        value: 'true'
                     },
                     {
                        label: 'No',
                        value: 'false'
                     }
                  ],
                  handlers: {
                     'change': function()
                     {
                        outer.controller.serviceTemplate.isUsFederalCustomer = jQuery(this).val() === 'true';
                     }
                  }
               },
               notes:
               {
                  label: 'Notes',
                  id: 'notes',
                  type: 'text',
                  isInline: true,
                  handlers: {
                     'change': function()
                     {
                        outer.controller.serviceTemplate.notes = jQuery(this).val().trim();
                     }
                  }
               }
            }
      });
      formBuilder.buildForm('#customer-info-panel-bdy');
   };

   // Renders the final review page for a service activation
   // Activation template should be completely filled and validated before calling
   this.renderReviewPage = function(serviceRevision, template)
   {
      this.basePanel.append('<h2>Review and Activate</h2>');
      this.renderServiceDetails(serviceRevision);
      const stepsPanel = pageModule.getNewPanel('steps');
      jQuery('.panel-title', stepsPanel).text('Steps');
      stepsPanel.css('width', 'calc(100%)');
      this.basePanel.append(stepsPanel);
      let stepIndex;
      let step;
      let stepPanel;
      let reviewStep;
      let formBuilder;
      const steps = this.prepareForReview(template.steps);
      for (stepIndex = 0; stepIndex < steps.length; stepIndex = stepIndex + 1)
      {
         step = steps[stepIndex];
         reviewStep = jQuery.extend(true, {}, step);

         stepPanel = pageModule.getNewPanel('Step ' + (stepIndex + 1) + ': ' + step.name);
         stepsPanel.append(stepPanel);

         reviewStep.setReviewFormat();
         formBuilder = new FormBuilder(reviewStep);
         formBuilder.buildFormInObj(jQuery('.panel-body', stepPanel));
      }

      this.basePanel.append(jQuery('<div/>').
         append(jQuery('<input/>').
            prop('type','checkbox').
            css('margin', '5px').
            click(function(){
               outer.controller.serviceTemplate.debug = jQuery(this).is(':checked');
            })).
         append(jQuery('<label/>').
            append('Run in Debug mode'))
       );
      this.basePanel.append(jQuery('<button/>').
         addClass('btn').
         addClass('btn-primary').
         addClass('pull-right').
         css('margin', '5px').
         append('Activate').
         click(this.confirmActivate.bind(this)));
      this.basePanel.append(jQuery('<button/>').
         addClass('btn').
         addClass('btn-primary').
         addClass('pull-right').
         css('margin', '5px').
         append('Edit Service Parameters').
         click(function()
         {
            outer.clear();
            outer.showView(
               outer.controller.service,
               outer.controller.serviceTemplate,
               outer.controller.settingsGroups
            );
         }));
   };

   this.prepareForReview = function(steps)
   {
      let stepIndex;
      let step;
      let ret = [];
      for (stepIndex = 0; stepIndex < steps.length; stepIndex = stepIndex + 1)
      {
         step = steps[stepIndex];
         ret.push(step);
         if (step.type === 'conditional')
         {
            ret = ret.concat(this.prepareForReview(step.trueSteps));
            ret = ret.concat(this.prepareForReview(step.falseSteps));
         }
         else if (step.type === 'loop')
         {
            ret = ret.concat(this.prepareForReview(step.steps));
         }
      }
      return ret;
   };

   this.confirmActivate = function()
   {
      const warning = 'WARNING: Activation success depends on ' +
            'the validity of the parameters specified here. Please ensure they are correct before continuing';
      const callback = function(result)
      {
         if (result)
         {
            outer.controller.activateService();
         }
      };
      bootbox.confirm({
         message: warning,
         buttons: {
            confirm: { label: 'Activate' },
            cancel: { label: 'Cancel' }
         },
         callback: callback
      });
   };

   this.clear = function()
   {
      jQuery('#' + this.baseId).empty();
   };

   this.showError = function(messages)
   {
      let message = '';
      if (Array.isArray(messages))
      {
         let messageIndex;
         for (messageIndex = 0; messageIndex < messages.length; messageIndex = messageIndex + 1)
         {
            message = message + '<br>' + messages[messageIndex];
         }
      }
      else
      {
         message = messages;
      }
      bootbox.alert({
         title: 'Error',
         message: message
      });
   };

   this.ctor = function(theController, theBaseId)
   {
      this.controller = theController;
      this.baseId = theBaseId;
      this.basePanel = jQuery('#' + this.baseId);
   };

   return this.ctor(controller, baseId);
};
