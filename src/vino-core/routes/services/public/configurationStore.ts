import * as express from 'express';
import { FindManyOptions, getRepository } from 'typeorm';
import { ServiceActivation } from '../../../entities/activation/ServiceActivation';
import { StepWrapper } from '../../../entities/activation/StepWrapper';
import { ServiceUtility } from '../utility/serviceUtility';
import { Step } from '../../../entities/activation/Step';
import {usFederalCustomerRole} from '../../../app';



export default function(keycloak): express.Router
{
   const configurationStoreRouter = express.Router();
   const utility = new ServiceUtility();

   /**
    * @swagger
    * /services/activated:
    *   get:
    *     tags:
    *       - Services
    *     description: Get all activated Services in the Configuration Store
    *     summary: Returns a list of activated Services
    *     responses:
    *       200:
    *         description: List of activated Services
    *         schema:
    *           type: array
    *           items:
    *             $ref: '/swagger/serviceModels.yaml#/schemas/ServiceActivation'
    */
   configurationStoreRouter.get('/', keycloak.protect('realm:user'), async function(req: express.Request & {kauth: any}, res: express.Response): Promise<void>
   {
      try
      {
         const queryOptions: FindManyOptions<ServiceActivation> = {
            select: ['id', 'referenceId', 'name', 'description', 'visible', 'customerName', 'notes', 'startTime', 'settingsRootGroup', 'isUsFederalCustomer'],
            relations: ['status']
         };
         const token = req.kauth?.grant?.access_token;

         if (!token || !token.hasRealmRole(usFederalCustomerRole))
         {
            queryOptions.where = [{isUsFederalCustomer: false}];
         }

         let activations = await getRepository(ServiceActivation).find(queryOptions);
         if (req.query && req.query.filterVisible === 'true')
         {
            activations = activations.filter(activation => activation.visible);
         }
         res.send(activations);
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving service activations' });
      }
   });

   /**
    * @swagger
    * /services/activated/{jobId}:
    *   get:
    *     tags:
    *       - Services
    *     description: Get an activated Service from the Configuration Store
    *     summary: Returns the activated Service that matches the given Job-ID
    *     parameters:
    *       - name: jobId
    *         in: path
    *         description: Job-ID of the Activated Service that needs to be fetched
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Activated Service
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/ServiceActivation'
    */
   configurationStoreRouter.get('/:jobId', keycloak.protect('realm:user'), async function(req: express.Request, res: express.Response): Promise<void>
   {
      try
      {
         const jobId = req.params.jobId;
         if (jobId !== null && jobId !== undefined && jobId.trim() !== '')
         {
            const activation = await getRepository(ServiceActivation).findOne(jobId, {
               select: ['id', 'referenceId', 'name', 'description', 'visible', 'customerName', 'notes', 'startTime', 'settingsRootGroup', 'isUsFederalCustomer'],
               relations: ['status']
            });
            if (!utility.checkUserAuthorizedForUsFederalCustomer(activation, req))
            {
               res.status(403).send({ error: 'Unauthorized to view this service activation'});
               return;
            }
            res.send(activation);
         }
         else
         {
            res.status(400).send({ error: 'You must specify the ID of the service activation you are querying for.' });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving service activation' });
      }
   });

   /**
    * @swagger
    * /services/activated/{jobId}/steps:
    *   get:
    *     tags:
    *       - Services
    *     description: Get the step metadata for an activated Service from the Configuration Store
    *     summary: Returns the step metadata for the activated Service that matches the given Job-ID
    *     parameters:
    *       - name: jobId
    *         in: path
    *         description: Job-ID of the Activated Service which contains the steps that need to have their metadata fetched
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Activated Service Step Metadata
    *         schema:
    *           type: array
    *           items:
    *             $ref: '/swagger/serviceModels.yaml#/schemas/StepWrapper'
    */
   configurationStoreRouter.get('/:jobId/steps', keycloak.protect('realm:user'), async function(req: any, res: express.Response): Promise<void>
   {
      const authToken = req.kauth.grant.access_token;
      try
      {
         const jobId = req.params.jobId;
         if (jobId !== null && jobId !== undefined && jobId.trim() !== '')
         {
            const activation = await getRepository(ServiceActivation).findOne(jobId, {
               select: ['id', 'isUsFederalCustomer']
            });
            if (!utility.checkUserAuthorizedForUsFederalCustomer(activation, req))
            {
               res.status(403).send({ error: 'Unauthorized to view this service activation'});
               return;
            }
            let steps = await getRepository(StepWrapper).find({
               select: ['id', 'nodeId'],
               where: [{ serviceActivation: jobId }]
            });
            for (let step of steps) {
               const stepInstances = await getRepository(Step).find({
                  select: ['id', 'name', 'nodeId', "activatedTime"],
                  where: [{stepWrapper: step.id}]
               });
               step.steps = stepInstances;
               if (!authToken.hasRealmRole('administrator'))
               {
                  step = await utility.protectEncryptedData(step);
               }
            }
            res.send(steps);
         }
         else
         {
            res.status(400).send({ error: 'You must specify the ID of the service activation you are querying step metadata for.' });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving service activation step metadata' });
      }
   });

   /**
    * @swagger
    * /services/activated/{jobId}/steps/{stepId}:
    *   get:
    *     tags:
    *       - Services
    *     description: Get the step details for a step in an activated Service from the Configuration Store
    *     summary: Returns the step details for the step in the activated Service that matches the given Job-ID and Step-ID
    *     parameters:
    *       - name: jobId
    *         in: path
    *         description: Job-ID of the Activated Service which contains the steps that need to have their metadata fetched
    *         required: true
    *         type: string
    *       - name: stepId
    *         in: path
    *         description: ID of the Activated Service Step that you are looking for details for
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Activated Service Step Details
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/StepWrapper'
    */
   configurationStoreRouter.get('/:jobId/steps/:stepId', keycloak.protect('realm:user'), async function(req: any, res: express.Response): Promise<void>
   {
      const authToken = req.kauth.grant.access_token;
      try
      {
         const jobId = req.params.jobId;
         let stepId = req.params.stepId;
         if (jobId === null || jobId === undefined || jobId.trim() === '')
         {
            res.status(400).send({ error: 'You must specify the ID of the service activation you are querying step metadata for.' });
            return;
         }
         if (stepId !== null && stepId !== undefined && stepId.trim() !== '')
         {
            const activation = await getRepository(ServiceActivation).findOne(jobId, {
               select: ['id', 'isUsFederalCustomer']
            });
            if (!utility.checkUserAuthorizedForUsFederalCustomer(activation, req))
            {
               res.status(403).send({ error: 'Unauthorized to view this service activation'});
               return;
            }
            let step = await getRepository(StepWrapper).findOne(stepId, { relations: ['steps'] });
            if (!authToken.hasRealmRole('administrator'))
            {
               step = await utility.protectEncryptedData(step);
            }
            res.send(step);
         }
         else
         {
            res.status(400).send({ error: 'You must specify the ID of the service activation you are querying step metadata for.' });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving service activation step metadata' });
      }
   });
   /**
    * @swagger
    * /services/activated/{jobId}/activationTemplate:
    *   get:
    *     tags:
    *       - Services
    *     description: Get the original activation template used for an activated service
    *     summary: Returns the activation template that matches the given Job-ID
    *     parameters:
    *       - name: jobId
    *         in: path
    *         description: Job-ID of the Activated Service that needs to be fetched
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Activation Template 
    *         schema:
    *           $ref: '/swagger/serviceModels.yaml#/schemas/ServiceTemplate'
    */
   configurationStoreRouter.get('/:jobId/activationTemplate', keycloak.protect('realm:user'), async function(req: any, res: express.Response): Promise<void>
   {
      try
      {
         const jobId = req.params.jobId;
         if (jobId !== null && jobId !== undefined && jobId.trim() !== '')
         {
            const activation = await getRepository(ServiceActivation).findOne(jobId, {
               select: ['inputTemplate', 'isUsFederalCustomer'],
               relations: ['status']
            });
            if (!utility.checkUserAuthorizedForUsFederalCustomer(activation, req))
            {
               res.status(403).send({ error: 'Unauthorized to view this service activation'});
               return;
            }
            res.send(activation.inputTemplate);
         }
         else
         {
            res.status(400).send({ error: 'You must specify the ID of the service activation you are querying for.' });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving service activation template' });
      }
   });
   return configurationStoreRouter;
}
