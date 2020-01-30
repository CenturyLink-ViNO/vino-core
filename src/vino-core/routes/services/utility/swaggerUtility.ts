import { getRepository } from 'typeorm';
import { ServiceRegistration } from '../../../entities/ServiceRegistration';
import RED from 'node-red';

export class SwaggerUtility
{
   private swaggerBody =
   {
      'info':
         {
            'title': 'ViNO Service Flows',
            'version': '1.0.0'
         },
      'basePath': '/rest',
      'swagger': '2.0',
      'paths': {},
      'definitions': {},
      'responses': {},
      'parameters': {},
      'securityDefinitions': {},
      'tags': []
   };

   private activatePathSpec =
   {
      'post':
         {
            'tags': [],
            'description': 'Activates a service using an matching ID and a Template',
            'parameters': [
               {
                  'name': 'serviceId',
                  'in': 'path',
                  'description': 'ID of the Service that needs to be activated',
                  'required': true,
                  'type': 'string'
               },
               {
                  'in': 'body',
                  'name': 'template',
                  'description': 'Template for the Service that needs to be activated',
                  'schema': { '$ref': '/swagger/serviceModels.yaml#/schemas/ServiceTemplate' }
               }
            ],
            'responses':
               {
                  '200':
                  {
                     'description': 'Service Activation Status',
                     'schema': { '$ref': '/swagger/serviceModels.yaml#/schemas/Status' }
                  }
               }
         }
   };

   private templatePathSpec =
   {
      'get':
      {
         'tags': [],
         'description': 'Get a Service template by ID',
         'parameters': [
            {
               'name': 'serviceId',
               'in': 'path',
               'description': 'ID of the Service to fetch the template for',
               'required': true,
               'type': 'string'
            }
         ],
         'responses':
         {
            '200':
            {
               'description': 'Service Template',
               'schema': { '$ref': '/swagger/serviceModels.yaml#/schemas/ServiceTemplate' }
            }
         }
      }
   };

   public async generateFlowsSwagger(): Promise<{}>
   {
      const services: ServiceRegistration[] = await getRepository(ServiceRegistration).find();
      if (services)
      {
         this.swaggerBody.paths = {};
         for (const service of services)
         {
            const node = RED.nodes.getNode(service.entryNodeId);
            if (node)
            {
               const activatePath = JSON.parse(JSON.stringify(this.activatePathSpec));
               const templatePath = JSON.parse(JSON.stringify(this.templatePathSpec));
               activatePath.post.description = node.description;
               activatePath.post.tags.push(node.name);
               activatePath.post.parameters[0].default = node.serviceRegistrationId;
               templatePath.get.description = 'Fetches the Template for \'' + node.name + '\' to be used during service activation';
               templatePath.get.tags.push(node.name);
               templatePath.get.parameters[0].default = node.serviceRegistrationId;
               this.swaggerBody.paths['/services/' + node.serviceRegistrationId + '/template'] = templatePath;
               this.swaggerBody.paths['/services/' + node.serviceRegistrationId + '/activate'] = activatePath;
            }
         }
      }
      return this.swaggerBody;
   }
}
