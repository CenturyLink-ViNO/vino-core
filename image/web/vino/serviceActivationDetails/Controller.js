/* globals jQuery                          */
/* globals ServiceActivationDetailView  */
/* globals console */
/* globals jsInclude */
/* exported ServiceActivationDetailController  */

'use strict';

window.ServiceActivationDetailController = function(service, baseId, panel, model, jobId)
{
   const outer = this;
   this.dataObject = null;
   this.render = function()
   {
      const def = new jQuery.Deferred(function(deferred)
      {
         jQuery.when(
            jsInclude('vino/serviceActivationDetails/Data.js'),
            jsInclude('vino/serviceActivationDetails/View.js')
         ).done(function()
         {
            outer.view = new ServiceActivationDetailView(outer);

            jQuery.when(outer.view.renderUiElement(outer.baseId, outer.panel, outer.service)).
               done(function()
               {
                  deferred.resolve();
               });
         }).
            fail(function()
            {
               deferred.reject();
            });
      });
      return def.promise();
   };
   this.setDataObject = function(data)
   {
      this.dataObject = data;
   };
   this.processParameterValue = function(parameter)
   {
      let ret = null;
      switch (parameter.parameterType)
      {
      case 'string': {
         if (parameter.stringValue)
         {
            if (parameter.parameterName.indexOf('password') === -1)
            {
               ret = parameter.stringValue;
            }
            else
            {
               ret = '******';
            }
         }
         else
         {
            ret = '';
         }
         break;
      }
      case 'enumerated': {
         if (parameter.enumeratedValue)
         {
            ret = parameter.enumeratedValue;
         }
         else
         {
            ret = '';
         }
         break;
      }
      case 'json': {
         if (parameter.jsonValue)
         {
            ret = parameter.jsonValue;
         }
         else
         {
            ret = '';
         }
         break;
      }
      case 'number': {
         if (parameter.numberValue !== null && parameter.numberValue !== undefined)
         {
            ret = parameter.numberValue;
         }
         else
         {
            ret = '';
         }
         break;
      }
      case 'boolean': {
         if (parameter.booleanValue === undefined)
         {
            ret = '';
         }
         else
         {
            ret = parameter.booleanValue;
         }
         break;
      }
      case 'stringList': {
         ret = this.stringListToString(parameter.stringListValue);
         break;
      }
      case 'numberList': {
         ret = this.numberListToString(parameter.numberListValue);
         break;
      }
      case 'booleanList': {
         ret = this.booleanListToString(parameter.booleanListValue);
         break;
      }
      default: {
         console.warn('An unexpected paramter type [' + parameter.parameterType + '] ' +
         'was encountered while processing a parameter value.');
         ret = '';
         break;
      }
      }
      return ret;
   };

   this.stringListToString = function(stringList)
   {
      let ret;
      let sep;
      if (stringList && Array.isArray(stringList))
      {
         ret = '';
         sep = '';
         let listIndex;
         for (listIndex = 0; listIndex < stringList.length; listIndex = listIndex + 1)
         {
            ret = ret + sep + stringList[listIndex];
            sep = ', ';
         }
      }
      else
      {
         ret = '';
      }
      return ret;
   };

   this.numberListToString = function(numberList)
   {
      let ret;
      let sep;
      if (numberList && Array.isArray(numberList))
      {
         ret = '';
         sep = '';
         let listIndex;
         for (listIndex = 0; listIndex < numberList.length; listIndex = listIndex + 1)
         {
            ret = ret + sep + numberList[listIndex].toString();
            sep = ', ';
         }
      }
      else
      {
         ret = '';
      }
      return ret;
   };

   this.booleanListToString = function(booleanList)
   {
      let ret;
      let sep;
      if (booleanList && Array.isArray(booleanList))
      {
         ret = '';
         sep = '';
         let listIndex;
         for (listIndex = 0; listIndex < booleanList.length; listIndex = listIndex + 1)
         {
            ret = ret + sep + booleanList[listIndex].toString();
            sep = ', ';
         }
      }
      else
      {
         ret = '';
      }
      return ret;
   };

   this.renderStepData = function()
   {
      const stepId = jQuery('#step', this.view.panel).val();
      const stepMeta = this.dataObject.stepMap[stepId];
      if (!stepMeta)
      {
         return;
      }
      jQuery.when(
          outer.model.loadServiceStepDetails(outer.jobId, stepMeta.wrapperId),
      ).done(function(selectedStep)
      {
         outer.dataObject.updateStepMap(selectedStep);
         const step = outer.dataObject.stepMap[stepId];
         const inputParameters = [];
         const outputParameters = [];
         let index;
         let parameter;
         for (index in step.inputParameters)
         {
            if (step.inputParameters.hasOwnProperty(index))
            {
               parameter = step.inputParameters[index];
               inputParameters.push({
                  parameterName: parameter.parameterName,
                  parameterDescription: parameter.parameterDescription,
                  parameterType: parameter.parameterType,
                  parameterValue: outer.processParameterValue(parameter)
               });
            }
         }
         for (index in step.outputParameters)
         {
            if (step.outputParameters.hasOwnProperty(index))
            {
               parameter = step.outputParameters[index];
               outputParameters.push({
                  parameterName: parameter.parameterName,
                  parameterDescription: parameter.parameterDescription,
                  parameterType: parameter.parameterType,
                  parameterValue: outer.processParameterValue(parameter)
               });
            }
         }
         const inputData = { data: inputParameters };
         const outputData = { data: outputParameters };
         outer.view.renderStepData(inputData, outputData);
      });
   };
   this.ctor = function(theService, theBaseId, thePanel, theModel, theJobId)
   {
      this.baseId = theBaseId;
      this.panel = thePanel;
      this.service = theService;
      this.model = theModel;
      this.jobId = theJobId;
      return this;
   };
   return this.ctor(service, baseId, panel, model, jobId);
};
