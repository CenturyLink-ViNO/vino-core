/* globals jQuery              */
/* globals StepWizardView      */
/* exported StepWizardController */

'use strict';

window.StepWizardController = function(steps, options)
{
   this.currentStepIndex = 0;

   this.stepLists = [];

   this.options =
   {
      reviewTab: false,
      onComplete: function()
      {
         // Do nothing
      }
   };

   this.render = function(baseId)
   {
      this.view = new StepWizardView(this, baseId);
      this.view.showView(this.steps, this.options.reviewTab);
      this.currentStepIndex = 0;
   };

   this.changedTab = function(index)
   {
      const step = this.steps[this.currentStepIndex];
      this.view.updateStepFromForm(step);
      if (step.type === 'conditional')
      {
         let stepIndex;
         let substep;
         for (stepIndex = 0; stepIndex < step.trueSteps.length; stepIndex = stepIndex + 1)
         {
            substep = step.trueSteps[stepIndex];
            this.view.updateStepFromForm(substep);
         }
         for (stepIndex = 0; stepIndex < step.falseSteps.length; stepIndex = stepIndex + 1)
         {
            substep = step.falseSteps[stepIndex];
            this.view.updateStepFromForm(substep);
         }
      }
      this.currentStepIndex = index;
   };

   this.moveNextStep = function()
   {
      if (this.steps.length > 0)
      {
         const step = this.steps[this.currentStepIndex];
         if (!this.onReviewTab)
         {
            this.view.updateStepFromForm(step);

            step.fillInputParameterList();
            let valid = step.validate();

            if (!valid.isValid)
            {
               this.view.showError('The current step contains invalid or missing parameters: \n' + valid.errors);
               return;
            }
            if (step.type === 'conditional')
            {
               this.moveConditionalStep(step);
            }
            else if (step.type === 'loop')
            {
               let stepIndex;
               let substep;
               for (stepIndex = 0; stepIndex < step.steps.length; stepIndex = stepIndex + 1)
               {
                  substep = step.steps[stepIndex];
                  this.view.updateStepFromForm(substep);

                  substep.fillInputParameterList();
                  valid = substep.validate();

                  if (!valid.isValid)
                  {
                     this.view.showError('The current step contains invalid or missing parameters: \n' + valid.errors);
                     return;
                  }
               }
            }
         }
      }
      if (this.currentStepIndex < this.steps.length - 1)
      {
         this.currentStepIndex = this.currentStepIndex + 1;
         this.view.goToTab(this.currentStepIndex);
      }
      else if (this.options.reviewTab && !this.onReviewTab)
      {
         this.showReview();
      }
      else
      {
         this.completedWizard();
      }
   };

   this.moveConditionalStep = function(step)
   {
      let stepIndex;
      let substep;
      let valid;
      if (step.evaluationResult === null || step.evaluationResult === true)
      {
         for (stepIndex = 0; stepIndex < step.trueSteps.length; stepIndex = stepIndex + 1)
         {
            substep = step.trueSteps[stepIndex];
            this.view.updateStepFromForm(substep);

            substep.fillInputParameterList();
            valid = substep.validate();

            if (!valid.isValid)
            {
               this.view.showError('The current step contains invalid or missing parameters: \n' + valid.errors);
               return;
            }
         }
      }
      if (step.evaluationResult === null || step.evaluationResult === false)
      {
         for (stepIndex = 0; stepIndex < step.falseSteps.length; stepIndex = stepIndex + 1)
         {
            substep = step.falseSteps[stepIndex];
            this.view.updateStepFromForm(substep);

            substep.fillInputParameterList();
            valid = substep.validate();

            if (!valid.isValid)
            {
               this.view.showError('The current step contains invalid or missing parameters: \n' + valid.errors);
               return;
            }
         }
      }
   };

   this.movePrevStep = function()
   {
      this.onReviewTab = false;
      if (this.currentStepIndex > 0)
      {
         this.currentStepIndex = this.currentStepIndex - 1;
         this.view.goToTab(this.currentStepIndex);
      }
      else
      {
         if (this.stepLists.length > 0)
         {
            this.steps = this.stepLists.pop();
            this.view.clearTabs();
            this.view.createTabs(this.steps, this.options.reviewTab);
            this.currentStepIndex = this.steps.length - 1;
            this.view.goToTab(this.currentStepIndex);
         }
      }
   };

   this.showReview = function()
   {
      this.view.renderReviewTab(this.steps);
      this.currentStepIndex = this.currentStepIndex + 1;
      this.onReviewTab = true;
      this.view.goToTab(this.currentStepIndex);
   };
   this.completedWizard = function()
   {
   // /TODO: final validation

      this.options.onComplete(this.steps);
   };

   this.ctor = function(theSteps, theOptions)
   {
      this.steps = theSteps;
      if (theOptions !== undefined && typeof theOptions === 'object')
      {
         jQuery.extend(this.options, theOptions);
      }
   };
   return this.ctor(steps, options);
};
