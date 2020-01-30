/* globals jQuery              */
/* globals pageModule          */
/* globals BootstrapTabPanel   */
/* globals FormBuilder         */
/* exported StepWizardView     */
/* globals bootbox                */

'use strict';

window.StepWizardView = function(controller, baseId)
{
   const outer = this;

   this.showView = function(steps, reviewPanel)
   {
      this.tabPanel = new BootstrapTabPanel(jQuery('.panel-body', this.basePanel));
      this.tabs = jQuery('.nav-tabs', this.basePanel);
      this.createTabs(steps, reviewPanel);
      this.basePanel.append(jQuery('<button/>').
         addClass('btn').
         addClass('btn-primary').
         addClass('pull-right').
         css('margin', '5px').
         append('Next').
         click(this.controller.moveNextStep.bind(this.controller)));
      this.basePanel.append(jQuery('<button/>').
         addClass('btn').
         addClass('btn-primary').
         addClass('pull-right').
         css('margin', '5px').
         append('Back').
         click(this.controller.movePrevStep.bind(this.controller)));
   };

   this.createTabs = function(steps, reviewPanel)
   {
      let stepIndex;
      let step;
      let div;
      let divId;
      let target;
      for (stepIndex = 0; stepIndex < steps.length; stepIndex = stepIndex + 1)
      {
         step = steps[stepIndex];
         if (this.stepHasConfigurableParameters(step))
         {
            divId = 'step_' + step.id + '_section';
            div = jQuery('<div/>').attr('id', divId);
            this.tabPanel.addTab(
               'step_' + step.id,
               'Step ' + (stepIndex + 1) + ': ' + step.name,
               div
            );
            target = jQuery('a', this.tabs[0].childNodes[stepIndex]);
            // Notify controller if user manually changes tab
            target.click(this.controller.changedTab.bind(this.controller, stepIndex));
            this.renderStepDetailsPanel(step, div);
            this.renderStepParametersPanel(step, div);
         }
      }
      if (reviewPanel)
      {
         divId = 'review_section';
         div = jQuery('<div/>').attr('id', divId);
         this.tabPanel.addTab('review', 'Review', div);
      }
   };

   this.stepHasConfigurableParameters = function(step)
   {
      let ret = false;
      if (step.inputParameters && Array.isArray(step.inputParameters) && step.inputParameters.length > 0)
      {
         for (let parameter of step.inputParameters)
         {
            if (parameter.inputDetails && !parameter.inputDetails.isFinal)
            {
               ret = true;
               break;
            }
         }
      }
      return ret;
   };

   this.clearTabs = function()
   {
      this.tabPanel.clearTabs();
   };

   this.renderStepDetailsPanel = function(step, parent)
   {
      const stepDetailPanel = jQuery('<div>');
      parent.append(stepDetailPanel);
      const formBuilder = new FormBuilder({
         stepName: step.name,
         nodeId: step.id,
         description: step.description,
         format:
               {
                  stepName:
                  {
                     label: 'Name',
                     id: 'stepName',
                     type: 'info',
                     isInline: true
                  },
                  nodeId:
                  {
                     label: 'Node ID',
                     id: 'nodeId',
                     type: 'info',
                     isInline: true
                  },
                  description:
                  {
                     label: 'Description',
                     id: 'description',
                     type: 'info',
                     isInline: true
                  }
               }
      });
      formBuilder.buildFormInObj(stepDetailPanel);
   };

   this.renderConditionalPreview = function(step, panelId)
   {
      const panel = jQuery('#' + panelId);
      jQuery('#' + step.id + '_conditionalPreview').remove();
      jQuery('#step' + step.id + '_falsePanel').show();
      jQuery('#step' + step.id + '_truePanel').show();
      const right = jQuery('#step' + step.id + '_rhs').val();
      const left = jQuery('#step' + step.id + '_lhs').val();
      const operation = jQuery('#step' + step.id + '_op').val();
      const dataType = jQuery('#step' + step.id + '_dataType').val();
      let conditionalString = 'The conditional will evaluate to true if: ' + step.getConditionalString(right, left, operation, dataType);
      const conditionalPreview = jQuery('<div/>').attr('id', step.id + '_conditionalPreview');
      if (step.canBeEvaluated)
      {
         try
         {
            const result = step.evaluateCondition(right, left, operation, dataType);
            if (result)
            {
               jQuery('#step' + step.id + '_falsePanel').hide();
            }
            else
            {
               jQuery('#step' + step.id + '_truePanel').hide();
            }
            conditionalString = 'This condition will evaluate ' + result;
         }
         catch (err)
         {
            conditionalString = err;
         }
      }
      conditionalPreview.append('<br>').
         append(jQuery('<h4/>').text(conditionalString)).
         appendTo(panel);
   };

   this.renderStepParametersPanel = function(step, parent)
   {
      const stepParamPanelId = 'step-' + step.id + '-param-panel-bdy';
      const stepParamPanel = pageModule.getNewPanel('Parameters');
      stepParamPanel.css('width', 'calc(99%)');
      jQuery('.panel-body', stepParamPanel).attr('id', stepParamPanelId);
      parent.append(stepParamPanel);
      let inputIndex;
      let inputParam;
      let formBuilder;
      step.setEditFormat();
      if (step.type === 'conditional')
      {
         formBuilder = new FormBuilder(step);
         jQuery.when(formBuilder.buildForm('#' + stepParamPanelId)).done(function()
         {
            outer.renderConditionalPreview(step, stepParamPanelId);
            for (inputIndex = 0; inputIndex < step.inputParameters.length; inputIndex = inputIndex + 1)
            {
               inputParam = step.inputParameters[inputIndex];

               jQuery('#step' + step.id + '_' + inputParam.parameterKey).on('change', function()
               {
                  step.resetEvaluationResult();
                  outer.renderConditionalPreview(step, stepParamPanelId);
               });
               if (inputParam.inputDetails.isFinal && inputParam.displayValue !== '')
               {
                  const input = jQuery('#step' + step.id + '_' + inputParam.parameterKey);

                  if (input[0].selectize)
                  {
                     input[0].selectize.disable();
                  }
                  else
                  {
                     input.prop('disabled', true);
                  }
               }
            }
         });
         this.generateConditionalPanel(step, stepParamPanel);
      }
      else if (step.type === 'loop')
      {
         formBuilder = new FormBuilder(step);
         jQuery.when(formBuilder.buildForm('#' + stepParamPanelId)).done(function()
         {
            for (inputIndex = 0; inputIndex < step.inputParameters.length; inputIndex = inputIndex + 1)
            {
               inputParam = step.inputParameters[inputIndex];
               if (inputParam.inputDetails.isFinal && inputParam.displayValue !== '')
               {
                  const input = jQuery('#step' + step.id + '_' + inputParam.parameterKey);
                  if (input[0].selectize)
                  {
                     input[0].selectize.disable();
                  }
                  else
                  {
                     input.prop('disabled', true);
                  }
               }
            }
         });
         this.generateLoopPanel(step, stepParamPanel);
      }
      else
      {
         if (step.inputParameters.length > 0)
         {
            formBuilder = new FormBuilder(step);
            formBuilder.buildForm('#' + stepParamPanelId);

            this.splitFormIntoTwoPanels(jQuery('#' + stepParamPanelId + '> .bv-form'));
         }
         else
         {
            jQuery('.panel-body', stepParamPanel).append('No Parameters for this step.');
         }
      }

      if (jQuery('.preConfigured').length > 0)
      {
         jQuery('.preConfigured', stepParamPanel).each(/* @this jqElement */ function()
         {
            let jqElement = this;
            jQuery(jqElement).hide();
            jQuery('input', jQuery(jqElement)).attr('readonly', true);
            jQuery('input', jQuery(jqElement)).parent().on('dblclick', /* @this jqElement */ function()
            {
               jqElement = this;
               const input = jQuery('input', jQuery(jqElement));
               bootbox.confirm({
                  message: 'Are you sure you want to override this value?',
                  callback: function(result)
                  {
                     if (result)
                     {
                        jQuery(input).val('');
                        jQuery(input).attr('readonly', false);
                        jQuery(outer).off('dblclick');
                     }
                  }
               });
            });
         });
         stepParamPanel.children('.panel-body').prepend(jQuery('<button>').
            css('margin-bottom', '10px').
            text('Show Pre-Configured Parameters').
            on('click', /* @this jqElement */ function()
            {
               let jqElement = this;
               if (jQuery(jqElement).text() === 'Show Pre-Configured Parameters')
               {
                  jQuery(jqElement).text('Hide Pre-Configured Parameters');
               }
               else
               {
                  jQuery(jqElement).text('Show Pre-Configured Parameters');
               }
               jQuery('.preConfigured', stepParamPanel).each(/* @this jqElement */ function()
               {
                  jqElement = this;
                  jQuery(jqElement).toggle();
               });
            }));
      }
   };

   this.generateConditionalPanel = function(step, parent)
   {
      const truePanel = pageModule.getNewPanel('If condition evaluates to true');
      truePanel.attr('id', 'step' + step.id + '_truePanel');
      jQuery('.panel-body', truePanel).
         append(jQuery('<p/>').
            text('The following steps will activate if the conditional evaluates to true...'));
      parent.append(truePanel);
      const falsePanel = pageModule.getNewPanel('If condition evaluates to false');
      falsePanel.attr('id', 'step' + step.id + '_falsePanel');
      jQuery('.panel-body', falsePanel).
         append(jQuery('<p/>').
            text('The following steps will activate if the conditional evaluates to false...'));
      parent.append(falsePanel);
      this.generateControlFlowSubstepPanel(step.trueSteps, truePanel, false);
      this.generateControlFlowSubstepPanel(step.falseSteps, falsePanel, false);
   };

   this.generateLoopPanel = function(step, parent)
   {
      this.generateControlFlowSubstepPanel(step.steps, parent, false);
   };

   this.generateControlFlowSubstepPanel = function(stepsList, parent, split)
   {
      let stepIndex;
      let substep;
      let panel;
      let panelId;
      const substepPanelCallback = function()
      {
         let index;
         for (index in substep.inputParameters)
         {
            if (substep.inputParameters.hasOwnProperty(index))
            {
               const parameter = substep.inputParameters[index];
               if (parameter.isNestedList)
               {
                  const listSection = panel.find('.step' + substep.id + '_' + parameter.parameterKey);
                  const listDiv = jQuery('<div class="col-md-12"></div>');
                  const addInputButton = jQuery('<button type="button">Add Entry</button>');
                  addInputButton.attr('parameter', parameter.parameterName);
                  addInputButton.click(/* @this jqElement */ function()
                  {
                     const jqElement = this;
                     const inputDiv = jQuery('<div></div>');
                     const selectizeDiv = jQuery('<div style="width:400px; display:inline-block;"></div>');
                     const inputSelectize = jQuery('<input type="text"></input>');
                     const inputRemoveButton = jQuery('<button ' +
                           'style="display:inline-block;"">Remove</button>');
                     inputRemoveButton.click(function()
                     {
                        inputDiv.remove();
                     });
                     selectizeDiv.append(inputSelectize);
                     inputDiv.append(selectizeDiv).append(inputRemoveButton);
                     jQuery(jqElement).before(inputDiv);
                     inputSelectize.selectize({
                        maxItems: 100,
                        create: true,
                        createOnBlur: true,
                        duplicates: true
                     });
                  });
                  listDiv.append(addInputButton).append(jQuery('<br><br>'));
                  listSection.append(listDiv);
               }
            }
         }
      };
      for (stepIndex = 0; stepIndex < stepsList.length; stepIndex = stepIndex + 1)
      {
         // Create a panel for each sub-step
         substep = stepsList[stepIndex];
         panelId = parent.attr('id') + '_step_' + substep.id;
         panel = pageModule.getNewPanel(panelId);
         if (!split)
         {
            panel.css('width', 'calc(99%)');
         }
         parent.append(panel);
         switch (substep.type)
         {
         // For actions we allow the parameters to be filled in directly
         case 'action': {
            jQuery('.panel-title', panel).text('Step ' + (stepIndex + 1) + ': ' + substep.name);
            if (substep.inputParameters.length > 0)
            {
               substep.setEditFormat();
               const formBuilder = new FormBuilder(substep);
               jQuery.when(formBuilder.buildForm('#' + panelId)).done(substepPanelCallback());
            }
            else
            {
               panel.append('No Parameters for this step.');
            }
            break;
         }
         // For everyting else we provide an option to open another instance of the wizard for the 2nd generation
         // sub-steps
         case 'loop': {
            // TODO
            break;
         }
         case 'conditional': {
            // Create button to open new wizard in modal
            break;
         }
         case 'service': {
            // TODO
            break;
         }
         default:
            break;
         }
      }
   };

   this.goToTab = function(index)
   {
      const tabs = jQuery('#' + this.baseId + ' .panel-body > .nav-tabs');
      const target = jQuery('a', tabs[0].childNodes[index]);
      target.trigger('click');
   };

   this.validateForm = function(index)
   {
      const div = jQuery('#step_' + index + '_section');
      jQuery('form:last', div).data('bootstrapValidator').validate();
   };

   // Uses the format defined on each step to grab the correct value from the input and store as a property of the step
   this.updateStepFromForm = function(step)
   {
      let field;
      for (field in step.format)
      {
         if (!jQuery('#' + step.format[field].id).attr('readonly'))
         {
            if (step.format.hasOwnProperty(field))
            {
               if (step.format[field].type === 'section')
               {
                  if (step.format[field].hasOwnProperty('listType'))
                  {
                     const nestedList = [];
                     const listInputs = jQuery('.' + step.format[field].id + ' .selectized');
                     let index;
                     for (index = 0; index < listInputs.length; index = index + 1)
                     {
                        const listInput = listInputs[index];
                        nestedList.push(this.convertStringToList(listInput.value, step.format[field].listType));
                     }
                     step[field] = nestedList;
                  }
               }
               else
               {
                  step[field] = jQuery('#' + step.format[field].id).val();
               }
            }
         }
      }
   };

   this.convertStringToList = function(string, listType)
   {
      const ret = [];
      const list = string.split(',');
      let listIndex;
      if (listType === 'booleanList')
      {
         for (listIndex in list)
         {
            if (list.hasOwnProperty(listIndex))
            {
               const boolean = list[listIndex].trim();
               ret.push(boolean === 'true');
            }
         }
      }
      else if (listType === 'numberList')
      {
         for (listIndex in list)
         {
            if (list.hasOwnProperty(listIndex))
            {
               const number = list[listIndex].trim();
               ret.push(parseFloat(number));
            }
         }
      }
      else
      {
         for (listIndex in list)
         {
            if (list.hasOwnProperty(listIndex))
            {
               ret.push(list[listIndex].trim());
            }
         }
      }
      return ret;
   };

   // Utility function to take a form and split it's fields into two columns
   this.splitFormIntoTwoPanels = function(form)
   {
      const leftPanel = jQuery('<div/>').addClass('col-md-6');
      form.append(leftPanel);

      const rightPanel = jQuery('<div/>').addClass('col-md-6');
      form.append(rightPanel);
      const fields = jQuery('.form-group', form);
      fields.each(/* @this jqElement */ function(idx)
      {
         const jqElement = this;
         if (idx % 2 === 0)
         {
            jQuery(jqElement).detach().
               appendTo(leftPanel);
         }
         else
         {
            jQuery(jqElement).detach().
               appendTo(rightPanel);
         }
      });
   };

   this.renderReviewTab = function(steps)
   {
      const reviewDiv = jQuery('#review_section').empty();
      reviewDiv.append('<h3>Review</h3>');
      let stepIndex;
      let step;
      let stepPanel;
      let formBuilder;
      for (stepIndex = 0; stepIndex < steps.length; stepIndex = stepIndex + 1)
      {
         step = steps[stepIndex];
         stepPanel = pageModule.getNewPanel('step_' + step.id + '_review');
         reviewDiv.append(stepPanel);
         step.setReadOnlyFormat();
         formBuilder = new FormBuilder(step);
         formBuilder.buildForm('#step_' + step.id + '_review > .panel-body');
      }
   };

   this.showError = function(message)
   {
      pageModule.showError(this.baseId, message);
   };


   this.ctor = function(theController, theBaseId)
   {
      this.controller = theController;
      this.baseId = theBaseId;
      this.basePanel = jQuery('#' + this.baseId);
   };

   return this.ctor(controller, baseId);
};
