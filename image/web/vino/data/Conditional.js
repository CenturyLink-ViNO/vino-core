/* globals jQuery              */
/* globals Step                */
/* globals Parameter           */
/* exported Conditional */

'use strict';

window.Conditional = function(data, id)
{
   this.id = '';
   this.name = 'Conditional ' + id.toString();
   this.description = 'Select true or false for the value to determine which steps will be taken after this one';
   this.value = true;
   this.canBeEvaluated = true;
   this.evaluationResult = null;

   this.trueSteps = []; // Step[]
   this.falseSteps = []; // Step[]

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

         key = 'step' + this.id + '_' + inputParam.parameterKey.replace(/\W/g, '');
         inputFormat.id = key;

         if (inputParam.inputDetails.parameterSource === 'constants' ||
         inputParam.inputDetails.parameterSource === 'mapping' ||
         inputParam.inputDetails.parameterSource === 'msg')
         {
            this.canBeEvaluated = false;
         }

         this.editFormat[key] = inputFormat;

         this[key] = inputParam.displayValue;
      }
   };
   this.resetEvaluationResult = function()
   {
      this.evaluationResult = null;
   };

   this.evalutate = function(left, right, operation)
   {
      let ret;
      switch (operation)
      {
      case 'eq': {
         ret = left === right;
         break;
      }
      case 'lt': {
         ret = left < right;
         break;
      }
      case 'lte': {
         ret = left <= right;
         break;
      }
      case 'gt': {
         ret = left > right;
         break;
      }
      case 'gte': {
         ret = left >= right;
         break;
      }
      default:
         break;
      }
      return ret;
   };

   this.evaluateCondition = function(rightSide, leftSide, operation, dataType)
   {
      let right = rightSide;
      let left = leftSide;
      if (!this.canBeEvaluated)
      {
         throw new Error('This conditional cannot be evalutated');
      }

      switch (dataType)
      {
      case 'number': {
         if (right === '' || left === '')
         {
            throw new Error('Missing value for one side of conditional');
         }
         right = Number(right);
         left = Number(left);
         if (isNaN(right) || isNaN(left))
         {
            throw new Error('One or both sides of conditional are not a valid number value');
         }
         break;
      }
      case 'boolean': {
         if (right !== 'true' || right !== 'false')
         {
            throw new Error('Right side is not a valid boolean value. Must be "true" or "false"');
         }
         if (left !== 'true' || left !== 'false')
         {
            throw new Error('Left side is not a valid boolean value. Must be "true" or "false"');
         }
         right = right === 'true';
         left = left === 'true';
         if (operation !== 'eq')
         {
            throw new Error('Invalid operation for boolean data type');
         }
         break;
      }
      case 'string': {
         if (operation !== 'eq')
         {
            throw new Error('Invalid operation for string data type');
         }
         break;
      }
      default:
         break;
      }
      const ret = this.evalutate(left, right, operation);
      this.evaluationResult = ret;
      return ret;
   };

   this.getConditionalString = function(rightSide, leftSide, operation)
   {
      let opString = 'operation';
      let right = rightSide;
      let left = leftSide;

      if (right === undefined || right === '')
      {
         right = 'Right Hand Side';
      }
      if (left === undefined || left === '')
      {
         left = 'Left Hand Side';
      }
      if (operation !== null && operation !== undefined)
      {
         switch (operation)
         {
         case 'eq':
            opString = '==';
            break;
         case 'gt':
            opString = '>';
            break;
         case 'gte':
            opString = '>=';
            break;
         case 'lt':
            opString = '<';
            break;
         case 'lte':
            opString = '<=';
            break;
         default:
            break;
         }
      }
      return left + ' ' + opString + ' ' + right;
   };

   this.setReviewFormat = function()
   {
      let key;
      const format = {};
      format.name = {
         label: 'Name',
         id: 'name',
         type: 'info',
         isInline: true
      };
      format.description = {
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
      this.type = 'conditional';
      this.id = theId;
      let inputIndex;
      let stepsIndex;
      let param;
      let step;
      for (inputIndex = 0; inputIndex < this.inputParameters.length; inputIndex = inputIndex + 1)
      {
         param = this.inputParameters[inputIndex];
         this.inputParameters[inputIndex] = new Parameter(param);
      }
      for (stepsIndex = 0; stepsIndex < this.trueSteps.length; stepsIndex = stepsIndex + 1)
      {
         step = this.trueSteps[stepsIndex];
         this.trueSteps[stepsIndex] = new Step(step);
      }
      for (stepsIndex = 0; stepsIndex < this.falseSteps.length; stepsIndex = stepsIndex + 1)
      {
         step = this.falseSteps[stepsIndex];
         this.falseSteps[stepsIndex] = new Step(step);
      }
   };

   return this.ctor(data, id);
};
