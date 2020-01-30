/* globals jQuery              */
/* globals AbstractDataObject  */
/* exported Parameter */

'use strict';

window.Parameter = function(data)
{
   this.parameterType = '';
   this.parameterKey = '';
   this.parameterName = '';
   this.parameterDescription = '';
   this.isNestedList = false;
   this.displayValue = '';
   this.preConfigured = false;

   this.inputDetails = {};


   this.parameterTypeMappings =
   {
      number:
      {
         valueField: 'numberValue',
         validator: function(value)
         {
            return !isNaN(Number(value));
         },
         format:
         {
            type: 'number',
            validators:
            [
               {
                  attribute: 'data-bv-integer',
                  message: 'This parameter must be an integer'
               }
            ]
         }
      },
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
      boolean:
      {
         valueField: 'booleanValue',
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
      json:
      {
         valueField: 'jsonValue',
         validator: function(value)
         {
            let json = value;
            if (typeof json === 'string')
            {
               json = JSON.parse(value);
            }
            return typeof json === 'object';
         },
         format:
         { type: 'textarea' }
      },
      encodedString:
      {
         valueField: 'encodedStringValue',
         validator: function(value)
         {
            return value !== '';
         },
         format:
         {
            type: 'textarea',
            validators: []
         }
      },
      enumerated:
      {
         valueField: 'enumeratedValue',
         validator: function(value)
         {
            return value !== '';
         },
         format:
         {
            type: 'select',
            maxItems: 1,
            options: []
         }
      },
      stringList:
      {
         valueField: 'stringListValue',
         validator: function(value)
         {
            return value !== undefined;
         },
         format:
         {
            type: 'select',
            allowCreate: true,
            maxItems: 100,
            options:
            []
         }
      },
      numberList:
      {
         valueField: 'numberListValue',
         validator: function(value)
         {
            return value !== undefined;
         },
         format:
         {
            type: 'select',
            allowCreate: true,
            maxItems: 100,
            options:
            []
         }
      },
      booleanList:
      {
         valueField: 'booleanListValue',
         validator: function(value)
         {
            return value !== undefined;
         },
         format:
         {
            type: 'select',
            allowCreate: true,
            maxItems: 100,
            options:
            []
         }
      },
      enumeratedList:
      {
         valueField: 'stringListValue',
         validator: function(value)
         {
            return value !== undefined;
         },
         format:
         {
            type: 'select',
            allowCreate: false,
            maxItems: 100,
            options:
            []
         }
      },
      nestedStringList:
      {
         valueField: 'stringListValue',
         validator: function()
         {
            return true;
         },
         format:
         {
            type: 'section',
            listType: 'stringList'
         }
      },
      nestedNumberList:
      {
         valueField: 'numberListValue',
         validator: function()
         {
            return true;
         },
         format:
         {
            type: 'section',
            listType: 'numberList'
         }
      },
      nestedBooleanList:
      {
         valueField: 'booleanListValue',
         validator: function()
         {
            return true;
         },
         format:
         {
            type: 'section',
            listType: 'booleanList'
         }
      },
      defaultMapping:
      {
         valueField: 'stringValue',
         validator: function(value)
         {
            return value !== '';
         },
         format:
         {
            isInline: true,
            labelColumns: 'col-md-5',
            valueColumns: 'col-md-7',
            type: 'text',
            validators: []
         }
      }
   };

   this.getFormatType = function()
   {
      let formatType;
      if (this.inputDetails.parameterSource === 'constants' || this.inputDetails.parameterSource === 'msg')
      {
         formatType = 'string';
      }
      else if (this.isNestedList)
      {
         switch (this.parameterType)
         {
         case 'stringList':
            formatType = 'nestedStringList';
            break;
         case 'numberList':
            formatType = 'nestedNumberList';
            break;
         case 'booleanList':
            formatType = 'nestedBooleanList';
            break;
         default:
            formatType = this.parameterType;
            break;
         }
      }
      else
      {
         formatType = this.parameterType;
      }
      return formatType;
   };

   this.getFormat = function()
   {
      const format = {};
      const formatType = this.getFormatType();
      if (this.parameterTypeMappings.hasOwnProperty(formatType))
      {
         jQuery.extend(
            true,
            format,
            this.parameterTypeMappings.defaultMapping.format,
            this.parameterTypeMappings[formatType].format
         );
      }
      else
      {
         jQuery.extend(format, this.parameterTypeMappings.defaultMapping.format);
      }
      if (!this.inputDetails.hasOwnProperty('isOptional') || this.inputDetails.isOptional === false)
      {
         format.validators.push({
            attribute: 'data-bv-notempty',
            message: 'This parameter must not be empty'
         });
      }
      if (this.preConfigured)
      {
         format.extraClasses = 'preConfigured';
      }
      if (this.hasOwnProperty('parameterDescription'))
      {
         format.popover =
            {
               title: this.parameterName,
               content: this.parameterDescription,
               trigger: 'focus',
               placement: 'top'
            };
      }
      format.label = this.parameterName;
      format.id = this.parameterKey;
      return format;
   };

   this.getEnumeratedFormatOptions = function()
   {
      const options = [];
      if (this.hasOwnProperty('inputDetails'))
      {
         let optionIndex;
         for (optionIndex in this.inputDetails.options)
         {
            if (this.inputDetails.options.hasOwnProperty(optionIndex))
            {
               const option = this.inputDetails.options[optionIndex];
               options.push({
                  label: option,
                  value: option
               });
            }
         }
      }
      return options;
   };

   this.fillParameterValue = function(value)
   {
      let fieldName;
      if (value !== undefined && value !== '')
      {
         if (this.parameterTypeMappings.hasOwnProperty(this.parameterType))
         {
            fieldName = this.parameterTypeMappings[this.parameterType].valueField;
         }
         else
         {
            fieldName = this.parameterTypeMappings.defaultMapping.valueField;
         }
         this[fieldName] = value;
      }
   };

   this.validate = function()
   {
      const ret =
         {
            isValid: true,
            error: ''
         };
      if (!this.isNestedList)
      {
         let mapping;
         let value;
         if (this.parameterTypeMappings.hasOwnProperty(this.parameterType))
         {
            mapping = this.parameterTypeMappings[this.parameterType];
         }
         else
         {
            mapping = this.parameterTypeMappings.defaultMapping;
         }

         // If its required, make sure we have a value specified
         if ((!this.inputDetails.hasOwnProperty('isOptional') || this.inputDetails.isOptional === false) &&
            !this.preConfigured)
         {
            if (!this.hasOwnProperty(mapping.valueField))
            {
               ret.isValid = false;
               ret.error = this.parameterName + ' is required';
            }
         }

         // Make sure the value provided is valid
         if (this.hasOwnProperty(mapping.valueField))
         {
            value = this[mapping.valueField];
            if (!mapping.validator(value))
            {
               ret.isValid = false;
               ret.error = 'Value ' + value + ' for ' + this.parameterName + ' is invalid';
            }
         }
      }
      return ret;
   };

   this.setDisplayValueFromData = function(theData)
   {
      switch (this.parameterType)
      {
      case 'string':
         this.displayValue = theData.stringValue;
         break;
      case 'number':
         this.displayValue = theData.numberValue;
         break;
      case 'boolean':
         if (theData.hasOwnProperty('booleanValue'))
         {
            this.displayValue = theData.booleanValue === true ? 'true' : 'false';
         }
         else
         {
            this.displayValue = null;
         }
         break;
      case 'json':
         this.displayValue = theData.jsonValue;
         break;
      case 'encodedString':
         this.displayValue = theData.encodedStringValue;
         break;
      case 'enumerated':
         this.displayValue = theData.enumeratedValue;
         break;
      case 'stringList':
         this.displayValue = theData.stringListValue;
         break;
      case 'numberList':
         this.displayValue = theData.numberListValue;
         break;
      case 'booleanList':
         this.displayValue = theData.booleanListValue;
         break;
      case 'enumeratedList':
         this.displayValue = theData.enumeratedValue;
         break;
      case 'encodedStringList':
         this.displayValue = theData.encodedStringValue;
         break;
      default:
         break;
      }
   };

   this.ctor = function(theData)
   {
      jQuery.extend(this, new AbstractDataObject());
      if (theData !== undefined)
      {
         this.fromJson(theData);
         const enumeratedOptions = this.getEnumeratedFormatOptions();
         this.parameterTypeMappings.enumerated.format.options = enumeratedOptions;
         this.parameterTypeMappings.enumeratedList.format.options = enumeratedOptions;
         this.setDisplayValueFromData(theData);
         if (this.displayValue === null || this.displayValue === undefined)
         {
            this.displayValue = '';
         }
         else
         {
            if (this.parameterType !== 'boolean' && this.parameterType !== 'enumerated')
            {
               this.preConfigured = true;
            }
            this.fillParameterValue(this.displayValue);
         }
         if (this.inputDetails.parameterSource === 'mapping' || this.inputDetails.fromMappedParam)
         {
            this.preConfigured = true;
            this.inputDetails.parameterSource = 'mapping'; // set this in case it's still using old fromMappedParam bool
            this.displayValue = this.inputDetails.mappedFrom.key + ' from node ' +
               this.inputDetails.mappedFrom.nodeId;
         }
         if (this.inputDetails.parameterSource === 'constants' || this.inputDetails.fromConstants)
         {
            this.preConfigured = true;
            this.inputDetails.parameterSource = 'constants'; // set this in case it's still using old fromConstants bool
            this.displayValue = 'Constant: ' + this.inputDetails.constantsPath;
         }
         if (this.inputDetails.parameterSource === 'msg')
         {
            this.preConfigured = true;
            this.displayValue = 'Sourced from msg.' + theData.msgPropertyMapping;
         }
      }
      return this;
   };

   return this.ctor(data);
};
