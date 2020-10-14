/* globals window      */
/* globals jQuery      */
/* globals pageModule  */
/* exported StatusView */

'use strict';

window.StatusView = function(baseId)
{
   this.createLoadingModal = function(description, isActivation, downstreamController)
   {
      this.modal = jQuery('<div/>').
         addClass('modal fade').
         attr('id', 'applyingChangesModal').
         append(jQuery('<div/>').
            addClass('modal-dialog').
            css('background-color', '#fff').
            css('border', '1px solid #8e8e8e').
            css('border-radius', '5px').
            append(jQuery('<div/>').
               addClass('modal-header').
               append(jQuery('<h2>').
                  text(description))).
            append(jQuery('<div/>').
               addClass('modal-body').
               append(jQuery('<div>').
                  attr('id', 'job-status-div')).
               append(jQuery('<img>').
                  attr('src', '/lib/abacus/img/loading.gif').
                  attr('id', 'statusLoadingImg'))).
            append(jQuery('<div>').
               addClass('modal-footer').
               append(jQuery('<button>').
                  text('Ok').
                  addClass('btn btn-primary').
                  css('position', 'relative').
                  css('right', '5px').
                  attr('data-dismiss', 'modal').
                  on('click', function()
                  {
                     window.location.href = '';
                  })).
               append(jQuery('<button>').
                  text('Cancel Activation').
                  addClass('btn btn-danger cancel-button').
                  css('position', 'relative').
                  css('right', '5px').
                  on('click', function()
                  {
                     downstreamController.cancelService();
                  }))));
      jQuery('body').append(this.modal.hide());
      if (!isActivation)
      {
         jQuery('.cancel-button', this.modal).remove();
      }
      jQuery('.modal').
         modal({
            backdrop: false,
            keyboard: false
         });
   };
   this.emptyStatusUpdates = function()
   {
      if (this.modal)
      {
         jQuery('#job-status-div', this.modal).empty();
      }
   };
   this.done = function()
   {
      jQuery('#statusLoadingImg', this.modal).remove();
      jQuery('.cancel-button', this.modal).remove();
   };
   this.cancelled = function()
   {
      jQuery('.cancel-button', this.modal).remove();
   };

   this.addStatusUpdate = function(statusEntry)
   {
      if (!this.modal)
      {
         this.createLoadingModal();
      }
      const statusDiv = jQuery('#job-status-div', this.modal);
      let statusClass;
      if (statusEntry.hasOwnProperty('status'))
      {
         switch (statusEntry.status)
         {
         case 'Starting':
         case 'Activating':
            statusClass = 'bs-callout-info';
            break;

            // case 'cancelled':
            // case 'servicecanceled':
            // statusClass = 'bs-callout-warning';
            // break;
         case 'Failure':
         case 'Failed':
            statusClass = 'bs-callout-danger';
            break;
         case 'Complete':
         case 'Success':
            statusClass = 'bs-callout-success';
            break;
         default:
            statusClass = 'bs-callout-default';
            break;
         }
      }
      else
      {
         statusClass = 'bs-callout-default';
      }
      statusDiv.append(jQuery('<div>').addClass('bs-callout').
         addClass(statusClass).
         append(statusEntry.message));
   };
   this.removeModal = function()
   {
      if (this.modal)
      {
         this.modal.remove();
      }
   };
   this.showError = function(theBaseId, msg)
   {
      pageModule.showError(theBaseId, msg);
   };
   this.ctor = function(theBaseId)
   {
      this.baseId = theBaseId;
   };
   return this.ctor(baseId);
};
