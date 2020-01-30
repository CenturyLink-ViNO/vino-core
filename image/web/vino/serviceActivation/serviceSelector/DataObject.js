/* globals jQuery              */
/* exported ServiceSelector */

'use strict';

window.ServiceSelector = function(controller, services)
{
   const outer = this;
   this.services = []; // Service[]
   this.format =
   {
      service:
      {
         isInline: true,
         labelColumns: 'col-md-4',
         valueColumns: 'col-md-8',
         label: 'Service',
         id: 'service',
         type: 'select',
         maxItems: 1,
         handlers:
         {
            change: function()
            {
               const serviceId = jQuery('#service').val();
               const service = outer.getService(serviceId);
               outer.controller.serviceSelected(service);
            }
         },
         options: []
      }
   };

   this.populateServices = function()
   {
      let serviceIndex;
      for (serviceIndex = 0; serviceIndex < this.services.length; serviceIndex = serviceIndex + 1)
      {
         this.format.service.options.push({
            label: this.services[serviceIndex].name,
            value: this.services[serviceIndex].id
         });
      }
   };

   this.getService = function(serviceId)
   {
      const service = this.services.find(function(element)
      {
         return element.id === serviceId;
      });
      return service;
   };

   this.ctor = function(theController, theServices)
   {
      this.controller = theController;
      if (theServices !== undefined)
      {
         this.services = theServices;
         this.populateServices();
      }
      return this;
   };
   return this.ctor(controller, services);
};
