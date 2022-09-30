/* globals jQuery             */
/* globals pageModule         */
/* globals jsInclude */
/* globals ServiceListController */
/* globals bootbox               */
/* exported HomePageView */

'use strict';


window.HomePageView = function()
{
   this.baseId = 'HomePageView';
   this.showView = function()
   {
      const outer = this;
      pageModule.buildPage(outer.baseId, 'Home');
      // let panel = pageModule.getNewPanel('Temporary ViNO Home');
      // // panel.css('width', 'calc(100%)');
      // panel.addClass('panel-primary');
      // panel.css('min-width', '');
      // panel.css('width', '');
      // jQuery('#' + outer.baseId + '-bdy').append(panel);
      // jQuery('#' + outer.baseId + '-ftr').remove();
      // panel = jQuery('.panel-body', panel);
      // panel.attr('id', outer.baseId + '-panel-bdy-1');
      // let temporaryPlaceholderPanel = jQuery('<div>');
      // temporaryPlaceholderPanel.addClass('temporaryPlaceholderPanel');
      // let temporaryPlaceholder = jQuery('<img>').attr('src', '/vino/images/vino.svg');
      // temporaryPlaceholderPanel.append(temporaryPlaceholder);
      // panel.append(temporaryPlaceholderPanel);
      jQuery.when(jsInclude('vino/list/Controller.js'), jsInclude('vino/cuiAcknowledgement/Model.js')).done(function()
      {
         const serviceListController = new ServiceListController(outer.baseId);
         const cuiAcknowledgementModel = new CuiAcknowledgementModel();

         jQuery.when(cuiAcknowledgementModel.getCuiAcknowledgement()).done(function(acknowledged)
         {
            if (acknowledged)
            {
               serviceListController.render();
            }
            else
            {
               const callback = function(result)
               {
                  if (result)
                  {
                     jQuery.when(cuiAcknowledgementModel.postCuiAcknowledgement()).done(function()
                     {
                        serviceListController.render();
                     });
                  }
                  else
                  {
                     window.location.href = '';
                  }
               };
               const warning = 'If your content includes CUI data defined in the Information Classification Standard in InsideLink you must either ' +
                  'remove that CUI data from your content or  restrict your users to U.S. based only (go to this link) for that list. If you will ' +
                  'not be removing the CUI data, Please copy and add the following text string in your content - Confidential_CUI_U.S._Users_Only';
               bootbox.confirm({
                  message: warning,
                  buttons: {
                     confirm: { label: 'Acknowledge' },
                     cancel: { label: 'Cancel' }
                  },
                  callback: callback
               });
            }
         });
      });
      pageModule.doneLoading();
   };
};
