import * as express from 'express';
import { getRepository } from 'typeorm';
import { ServiceActivation } from '../../../entities/activation/ServiceActivation';
import { StepWrapper } from '../../../entities/activation/StepWrapper';
import { ServiceUtility } from '../utility/serviceUtility';
import { Step } from '../../../entities/activation/Step';

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
   configurationStoreRouter.get('/', keycloak.protect('realm:user'), async function(req: express.Request, res: express.Response): Promise<void>
   {
      try
      {
         let activations = await getRepository(ServiceActivation).find({
            select: ['id', 'referenceId', 'name', 'description', 'visible', 'customerName', 'notes', 'startTime', 'settingsRootGroup'],
            relations: ['status']
         });
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
               select: ['id', 'referenceId', 'name', 'description', 'visible', 'customerName', 'notes', 'startTime', 'settingsRootGroup'],
               relations: ['status']
            });
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
         let stepId = req.params.stepId;
         if (stepId !== null && stepId !== undefined && stepId.trim() !== '')
         {
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
               select: ['inputTemplate'],
               relations: ['status']
            });
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
