/* globals jQuery                 */
/* globals AbstractController     */
/* globals ServiceSelector        */
/* globals ServiceSelectorView    */
/* globals ServiceSelectorModel   */
/* exported ServiceSelctorController */

'use strict';

// This is a reusable module that can be used anywhere an avilable service needs to be selected
window.ServiceSelctorController = function()
{
   const outer = this;

   this.files = [];
   this.files.push('/vino/serviceActivation/serviceSelector/DataObject.js');
   this.files.push('/vino/serviceActivation/serviceSelector/Model.js');
   this.files.push('/vino/serviceActivation/serviceSelector/View.js');

   this.render = function(baseId)
   {
      jQuery.when(this.loadJs(this.files)).done(function()
      {
         outer.model = new ServiceSelectorModel();
         outer.view = new ServiceSelectorView(outer, baseId);
         jQuery.when(outer.model.getServices()).done(function(services)
         {
            const dataObj = new ServiceSelector(outer, services);
            outer.view.showView(dataObj);
         });
      });
   };

   // Returns a promise that will fulfill when the user selects a service
   this.awaitSelection = function()
   {
      this.deferred = jQuery.Deferred();
      return this.deferred.promise();
   };

   this.selectService = function()
   {
      if (this.selectedService !== undefined)
      {
         this.deferred.resolve(this.selectedService);
      }
   };

   this.serviceSelected = function(service)
   {
      this.selectedService = service;
      this.view.showServiceDetails(service);
   };

   this.ctor = function()
   {
      jQuery.extend(this, new AbstractController());
      return this;
   };

   return this.ctor();
};
