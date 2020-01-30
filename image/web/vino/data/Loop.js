/* globals jQuery              */
/* globals Step                */
/* globals Parameter           */
/* exported Loop */

'use strict';

window.Loop = function(data, id)
{
   this.id = '';
   this.name = '';
   this.description = '';
   this.type = 'loop';

   this.steps = []; // Step[]

   this.inputParameters = [];

   this.generateEditFormat = function()
   {
      let inputIndex;
      let inputParam;
      let inputFormat;
      let key;
      for (inputIndex = 0; inputIndex < this.inputParameters.length; inputIndex = inputIndex + 1)
      {
         inputParam = this.inputParameters[inputIndex];

         inputFormat = inputParam.getFormat();

         key = 'step' + this.id + '_' + inputParam.parameterKey;
         inputFormat.id = key;

         this.editFormat[key] = inputFormat;

         this[key] = inputParam.displayValue;
      }
   };

   this.setReviewFormat = function()
   {
      let key;
      const format = {};
      format.name =
      {
         label: 'Name',
         id: 'name',
         type: 'info',
         isInline: true
      };
      format.description =
      {
         label: 'Description',
         id: 'description',
         type: 'info',
         isInline: true
      };
      for (key in this.format)
      {
         if (this.format.hasOwnProperty(key))
         {
            if (this.format[key].hasOwnProperty('type'))
            {
               this.format[key].type = 'info';
            }
            format[key] = this.format[key];
         }
      }
      this.format = format;
   };

   this.fillInputParameterList = function()
   {
      let inputIndex;
      let inputParam;
      let key;
      for (inputIndex = 0; inputIndex < this.inputParameters.length; inputIndex = inputIndex + 1)
      {
         inputParam = this.inputParameters[inputIndex];
         key = 'step' + this.id + '_' + inputParam.parameterKey;
         if (this.hasOwnProperty(key))
         {
            // Don't populate preconfigured params if they haven't been overridden
            if (!(inputParam.preConfigured && this[key] === inputParam.displayValue))
            {
               inputParam.fillParameterValue(this[key]);
            }
         }
      }
   };

   this.validate = function()
   {
      return { isValid: true };
   };

   this.ctor = function(theData, theId)
   {
      jQuery.extend(this, new Step());
      if (theData !== undefined)
      {
         this.fromJson(theData);
      }
      let inputIndex;
      let stepIndex;
      let param;
      let step;
      for (inputIndex = 0; inputIndex < this.inputParameters.length; inputIndex = inputIndex + 1)
      {
         param = this.inputParameters[inputIndex];
         this.inputParameters[inputIndex] = new Parameter(param);
      }
      for (stepIndex = 0; stepIndex < this.steps.length; stepIndex = stepIndex + 1)
      {
         step = this.steps[stepIndex];
         this.steps[stepIndex] = new Step(step);
      }
      this.type = 'loop';
      this.id = theId;
   };

   return this.ctor(data, id);
};
