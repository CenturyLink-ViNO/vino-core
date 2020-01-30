/* globals jQuery              */
/* globals AbstractDataObject  */
/* globals Step                */
/* exported ServiceTemplate */

'use strict';

window.ServiceTemplate = function(data)
{
   this.serviceName = '';
   this.referenceId = ''; // Should be a valid ServiceRevision ID
   this.desiredVersion = 0;
   this.cugId = '';
   this.settingsRoot = '';
   this.notes = '';
   this.settingsRootRequired = false;
   this.customerName = '';
   this.steps = []; // Step[]
   this.debug = false;

   this.validate = function()
   {
      let stepIndex;
      let step;
      let valid;
      const ret =
      {
         isValid: true,
         errors: []
      };
      if (this.settingsRootRequired && !this.settingsRoot)
      {
         ret.isValid = false;
         ret.errors.push({
            step: 'N/A',
            index: -1,
            errors: 'Settings Root is required for this service'
         });
      }
      for (stepIndex = 0; stepIndex < this.steps.length; stepIndex = stepIndex + 1)
      {
         step = this.steps[stepIndex];
         valid = step.validate();
         if (valid.isValid === false)
         {
            ret.isValid = false;
            ret.errors.push({
               id: step.id.replace(/-/g, '.'),
               index: stepIndex,
               errors: valid.errors.join(', ')
            });
         }
      }
      return ret;
   };

   // For convience we restructed the steps in the activation template we got from ViNO so we have to put it back into
   // the format ViNO expects before activating
   this.toActivationTemplate = function()
   {
      const activationTemplate =
      {
         serviceName: this.serviceName,
         referenceId: this.referenceId,
         desiredVersion: this.desiredVersion,
         cugId: this.cugId,
         notes: this.notes,
         settingsRootGroup: this.settingsRoot,
         customerName: this.customerName,
         steps: this.processStepList(this.steps),
         debug: this.debug
      };

      return activationTemplate;
   };

   this.processStepList = function(steps)
   {
      let stepIndex;
      let step;
      const ret = [];
      for (stepIndex = 0; stepIndex < steps.length; stepIndex = stepIndex + 1)
      {
         let newStep = {};
         step = steps[stepIndex];
         newStep.id = step.id.replace(/-/g, '.');
         switch (step.type)
         {
         case 'action': {
            step.fillInputParameterList();
            newStep =
            {
               id: step.id.replace(/-/g, '.'),
               settingsRoot: step['step' + step.id + '_settingsRoot'],
               name: step.name,
               description: step.description,
               inputParameters: step.inputParameters
            };
            break;
         }
         case 'loop': {
            step.fillInputParameterList();
            newStep =
            {
               id: step.id.replace(/-/g, '.'),
               name: step.name,
               description: step.description,
               inputParameters: step.inputParameters,
               steps: this.processStepList(step.steps)
            };
            break;
         }
         case 'conditional': {
            step.fillInputParameterList();
            newStep =
            {
               id: step.id.replace(/-/g, '.'),
               name: step.name,
               description: step.description,
               inputParameters: step.inputParameters,
               trueSteps: this.processStepList(step.trueSteps),
               falseSteps: this.processStepList(step.falseSteps)
            };
            break;
         }
         case 'service': {
            break;
         }
         default:
            break;
         }
         ret.push(newStep);
      }
      return ret;
   };

   this.ctor = function(theData)
   {
      jQuery.extend(this, new AbstractDataObject());
      if (theData !== undefined)
      {
         this.fromJson(theData);
      }
      this.steps = this.steps.sort(function(aItem, bItem)
      {
         return aItem.id - bItem.id;
      });
      let stepIndex;
      let step;
      for (stepIndex = this.steps.length - 1; stepIndex >= 0; stepIndex = stepIndex - 1)
      {
         step = this.steps[stepIndex];
         if (step.inputParameters === undefined || step.inputParameters.length === 0)
         {
            this.steps.splice(stepIndex, 1);
         }
         else
         {
            this.steps[stepIndex] = new Step(step);
         }
      }
      return this;
   };

   return this.ctor(data);
};
