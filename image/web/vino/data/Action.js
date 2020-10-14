/* globals jQuery              */
/* globals Step                */
/* globals Parameter           */
/* exported Action */

'use strict';

window.Action = function(data, id)
{
   this.id = '';
   this.name = '';
   this.description = '';
   this.settingsRoot = '';
   this.inputParameters = []; // Parameter[]


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

         key = 'step' + this.id + '_' + inputParam.parameterKey.replace(/\W/g, '');
         inputFormat.id = key;
         this.editFormat[key] = inputFormat;

         this[key] = inputParam.displayValue;
      }
   };

   this.setReviewFormat = function()
   {
      let key;
      for (key in this.format)
      {
         if (this.format.hasOwnProperty(key))
         {
            if (this.format[key].hasOwnProperty('type'))
            {
               if (this.format[key].type === 'textarea')
               {
                  this.format[key].useTextArea = true;
               }
               this.format[key].type = 'info';
            }
         }
      }
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
      const ret =
      {
         isValid: true,
         errors: []
      };
      let inputIndex;
      let param;
      let valid;
      for (inputIndex = 0; inputIndex < this.inputParameters.length; inputIndex = inputIndex + 1)
      {
         param = this.inputParameters[inputIndex];
         valid = param.validate();
         if (!valid.isValid)
         {
            ret.isValid = false;
            ret.errors.push(valid.error);
         }
      }
      return ret;
   };

   this.ctor = function(theData, theId)
   {
      jQuery.extend(this, new Step());
      if (theData !== undefined)
      {
         this.fromJson(theData);
      }
      let inputIndex;
      let param;
      this.inputParameters.sort(function(aItem, bItem)
      {
         if (!aItem.inputDetails || !aItem.inputDetails.displayOrder)
         {
            return 1;
         }
         if (!bItem.inputDetails || !bItem.inputDetails.displayOrder)
         {
            return -1;
         }
         if (aItem.inputDetails.displayOrder < bItem.inputDetails.displayOrder)
         {
            return -1;
         }
         if (aItem.inputDetails.displayOrder > bItem.inputDetails.displayOrder)
         {
            return 1;
         }
         return 0;
      });
      for (inputIndex = 0; inputIndex < this.inputParameters.length; inputIndex = inputIndex + 1)
      {
         param = this.inputParameters[inputIndex];
         this.inputParameters[inputIndex] = new Parameter(param);
      }
      this.type = 'action';
      this.id = theId;
   };

   return this.ctor(data, id);
};
