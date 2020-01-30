/* globals jQuery             */
/* globals pageModule         */
/* globals jsInclude */
/* globals ServiceListController */
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
      jQuery.when(jsInclude('/vino/list/Controller.js')).done(function()
      {
         const serviceListController = new ServiceListController(outer.baseId);
         serviceListController.render();
      });
      pageModule.doneLoading();
   };
};
