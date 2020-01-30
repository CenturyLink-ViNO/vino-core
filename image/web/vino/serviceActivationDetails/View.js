/* globals jQuery                         */
/* globals ServiceActivationDetailData    */
/* globals FormBuilder                    */
/* globals pageModule                     */
/* exported ServiceActivationDetailView   */

'use strict';

window.ServiceActivationDetailView = function(controller)
{
   const inputDomTable = jQuery('<table>').
      attr('id', 'input-data-table').
      addClass('display').
      append(jQuery('<thead>').
         append(jQuery('<tr>').
            append(jQuery('<th>').
               text('Parameter Name')).
            append(jQuery('<th>').
               text('Parameter Description')).
            append(jQuery('<th>').
               text('Parameter Type')).
            append(jQuery('<th>').
               text('Parameter Value'))));
   const outputDomTable = jQuery('<table>').
      attr('id', 'output-data-table').
      addClass('display').
      append(jQuery('<thead>').
         append(jQuery('<tr>').
            append(jQuery('<th>').
               text('Parameter Name')).
            append(jQuery('<th>').
               text('Parameter Description')).
            append(jQuery('<th>').
               text('Parameter Type')).
            append(jQuery('<th>').
               text('Parameter Value'))));
   this.showError = function(baseId, msg)
   {
      pageModule.showError(baseId, msg);
   };
   this.renderUiElement = function(baseId, panel, service)
   {
      const outer = this;
      this.baseId = baseId;
      this.panel = panel;
      this.service = service;
      const def = jQuery.Deferred(function()
      {
         outer.render(baseId);
      });
      return def.promise();
   };
   this.render = function()
   {
      const serviceActivationDetailData = new ServiceActivationDetailData(this.service, this.controller);
      this.controller.setDataObject(serviceActivationDetailData);
      const formBuilder = new FormBuilder(serviceActivationDetailData);
      jQuery('.panel-body', this.panel).empty();
      jQuery.when(formBuilder.buildFormInObj(jQuery('.panel-body', this.panel))).done(function()
      {
         jQuery('#step').trigger('change');
      });
   };
   this.renderStepData = function(input, output)
   {
      jQuery('.inputParameters > *').not('.inputParameters > legend').
         remove();
      jQuery('.outputParameters > *').not('.outputParameters > legend').
         remove();
      jQuery('.inputParameters > legend').after(inputDomTable.clone());
      jQuery('.outputParameters > legend').after(outputDomTable.clone());
      jQuery('#input-data-table').dataTable({
         dom: 'Bfrtip',
         select: true,
         ajax: function(tblData, callback)
         {
            callback(input);
         },
         pageLength: 5,
         order: [[0, 'desc']],
         columns:
      [
         { data: 'parameterName' },
         { data: 'parameterDescription' },
         { data: 'parameterType' },
         {
            data: 'parameterValue',
            render: function(data)
            {
               return jQuery('<div/>').text(data).
                  html();
            }
         }
      ],
         responsive: true,
         autoWidth: false,
         buttons: []
      });
      jQuery('#output-data-table').dataTable({
         dom: 'Bfrtip',
         select: true,
         ajax: function(tblData, callback)
         {
            callback(output);
         },
         pageLength: 5,
         order: [[0, 'desc']],
         columns:
         [
            { data: 'parameterName' },
            { data: 'parameterDescription' },
            { data: 'parameterType' },
            {
               data: 'parameterValue',
               render: function(data)
               {
                  return jQuery('<div/>').text(data).
                     html();
               }
            }
         ],
         responsive: true,
         autoWidth: false,
         buttons: []
      });
   };
   this.ctor = function(theController)
   {
      this.controller = theController;
      return this;
   };
   return this.ctor(controller);
};
