/* globals jQuery              */
/* globals AbstractDataObject  */
/* exported Scalar */

'use strict';

window.Scalar = function(data, isNew)
{
   this.name = '';
   this.idName = '';
   this.displayName = '';
   this.required = 'false';
   this.type = 'string';
   this.value = '';
   this.isDefault = '';
   this.stringValue = '';
   this.numberValue = '';
   this.boolValue = '';
   this.deleted = false;
   this.isNew = false;
   this.parentIsDefaults = false;

   this.typeMappings =
   {
      string:
      {
         valueField: 'stringValue',
         validator: function(value)
         {
            return value !== '';
         },
         format:
         { type: 'text' }
      },
      number:
      {
         valueField: 'numberValue',
         validator: function(value)
         {
            return !isNaN(Number(value));
         },
         format:
         { type: 'number' }
      },
      bool:
      {
         valueField: 'boolValue',
         validator: function(value)
         {
            return value === 'true' || value === 'false';
         },
         format:
         {
            type: 'select',
            maxItems: 1,
            options:
            [
               {
                  label: 'True',
                  value: 'true'
               },
               {
                  label: 'False',
                  value: 'false'
               }
            ]
         }
      },
      defaultMapping:
      {
         valueField: 'value',
         validator: function(value)
         {
            return value !== '';
         },
         format:
         {
            isInline: true,
            type: 'text',
            validators: []
         }
      }
   };


   this.getFormat = function()
   {
      const outer = this;
      const format =
      {
         name:
         {
            label: 'Name',
            id: 'name',
            extraClasses: 'name',
            isInline: true
         },
         displayName:
         {
            label: 'Display Name',
            id: 'displayName',
            extraClasses: 'displayName',
            isInline: true
         },
         required:
         {
            label: 'Required',
            id: 'required',
            extraClasses: 'required',
            type: 'select',
            maxItems: 1,
            options:
            [
               {
                  label: 'True',
                  value: 'true'
               },
               {
                  label: 'False',
                  value: 'false'
               }
            ],
            isInline: true
         },
         type:
         {
            label: 'Type',
            id: 'type',
            extraClasses: 'type',
            type: 'select',
            maxItems: 1,
            options:
            [
               {
                  label: 'String',
                  value: 'string'
               },
               {
                  label: 'Number',
                  value: 'number'
               },
               {
                  label: 'Boolean',
                  value: 'bool'
               }
            ],
            handlers:
            {
               'change': function()
               {
                  const value = jQuery('#type').val();
                  jQuery('.valueInput').addClass('hidden');
                  switch (value)
                  {
                  case 'string':
                     jQuery('.stringValue').removeClass('hidden');
                     break;
                  case 'number':
                     jQuery('.numberValue').removeClass('hidden');
                     break;
                  case 'bool':
                     jQuery('.boolValue').removeClass('hidden');
                     break;
                  default:
                     break;
                  }
               }
            },
            isInline: true
         },
         stringValue: this.getValueFormat('string'),
         numberValue: this.getValueFormat('number'),
         boolValue: this.getValueFormat('bool'),
         showCancel: true
      };
      if (outer.name !== '')
      {
         format.name.type = 'info';
      }
      return format;
   };


   this.getValueFormat = function(type)
   {
      const format = {};
      if (this.typeMappings.hasOwnProperty(type))
      {
         jQuery.extend(true, format, this.typeMappings.defaultMapping.format, this.typeMappings[type].format);
      }
      else
      {
         jQuery.extend(format, this.typeMappings.defaultMapping.format);
      }
      format.label = 'Value';
      switch (type)
      {
      case 'string':
         format.id = 'stringValue';
         format.extraClasses = 'valueInput stringValue';
         break;
      case 'number':
         format.id = 'numberValue';
         format.extraClasses = 'hidden valueInput numberValue';
         break;
      case 'bool':
         format.id = 'boolValue';
         format.extraClasses = 'hidden valueInput boolValue';
         break;
      default:
         break;
      }
      return format;
   };


   this.getJsonDataToPost = function(excludeNew, excludeIsDefaultFlag)
   {
      const outer = this;
      let json = {};
      if (outer.deleted || excludeNew && outer.isNew || !outer.parentIsDefaults && outer.isDefault)
      {
         json = null;
      }
      else
      {
         json.name = outer.name;
         json.displayName = outer.displayName;
         json.required = outer.required === 'true';
         json.type = outer.type;
         if (!excludeIsDefaultFlag)
         {
            json.isDefault = outer.isDefault;
         }
         switch (outer.type)
         {
         case 'string':
            json.value = outer.stringValue;
            break;
         case 'number':
            json.value = Number(outer.numberValue);
            break;
         case 'bool':
            json.value = outer.boolValue === 'true';
            break;
         default:
            break;
         }
      }
      return json;
   };


   this.saveChanges = function(dataObject, viewInfo)
   {
      const object = dataObject;
      const tree = viewInfo.tree;
      const view = viewInfo.view;
      const updateNode = viewInfo.updateNode;
      const parentNode = viewInfo.parentNode;
      const containerId = viewInfo.containerId;
      return function(btn)
      {
         btn.button('loading');
         const nameElement = jQuery('#' + containerId).find('#name');
         if (nameElement.is('input'))
         {
            object.name = nameElement.val().trim();
         }
         else
         {
            object.name = nameElement.text().trim();
         }
         if (object.idName === '' || object.idName === undefined)
         {
            object.idName = object.name.replace(/-|\s/g, '');
         }
         object.displayName = jQuery('#' + containerId).find('#displayName').
            val();
         object.required = jQuery('#' + containerId).find('#required').
            val();
         object.type = jQuery('#' + containerId).find('#type').
            val();
         const subRootId = parentNode.id.split('-')[0] + '-' + parentNode.id.split('-')[1];
         if (tree.jstree(true).get_node(subRootId).type === 'defaults')
         {
            object.isDefault = true;
         }
         else
         {
            object.isDefault = false;
         }
         switch (object.type)
         {
         case 'string':
            object.value = jQuery('#' + containerId).
               find('#stringValue').
               val();
            object.stringValue = String(object.value);
            break;
         case 'number':
            object.value = jQuery('#' + containerId).
               find('#numberValue').
               val();
            object.numberValue = String(object.value);
            break;
         case 'bool':
            object.value = jQuery('#' + containerId).
               find('#boolValue').
               val();
            object.boolValue = String(object.value);
            break;
         default:
            break;
         }
         if (tree !== undefined)
         {
            view.updateTreeWithNode(object, 'scalar', parentNode, updateNode);
         }
         jQuery('.modal').remove();
         btn.button('reset');
      };
   };


   this.ctor = function(jsonData, isNewScalar)
   {
      const outer = this;
      jQuery.extend(this, new AbstractDataObject());
      if (jsonData !== undefined)
      {
         this.fromJson(jsonData);
         if (this.idName === '')
         {
            this.idName = this.name.replace(/-|\s/g, '');
         }
         if (isNewScalar !== null && isNewScalar !== undefined)
         {
            this.isNew = isNewScalar;
         }
         else
         {
            this.isNew = false;
         }
         switch (jsonData.type)
         {
         case 'string':
            this.stringValue = String(jsonData.value);
            break;
         case 'number':
            this.numberValue = String(jsonData.value);
            break;
         case 'bool':
            this.boolValue = String(jsonData.value);
            break;
         default:
            break;
         }
         this.required = String(jsonData.required);
         this.format = this.getFormat();
         this.format.submitFunction = outer.saveChanges;
      }
      return this;
   };

   return this.ctor(data, isNew);
};
