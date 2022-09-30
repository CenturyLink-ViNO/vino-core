import * as express from 'express';
import { getRepository } from 'typeorm';
import { ServiceRegistration } from '../../../entities/ServiceRegistration';
import { ServiceActivation } from '../../../entities/activation/ServiceActivation';
import { SettingsUtility } from '../utility/settingsUtility';
import RED from 'node-red';
import * as fileSystem from 'fs';
import util from 'util';
import { ServiceUtility } from '../utility/serviceUtility';
const readFilePromise = util.promisify(fileSystem.readFile);

export default function(keycloak): express.Router
{
   const serviceControlRouter = express.Router();
   const utility = new SettingsUtility();
   const serviceUtility = new ServiceUtility();

   /**
    * @swagger
    * /services:
    *   get:
    *     tags:
    *       - Services
    *     description: Get all Service Registrations
    *     summary: Returns a list of registered Services
    *     responses:
    *       200:
    *         description: List of Service Registrations
    *         schema:
    *           type: array
    *           items:
    *             $ref: '/swagger/serviceModels.yaml#/schemas/ServiceRegistration'
    */
   serviceControlRouter.get('/', keycloak.protect(utility.checkRoles(['realm:provisioner', 'realm:designer'])), async function(req: express.Request, res: express.Response): Promise<void>
   {
      try
      {
         const services = await getRepository(ServiceRegistration).find();
         res.send(services);
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving registered services' });
      }
   });

   /**
    * @swagger
    * /services/{serviceId}/template:
    *   get:
    *     tags:
    *       - Services
    *     description: Get a Service template by ID
    *     summary: Returns the activation template for a Service that matches the given ID
    *     parameters:
    *       - name: serviceId
    *         in: path
    *         description: ID of the Service to fetch the template for
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Service Template
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/ServiceTemplate'
    */
   serviceControlRouter.get('/:serviceId/template', keycloak.protect(utility.checkRoles(['realm:provisioner', 'realm:designer'])), async function(req: express.Request, res: express.Response): Promise<void>
   {
      const serviceId = req.params.serviceId;
      if (!serviceId)
      {
         res.status(400).send({ error: 'No Service ID was provided' });
      }
      try
      {
         const service: ServiceRegistration = await getRepository(ServiceRegistration).findOne(serviceId);
         if (service)
         {
            const node = RED.nodes.getNode(service.entryNodeId);
            const template = node.getTemplate();
            if (template)
            {
               template.serviceId = serviceId;
               res.send(template);
            }
         }
         else
         {
            res.status(400).send({ error: `No service with ID '${serviceId}' could be found` });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: `Error retrieving service template. ${error}` });
      }
   });

   /**
    * @swagger
    * /services/{serviceId}/activate:
    *   post:
    *     tags:
    *       - Services
    *     description: Activates a service using an matching ID and a Template
    *     summary: Activates a Service that matches the given ID
    *     parameters:
    *       - name: serviceId
    *         in: path
    *         description: ID of the Service that needs to be activated
    *         required: true
    *         type: string
    *       - in: body
    *         name: template
    *         description: Template for the Service that needs to be activated
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/ServiceTemplate'
    *     responses:
    *       200:
    *         description: Service Activation Status
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/Status'
    */
   serviceControlRouter.post('/:serviceId/activate', keycloak.protect(utility.checkRoles(['realm:provisioner', 'realm:designer'])), async function(req: express.Request, res: express.Response): Promise<void>
   {
      const serviceId = req.params.serviceId;
      if (!serviceId)
      {
         res.status(400).send({ error: 'No Service ID was provided' });
      }
      try
      {
         const service: ServiceRegistration = await getRepository(ServiceRegistration).findOne(serviceId);
         if (!serviceUtility.checkUserAuthorizedForUsFederalCustomer(req.body, req))
         {
            res.status(403).send({ error: 'Unauthorized to activate service for US Federal customer' });
            return;
         }
         if (service)
         {
            const node = RED.nodes.getNode(service.entryNodeId);
            const status = node.activate(req.body);
            res.send(status);
         }
         else
         {
            res.status(400).send({ error: `No service with ID '${serviceId}' could be found` });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: `Error sending activation request. ${error}` });
      }
   });

   /**
    * @swagger
    * /services/{serviceId}/status/{jobId}:
    *   get:
    *     tags:
    *       - Services
    *     description: Get a Service activations status by ID and Job-ID
    *     summary: Returns the status of an activated Service
    *     parameters:
    *       - name: serviceId
    *         in: path
    *         description: ID of the Service for the Status that needs to be fetched
    *         required: true
    *         type: string
    *       - name: jobId
    *         in: path
    *         description: ID of the job for the Status that needs to be fetched
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Service Status
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/Status'
    */
   serviceControlRouter.get('/:serviceId/status/:jobId', keycloak.protect('realm:user'), async function(req: express.Request, res: express.Response): Promise<void>
   {
      const serviceId = req.params.serviceId;
      const jobId = req.params.jobId;
      if (!serviceId || !jobId)
      {
         res.status(400).send({ error: 'No Service ID or Job ID was provided' });
      }
      try
      {
         const service: ServiceRegistration = await getRepository(ServiceRegistration).findOne(serviceId);
         if (service)
         {
            const node = RED.nodes.getNode(service.entryNodeId);
            let status = node.getActivationStatus(jobId);
            let activation = node.getActivationData(jobId)
            if (!status)
            {
               activation = await getRepository(ServiceActivation).findOne(jobId);
               if (activation)
               {
                  status = activation.status;
               }
               else
               {
                  res.status(404).send({ error: `No activation with ID '${jobId}' could be found` });
               }
            }
            if (!serviceUtility.checkUserAuthorizedForUsFederalCustomer(activation, req))
            {
               res.status(403).send({ error: 'Unauthorized to view this service activation\'s status'});
               return;
            }
            res.send(status);
         }
         else
         {
            res.status(400).send({ error: `No service with ID '${serviceId}' could be found` });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: `Error retrieving service status. ${error}` });
      }
   });

   /**
    * @swagger
    * /services/{serviceId}/cancel/{jobId}:
    *   get:
    *     tags:
    *       - Services
    *     description: Cancel a Service activations by ID and Job-ID
    *     summary: Cancels the activation of a Service
    *     parameters:
    *       - name: serviceId
    *         in: path
    *         description: ID of the Service that needs to be cancelled
    *         required: true
    *         type: string
    *       - name: jobId
    *         in: path
    *         description: ID of the job that needs to be cancelled
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Service Status
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/Status'
    */
   serviceControlRouter.get('/:serviceId/cancel/:jobId', keycloak.protect(utility.checkRoles(['realm:provisioner', 'realm:designer'])), async function(req: express.Request, res: express.Response): Promise<void>
   {
      const serviceId = req.params.serviceId;
      const jobId = req.params.jobId;
      if (!serviceId || !jobId)
      {
         res.status(400).send({ error: 'No Service ID or Job ID was provided' });
      }
      try
      {
         const service: ServiceRegistration = await getRepository(ServiceRegistration).findOne(serviceId);
         if (service)
         {
            const node = RED.nodes.getNode(service.entryNodeId);
            let activation = node.getActivationData(jobId)
            if (!serviceUtility.checkUserAuthorizedForUsFederalCustomer(activation, req))
            {
               res.status(403).send({ error: 'Unauthorized to cancel this service activation'});
               return;
            }
            const status = node.cancelActivation(jobId);
            res.send(status);
         }
         else
         {
            res.status(400).send({ error: `No service with ID '${serviceId}' could be found` });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: `Error canceling service. ${error}` });
      }
   });

   /**
    * @swagger
    * /services/activationlog/{jobId}:
    *   get:
    *     tags:
    *       - Services
    *     description: Fetch the data from a Service Activation's log file
    *     summary: Gets the log file content for an activation of a Service
    *     parameters:
    *       - name: jobId
    *         in: path
    *         description: ID of the job to fetch the log for
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Activation Log
    *         type: string
    */
   serviceControlRouter.get('/activationlog/:jobId', keycloak.protect('realm:user'), async function(req: express.Request, res: express.Response): Promise<void>
   {
      const jobId = req.params.jobId;
      if (!jobId)
      {
         res.status(400).send({ error: 'No Job ID was provided' });
      }
      try
      {
         const activation = await getRepository(ServiceActivation).findOne(jobId, {
            select: ['id', 'isUsFederalCustomer']
         });
         if (!serviceUtility.checkUserAuthorizedForUsFederalCustomer(activation, req))
         {
            res.status(403).send({ error: 'Unauthorized to view this service activation\'s log' });
            return;
         }
         const logContent = await readFilePromise('/var/log/vino/activations/' + jobId + '.log');
         res.send(logContent);
      }
      catch (error)
      {
         res.status(500).send({ error: `Error reading activation log. ${error}` });
      }
   });

   /**
    * @swagger
    * /services/{serviceId}/deactivate/{jobId}:
    *   delete:
    *     tags:
    *       - Services
    *     description: Deactivates a Service
    *     summary: Deactivates the Service that matches the given ID and Job-ID
    *     parameters:
    *       - name: serviceId
    *         in: path
    *         description: ID of the Service that needs to be deactivated
    *         required: true
    *         type: string
    *       - name: jobId
    *         in: path
    *         description: ID of the job that needs to be deactivated
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Service Status
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/Status'
    */
   serviceControlRouter.delete('/:serviceId/deactivate/:jobId', keycloak.protect(utility.checkRoles(['realm:provisioner', 'realm:designer'])), async function(req: express.Request, res: express.Response): Promise<void>
   {
      const serviceId = req.params.serviceId;
      const jobId = req.params.jobId;
      if (!serviceId || !jobId)
      {
         res.status(400).send({ error: 'No Service ID or Job ID was provided' });
      }
      try
      {  
         const activation = await getRepository(ServiceActivation).findOne(jobId, {
            select: ['id', 'isUsFederalCustomer']
         });
         if (!serviceUtility.checkUserAuthorizedForUsFederalCustomer(activation, req))
         {
            res.status(403).send({ error: 'Unauthorized to deactivate this service' });
            return;
         }
         const service: ServiceRegistration = await getRepository(ServiceRegistration).findOne(serviceId);
         if (service)
         {
            const node = RED.nodes.getNode(service.entryNodeId);
            const status = await node.deactivate(jobId);
            res.send(status);
         }
         else
         {
            res.status(400).send({ error: `No service with ID '${serviceId}' could be found` });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: `Error requesting service deactivation ${error}` });
      }
   });
   return serviceControlRouter;
}
