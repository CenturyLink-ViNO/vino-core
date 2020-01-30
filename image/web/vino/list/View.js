/* globals jQuery                         */
/* globals pageModule                     */
/* globals bootbox                        */
/* exported ServiceListView */

'use strict';

window.ServiceListView = function(controller, baseId)
{
   const outer = this;
   outer.tableFiltered = true;
   this.showView = function(data)
   {
      let panel = pageModule.getNewPanel('Service Activations');
      panel.css('width', 'calc(100%)');
      panel.addClass('panel-primary');
      jQuery('#' + this.baseId + '-bdy').append(panel);
      // jQuery('#' + this.baseId + '-ftr').remove();
      panel = jQuery('.panel-body', panel);
      // panel.attr('id', this.baseId + '-panel-bdy-1');

      // this.serviceModelPanel = pageModule.getNewPanel('Service Detail');
      // this.serviceModelPanel.css('width', 'calc(100%)');
      // this.serviceModelPanel.addClass('panel-primary');
      // jQuery('.panel-body', this.serviceModelPanel).append('No Service Selected');
      // jQuery('#' + this.baseId + '-bdy').append(this.serviceModelPanel);

      this.buildServiceTable(data, panel, this.controller.podConstants);

      this.serviceModelPanel = pageModule.getNewPanel('Service Detail');
      this.serviceModelPanel.css('width', 'calc(100%)');
      this.serviceModelPanel.addClass('panel-primary');
      jQuery('.panel-body', this.serviceModelPanel).append('No Service Selected');
      jQuery('#' + this.baseId + '-bdy').append(this.serviceModelPanel);
   };

   this.updateView = function(data)
   {
      this.serviceTable.clear().rows.add(data).draw();
   };

   const domTable = jQuery('<table>').
      attr('id', 'serviceTable').
      addClass('display').
      append(jQuery('<thead>').
         append(jQuery('<tr>').

         /* .append(jQuery('<th>').text('Job ID'))*/
            append(jQuery('<th>').text('Service Name')).
            append(jQuery('<th>').text('Customer Name')).
            append(jQuery('<th>').text('Settings Root')).
            append(jQuery('<th>').text('Status')).
            append(jQuery('<th>').text('Completed At')).
            append(jQuery('<th>').text('Activation Log')).
            append(jQuery('<th>').text('Visible in UI'))));
   this.buildServiceTable = function(data, panel)
   {
      panel.append(domTable);
      const tableButtons = [];
      if (data.data.length > 0)
      {
         tableButtons.push({
            text: 'Deactivate',
            action: function()
            {
               bootbox.confirm({
                  message: 'Are you sure you wish to terminate this service?',
                  callback: function(result)
                  {
                     if (result)
                     {
                        if (outer.controller.selectedJobId !== null &&
                           outer.controller.selectedJobId !== undefined &&
                           outer.controller.selectedServiceId !== null &&
                           outer.controller.selectedServiceId !== undefined &&
                           outer.controller.selectedServiceId !== 'UNKNOWN')
                        {
                           if (outer.controller.selectedJobStatus !== null &&
                                 outer.controller.selectedJobStatus !== undefined)
                           {
                              if (outer.controller.selectedJobStatus.toLowerCase() === 'activated' ||
                                    outer.controller.selectedJobStatus.toLowerCase() === 'unknown')
                              {
                                 outer.controller.deactivateService();
                              }
                              else
                              {
                                 outer.showError('This service is in a state which can not be' +
                                       ' deactivated.');
                              }
                           }
                           else
                           {
                              outer.showError('Could not determine the current state of the' +
                                    ' selected service. Can not deactivate.');
                           }
                        }
                     }
                  }
               });
               return false;
            }
         });
         tableButtons.push({
            text: 'Reactivate',
            action: function()
            {
               bootbox.confirm({
                  message: 'Are you sure you wish to reactivate this service with the same input parameters as the previous activation?',
                  callback: function(result)
                  {
                     if (result)
                     {
                        if (outer.controller.selectedJobId !== null &&
                                 outer.controller.selectedJobId !== undefined &&
                                 outer.controller.selectedServiceId !== null &&
                                 outer.controller.selectedServiceId !== undefined &&
                                 outer.controller.selectedServiceId !== 'UNKNOWN')
                        {
                           outer.controller.reactivateService();
                        }
                     }
                  }
               });
            }
         });
         tableButtons.push({
            text: 'Show All Activations',
            attr: {
               id: 'show-filtered-button'
            },
            action: function()
            {
               jQuery('#show-filtered-button').hide();
               jQuery('#hide-filtered-button').show();
               outer.controller.loadAllActivatedData();
               outer.tableFiltered = false;
            }
         });
         tableButtons.push({
            text: 'Filter Activations',
            attr: {
               id: 'hide-filtered-button',
               style: 'display:none;'
            },
            action: function()
            {
               jQuery('#hide-filtered-button').hide();
               jQuery('#show-filtered-button').show();
               outer.updateView(outer.controller.filteredActivationData.filter(activation => activation.visible));
               outer.tableFiltered = true;
            }
         });
      }
      const tblColumns = [];
      tblColumns.push({ data: 'name' });
      tblColumns.push({ data: 'customerName' });
      tblColumns.push({ data: 'settingsRootGroup' });
      tblColumns.push({ data: 'stateString' });
      tblColumns.push({ data: 'endTime' });
      tblColumns.push({ data: 'logButton' });
      tblColumns.push({ data: 'visibleSelect' });
      const tbl = jQuery('#serviceTable').DataTable({
         dom: 'Bfrtip',
         select: true,
         ajax: function(tblData, callback)
         {
            callback(data);
         },
         order: [[4, 'desc']],
         columns: tblColumns,
         responsive: true,
         autoWidth: false,
         buttons: tableButtons
      });
      jQuery('#serviceTable tbody').on('click', 'tr', /* @this jqElement */ function()
      {
         const selData = tbl.row(this).data();
         outer.controller.selectedService(selData.id, selData.state);
      });
      jQuery('#serviceTable tbody').on('click', 'button', /* @this jqElement */ function()
      {
         const jqElement = this;
         const selData = tbl.row(jQuery(jqElement).parents('tr')).data();
         outer.controller.selectActivationLog(selData.id);
      });
      jQuery('#serviceTable tbody').on('change', 'select', /* @this jqElement */ function()
      {
         const jqElement = jQuery(this);
         const visibleState = jqElement.val() === 'true';
         const selData = tbl.row(jqElement.parents('tr')).data();
         selData.visible = visibleState;
         let foundInAll = [];
         const foundInFiltered = outer.controller.filteredActivationData.find(activation => activation.id === selData.id);
         if (outer.controller.activationData)
         {
            foundInAll = outer.controller.activationData.find(activation => activation.id === selData.id);
         }
         if (foundInFiltered)
         {
            foundInFiltered.visible = visibleState;
            outer.controller.setVisibleSelectHtml(foundInFiltered);
         }
         else if (visibleState === true)
         {
            outer.controller.filteredActivationData.push(selData);
         }
         if (foundInAll)
         {
            foundInAll.visible = visibleState;
            outer.controller.setVisibleSelectHtml(foundInAll);
         }
         outer.controller.serviceListModel.changeVisibilty(selData.id, visibleState);
         if (outer.tableFiltered)
         {
            jQuery('#serviceTable').DataTable().row(jqElement.parents('tr')).remove().draw(false);
         }
      });

      this.serviceTable = tbl;
   };
   this.showError = function(message)
   {
      pageModule.showError(this.baseId + '-bdy', message);
   };
   this.showSuccess = function(message)
   {
      pageModule.showSuccess(this.baseId + '-bdy', message);
   };
   this.showActivationLog = function(activationId, activationLog)
   {
      const download = function(filename, text)
      {
         const element = jQuery('<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(text) +
                  '" download="' + filename + '" style="display: none;" />');
         jQuery('body').append(element);
         element[0].click();
         element.remove();
      };
      bootbox.dialog({
         message: activationLog.replace(/\n/g, '<br />'),
         size: 'large',
         buttons:
                     {
                        download:
                        {
                           label: 'Download Log',
                           callback: function()
                           {
                              download(activationId + '.log', activationLog);
                           }
                        },
                        cancel:
                        { label: 'Close' }
                     }
      });
   };
   this.ctor = function(theController, theBaseId)
   {
      this.controller = theController;
      this.baseId = theBaseId;
      return this;
   };

   return this.ctor(controller, baseId);
};
