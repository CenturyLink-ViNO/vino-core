/* globals jQuery                 */
/* globals AbstractDataObject     */
/* exported ServiceActivationDetailData  */

'use strict';

window.ServiceActivationDetailData = function(json, controller)
{
   const outer = this;
   this.controller = null;
   this.id = '';
   this.customerName = '';
   this.isUsFederalCustomer = 'false';
   this.settingsRootGroup = '';
   this.visible = true;
   this.notes = '';
   this.cugId = '';
   this.state = '';
   this.referenceId = '';
   this.steps = [];
   this.status = [];
   this.stepMap = {};
   this.step = null;

   this.format =
   {
      id: {
         id: 'id',
         type: 'info',
         label: 'Job ID'
      },
      customerName: {
         id: 'customerName',
         type: 'info',
         label: 'Customer Name'
      },
      isUsFederalCustomer: {
         id: 'isUsFederalCustomer',
         type: 'info',
         label: 'US Federal Customer'
      },
      settingsRootGroup: {
         id: 'settingsRootGroup',
         type: 'info',
         label: 'Settings Root'
      },
      state: {
         id: 'state',
         type: 'info',
         label: 'Activation Status'
      },
      notes: {
         id: 'notes',
         type: 'info',
         label: 'Activation Notes'
      },
      step: {
         id: 'step',
         type: 'select',
         label: 'Select Step for Details',
         options: [],
         handlers:
         {
            'change': function()
            {
               outer.controller.renderStepData();
            }
         }
      },
      inputParameters: {
         id: 'inputParameters',
         type: 'section',
         label: 'Input Parameters'
      },
      outputParameters: {
         id: 'outputParameters',
         type: 'section',
         label: 'Output Parameters'
      }
   };

   this.updateStepMap = function(step)
   {
      var index;
      if (step && step.nodeId && Array.isArray(step.steps))
      {
         for (index in step.steps)
         {
            if (step.steps.hasOwnProperty(index))
            {
               const innerStep = step.steps[index];
               if (innerStep)
               {
                  innerStep.wrapperId = step.id;
                  this.stepMap[innerStep.nodeId + '_' + index] = innerStep;
               }
            }
         }
      }
   };

   this.ctor = function(jsonData, theController)
   {
      let key;
      let id;
      let index;
      this.controller = theController;
      jQuery.extend(this, new AbstractDataObject());
      if (typeof jsonData !== 'undefined')
      {
         this.fromJson(jsonData);
         this.id = jsonData.id;
      }
      if (this.steps)
      {
         for (key in this.steps)
         {
            if (this.steps.hasOwnProperty(key))
            {
               const step = this.steps[key];
               if (step)
               {
                  this.updateStepMap(step);
               }
            }
         }
      }
      for (id in this.stepMap)
      {
         if (this.stepMap.hasOwnProperty(id))
         {
            let label = this.stepMap[id].name;
            if (this.stepMap[id].iterationCount > 0)
            {
               label += ' Iteration ' + (this.stepMap[id].iterationCount + 1).toString();
            }
            this.format.step.options.push({
               label: label,
               value: id
            });
            if (this.stepMap[id].id === 0)
            {
               this.step = id;
            }
         }
      }
      return this;
   };
   return this.ctor(json, controller);
};
