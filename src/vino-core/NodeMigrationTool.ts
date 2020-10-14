#!/usr/local/bin/node
import * as CoreNodeConfiguration from 'vino-core-nodes';
import * as DriverNodeConfiguration from 'vino-node-red-nodes';
const { exec } = require('child_process');
let ClosedSourceConfiguration;
try
{
   ClosedSourceConfiguration = require('vino-node-red-nodes-cs');
}
catch (e)
{
   console.warn(`Not importing configuration for Closed Source Nodes: ${e}`);
}
import * as fs from 'fs';
import * as path from 'path';

const nodeRedDirectory = '/root/.node-red';

const typeToConfigMap:Map<string, any> = new Map();
for (const type of CoreNodeConfiguration.types)
{
   typeToConfigMap.set(type, CoreNodeConfiguration.config[type]);
}
for (const type of DriverNodeConfiguration.types)
{
   typeToConfigMap.set(type, DriverNodeConfiguration.config[type]);
}
if (ClosedSourceConfiguration)
{
   for (const type of ClosedSourceConfiguration.types)
   {
      typeToConfigMap.set(type, ClosedSourceConfiguration.config[type]);
   }
}

const recursiveSearchForFile = (startingPath, regexp, callback) =>
{
   if (!fs.existsSync(startingPath))
   {
      console.error(`Directory [${startingPath}] does not exist.`)
      return;
   }
   const filesInDirectory = fs.readdirSync(startingPath);
   for (const file of filesInDirectory)
   {
      const filePath = path.join(startingPath, file);
      const fileStat = fs.lstatSync(filePath);
      if (fileStat.isDirectory())
      {
         recursiveSearchForFile(filePath, regexp, callback);
      }
      else
      {
         if (regexp.test(filePath))
         {
            callback(filePath);
         }
      }
   }
};

const compressNode = (stored, configuration) =>
{
   let deepCopy = (obj) =>
   {
      return JSON.parse(JSON.stringify(obj));
   };
   const isEmptyObject = (obj) =>
   {
      var name;
      for (name in obj) {
         if (obj.hasOwnProperty(name)) {
            return false;
         }
      }
      return true;
   };
   const isDifferent = (obj) =>
   {
      const safe = deepCopy(obj);
      delete safe.parameterKey;
      return !isEmptyObject(safe);
   };
   const getInputDiffArray = (parameters, baseType) =>
   {
      const inputDiffArray = [];
      for (let i = 0; i < parameters.length; i = i + 1)
      {
         const newParameter = parameters[i];
         let paramFound = false;
         for (let j = 0; j < baseType.inputParameters.length; j = j + 1)
         {
            if (
               baseType.inputParameters[j] &&
               parameters[i] &&
               baseType.inputParameters[j].parameterKey === parameters[i].parameterKey
            )
            {
               paramFound = true;
               const originalParameter = baseType.inputParameters[j];
               const diff:any = {};
               diff.parameterKey = newParameter.parameterKey;
               if (newParameter.index !== originalParameter.index) diff.index = newParameter.index;
               if (newParameter.parameterName !== originalParameter.parameterName) diff.parameterName = newParameter.parameterName;
               if (newParameter.parameterDescription !== originalParameter.parameterDescription) diff.parameterDescription = newParameter.parameterDescription;
               if (newParameter.msgPropertyMapping !== originalParameter.msgPropertyMapping) diff.msgPropertyMapping = newParameter.msgPropertyMapping;
               if (newParameter.parameterType !== originalParameter.parameterType) diff.parameterType = newParameter.parameterType;
               if (newParameter.encrypt !== originalParameter.encrypt) diff.encrypt = newParameter.encrypt;
               if (newParameter.stringValue !== originalParameter.stringValue) diff.stringValue = newParameter.stringValue;
               if (newParameter.numberValue !== originalParameter.numberValue) diff.numberValue = newParameter.numberValue;
               if (newParameter.booleanValue !== originalParameter.booleanValue) diff.booleanValue = newParameter.booleanValue;
               if (newParameter.encodedStringValue !== originalParameter.encodedStringValue) diff.encodedStringValue = newParameter.encodedStringValue;
               if (newParameter.enumeratedValue !== originalParameter.enumeratedValue) diff.enumeratedValue = newParameter.enumeratedValue;
               if (JSON.stringify(newParameter.stringListValue) !== JSON.stringify(originalParameter.stringListValue)) diff.stringListValue = newParameter.stringListValue;
               if (JSON.stringify(newParameter.numberListValue) !== JSON.stringify(originalParameter.numberListValue)) diff.numberListValue = newParameter.numberListValue;
               if (JSON.stringify(newParameter.booleanListValue) !== JSON.stringify(originalParameter.booleanListValue)) diff.booleanListValue = newParameter.booleanListValue;
               if (newParameter.jsonValue !== originalParameter.jsonValue) diff.jsonValue = newParameter.jsonValue;
               diff.inputDetails = {};
               if (newParameter.inputDetails)
               {
                  if (originalParameter.inputDetails)
                  {
                     if (newParameter.inputDetails.fromConstants !== originalParameter.inputDetails.fromConstants) diff.inputDetails.fromConstants = newParameter.inputDetails.fromConstants;
                     if (newParameter.inputDetails.constantsPath !== originalParameter.inputDetails.constantsPath) diff.inputDetails.constantsPath = newParameter.inputDetails.constantsPath;
                     if (newParameter.inputDetails.isOptional !== originalParameter.inputDetails.isOptional) diff.inputDetails.isOptional = newParameter.inputDetails.isOptional;
                     if (newParameter.inputDetails.isFinal !== originalParameter.inputDetails.isFinal) diff.inputDetails.isFinal = newParameter.inputDetails.isFinal;
                     if (JSON.stringify(newParameter.inputDetails.options) !== JSON.stringify(originalParameter.inputDetails.options)) diff.inputDetails.options = newParameter.inputDetails.options;
                     if (newParameter.inputDetails.fromMappedParam !== originalParameter.inputDetails.fromMappedParam) diff.inputDetails.fromMappedParam = newParameter.inputDetails.fromMappedParam;
                     if (newParameter.inputDetails.mappedFrom !== originalParameter.inputDetails.mappedFrom) diff.inputDetails.mappedFrom = newParameter.inputDetails.mappedFrom;
                     if (newParameter.inputDetails.parameterSource !== originalParameter.inputDetails.parameterSource) diff.inputDetails.parameterSource = newParameter.inputDetails.parameterSource;
                  }
                  else
                  {
                     diff.inputDetails = newParameter.inputDetails;
                  }
               }
               if (isEmptyObject(diff.inputDetails)) delete diff.inputDetails;
               if (isDifferent(diff)) inputDiffArray.push(diff);
               break;
            }
         }
         if (!paramFound)
         {
            inputDiffArray.push(newParameter);
         }
      }
      return inputDiffArray;
   };

   const getOutputDiffArray = (parameters, baseType) =>
   {
      const outputDiffArray = [];
      for (let i = 0; i < parameters.length; i = i + 1)
      {
         const newParameter = parameters[i];
         let paramFound = false;
         for (let j = 0; j < baseType.inputParameters.length; j = j + 1)
         {
            if (
               baseType.inputParameters[j] &&
               parameters[i] &&
               baseType.inputParameters[j].parameterKey === parameters[i].parameterKey
            )
            {
               paramFound = true;
               const originalParameter = baseType.inputParameters[j];
               const diff:any = {};
               diff.parameterKey = newParameter.parameterKey;
               if (newParameter.index !== originalParameter.index) diff.index = newParameter.index;
               if (newParameter.parameterName !== originalParameter.parameterName) diff.parameterName = newParameter.parameterName;
               if (newParameter.parameterDescription !== originalParameter.parameterDescription) diff.parameterDescription = newParameter.parameterDescription;
               if (newParameter.msgPropertyMapping !== originalParameter.msgPropertyMapping) diff.msgPropertyMapping = newParameter.msgPropertyMapping;
               if (newParameter.parameterType !== originalParameter.parameterType) diff.parameterType = newParameter.parameterType;
               if (newParameter.encrypt !== originalParameter.encrypt) diff.encrypt = newParameter.encrypt;
               if (newParameter.stringValue !== originalParameter.stringValue) diff.stringValue = newParameter.stringValue;
               if (newParameter.numberValue !== originalParameter.numberValue) diff.numberValue = newParameter.numberValue;
               if (newParameter.booleanValue !== originalParameter.booleanValue) diff.booleanValue = newParameter.booleanValue;
               if (newParameter.encodedStringValue !== originalParameter.encodedStringValue) diff.encodedStringValue = newParameter.encodedStringValue;
               if (newParameter.enumeratedValue !== originalParameter.enumeratedValue) diff.enumeratedValue = newParameter.enumeratedValue;
               if (JSON.stringify(newParameter.stringListValue) !== JSON.stringify(originalParameter.stringListValue)) diff.stringListValue = newParameter.stringListValue;
               if (JSON.stringify(newParameter.numberListValue) !== JSON.stringify(originalParameter.numberListValue)) diff.numberListValue = newParameter.numberListValue;
               if (JSON.stringify(newParameter.booleanListValue) !== JSON.stringify(originalParameter.booleanListValue)) diff.booleanListValue = newParameter.booleanListValue;
               if (newParameter.jsonValue !== originalParameter.jsonValue) diff.jsonValue = newParameter.jsonValue;
               diff.outputDetails = {};
               if (newParameter.outputDetails)
               {
                  if (originalParameter.outputDetails)
                  {
                     if (newParameter.outputDetails.type !== originalParameter.outputDetails.type) diff.outputDetails.type = newParameter.outputDetails.type;
                     if (newParameter.outputDetails.format !== originalParameter.outputDetails.type) diff.outputDetails.format = newParameter.outputDetails.format;
                     if (newParameter.outputDetails.isPrivate !== originalParameter.outputDetails.isPrivate) diff.outputDetails.isPrivate = newParameter.outputDetails.isPrivate;
                  }
                  else
                  {
                     diff.outputDetails = newParameter.outputDetails;
                  }
               }
               if (isEmptyObject(diff.outputDetails)) delete diff.outputDetails;
               if (isDifferent(diff)) outputDiffArray.push(diff);
               break;
            }
         }
         if (!paramFound)
         {
            outputDiffArray.push(newParameter);
         }
      }
      return outputDiffArray;
   };

   const compressed = deepCopy(stored);
   compressed.baseTypes = [];

   for (const baseType of stored.baseTypes)
   {
      if (baseType.key === stored.selectedBaseType)
      {
         const existingBaseType = deepCopy(baseType);
         for (const configCommand of configuration.configCommands.value)
         {
            if (existingBaseType.key === configCommand.key)
            {
               configCommand.inputParameters =
                  configCommand.inputParameters.concat(configuration.commonParameters.value);
               if (baseType.inputParameters)
               {
                  existingBaseType.inputParameters =
                     JSON.parse(JSON.stringify(getInputDiffArray(existingBaseType.inputParameters, configCommand)));
               }
               if (baseType.outputParameters)
               {
                  existingBaseType.outputParameters =
                     JSON.parse(JSON.stringify(getOutputDiffArray(existingBaseType.outputParameters, configCommand)));
               }
               compressed.baseTypes.push(existingBaseType);
               break;
            }
         }
      }
   }
   return compressed;
};

const migrateFunction = (filePath) =>
{
   console.info(`Migrating flows in file ${filePath}.`);
   const ret = [];
   const fileContentsBuffer = fs.readFileSync(filePath);
   const fileContents = fileContentsBuffer.toString();
   const flowJson = JSON.parse(fileContents);
   if (Array.isArray(flowJson))
   {
      for (const flowObj of flowJson)
      {
         if (flowObj)
         {
            if (flowObj.type && typeToConfigMap.has(flowObj.type))
            {
               ret.push(compressNode(flowObj, typeToConfigMap.get(flowObj.type)));
            }
            else
            {
               ret.push(flowObj);
            }
         }
      }
      console.info(`Writing migrated flows to ${filePath}.`);
      fs.writeFileSync(filePath, JSON.stringify(ret));
   }
};

let searchPath = '/root/.node-red';
const args = process.argv.slice(2);
if (args.length > 0)
{
   searchPath = args[0];
}
recursiveSearchForFile(searchPath, /flow.*\.json$/, migrateFunction);
console.info(`Restarting ViNO...`);
exec('forever restart 0', (error, stdout, stderr) => {
   if (error) console.error(`${error}`);
   return;
});
console.info(`Finished migrating ViNO flows.`);