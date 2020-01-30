/* globals jQuery        */
/* globals FormBuilder   */
/* globals pageModule    */
/* globals bootbox       */
/* exported ServiceSelectorView */

'use strict';

window.ServiceSelectorView = function(controller, baseId)
{
   const outer = this;
   this.showView = function(serviceSelector)
   {
      let formBuilder = new FormBuilder(serviceSelector);

      formBuilder.buildForm('#' + this.baseId);


      this.detailsPanel = pageModule.getNewPanel('Details');
      this.detailsPanel.css('width', 'calc(100%)');
      this.detailsPanel.addClass('panel-primary');
      jQuery('.panel-body', this.detailsPanel).attr('id', 'details-panel-bdy');

      jQuery('#' + this.baseId).append(this.detailsPanel);
      formBuilder = new FormBuilder({
         selectedServiceName: '',
         selectedServiceDesc: '',
         format:
         {
            name:
            {
               label: 'Service Name',
               id: 'selectedServiceName',
               type: 'info',
               isInline: true
            },
            description:
            {
               label: 'Description',
               id: 'selectedServiceDesc',
               type: 'info',
               isInline: true
            }
         }
      });
      formBuilder.buildForm('#details-panel-bdy');
      jQuery('#' + this.baseId).append(jQuery('<button/>').
         addClass('btn').
         addClass('btn-primary').
         addClass('pull-right').
         css('margin-right', '5px').
         append('Select Service').
         click(this.done));
      pageModule.doneLoading();
   };

   this.done = function()
   {
      const serviceId = jQuery('#service').val();
      if (serviceId === undefined || serviceId === '')
      {
         bootbox.alert('No Service selected');
      }
      else
      {
         outer.controller.selectService();
      }
   };


   this.showServiceDetails = function(service)
   {
      if (service !== undefined)
      {
         jQuery('#selectedServiceName', this.detailsPanel).empty().
            append(service.name);
         jQuery('#selectedServiceDesc', this.detailsPanel).empty().
            append(service.description);
      }
   };

   this.ctor = function(theController, theBaseId)
   {
      this.controller = theController;
      this.baseId = theBaseId;
   };

   return this.ctor(controller, baseId);
};
