import * as express from 'express';
import { getRepository } from 'typeorm';
import { ServiceActivation } from '../../../entities/activation/ServiceActivation';
import { validate } from 'class-validator';
import { SettingsUtility } from '../utility/settingsUtility';

export default function(keycloak): express.Router
{
   const configurationStoreRouter = express.Router();
   const utility = new SettingsUtility();

   /**
    * DO-NOT-SHOW-IN-SWAGGER
    * /service/activated:
    *   post:
    *     tags:
    *       - Service
    *     description: Saves a Service Activation in the Configuration Store
    *     summary: Saves the Service Activation given in the body
    *     consumes:
    *       - application/json
    *     parameters:
    *       - in: body
    *         name: service activation to save
    *         description: Service activation that needs to be saved
    *         schema:
    *           type: object
    *     responses:
    *       200:
    *         description: Service Activation
    */
   configurationStoreRouter.post('/', keycloak.protect(utility.checkRoles(['realm:provisioner', 'realm:designer'])), async function(req, res: express.Response): Promise<void>
   {
      const repository = getRepository(ServiceActivation);
      const serviceActivation = repository.create(req.body);
      const validationErrors = await validate(serviceActivation);
      if (validationErrors.length > 0)
      {
         res.status(400).send({ 'error': 'Invalid service activation in request:\n' + validationErrors });
         return;
      }
      try
      {
         const result = await repository.save(serviceActivation);
         res.send(result);
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error saving the service activation' });
      }
   });

   /**
    * DO-NOT-SHOW-IN-SWAGGER
    * /service/activated/{jobId}:
    *   post:
    *     tags:
    *       - Service
    *     description: Updates a Service Activation in the Configuration Store
    *     summary: Updates a Service Activation that matches the given Job-ID
    *     parameters:
    *       - name: jobId
    *         in: path
    *         description: ID of the Service job that needs to be updated
    *         required: true
    *         type: string
    *       - in: body
    *         name: activation to update
    *         description: Service activation that needs to be updated
    *         schema:
    *           type: object
    *     responses:
    *       200:
    *         description: Service Activation
    */
   configurationStoreRouter.put('/:jobId', keycloak.protect('realm:administrator'), async function(req, res: express.Response): Promise<void>
   {
      const jobId = req.params.jobId;
      if (jobId !== null && jobId !== undefined && jobId.trim() !== '')
      {
         const repository = getRepository(ServiceActivation);
         const activation: ServiceActivation = req.body;
         const serviceActivation: ServiceActivation = repository.create(activation);
         const validationErrors = await validate(serviceActivation);
         if (validationErrors.length > 0)
         {
            res.status(400).send({ 'error': 'Invalid service activation in request:\n' + validationErrors });
            return;
         }
         try
         {
            const existing = await repository.count({ id: jobId }) > 0;
            let result = null;
            if (existing)
            {
               result = await repository.update(jobId, { status: serviceActivation.status });
            }
            else
            {
               result = await repository.save(serviceActivation);
            }
            res.send(result);
         }
         catch (error)
         {
            res.status(500).send({ error: 'Error saving the service activation' });
         }
      }
      else
      {
         res.status(400).send({ error: 'You must specify the ID of the service activation you wish to update.' });
      }
   });

   /**
    * DO-NOT-SHOW-IN-SWAGGER
    * /service/activated/{jobId}/{visible}:
    *   post:
    *     tags:
    *       - Service
    *     description: Changes the UI visibility of a Service Activation in the Configuration Store
    *     summary: Changes the UI visibility of a Service Activation that matches the given Job-ID
    *     parameters:
    *       - name: jobId
    *         in: path
    *         description: ID of the Service job that needs to change visibility
    *         required: true
    *         type: string
    *       - name: visible
    *         in: path
    *         description: A boolean indicating whether or not the service activation should be visible
    *         required: true
    *         type: boolean
    *     responses:
    *       200:
    *         description: Service Activation
    */
   configurationStoreRouter.put('/:jobId/:visible', keycloak.protect('realm:user'), async function(req, res: express.Response): Promise<void>
   {
      const jobId = req.params.jobId;
      let visible: boolean = false;
      if (req.params.visible && (req.params.visible === 'true' || req.params.visible === 'false'))
      {
         visible = req.params.visible === 'true';
      }
      else
      {
         res.status(400).send({ 'error': 'Invalid value for "visible" in request: Must be "true" or "false"' });
         return;
      }
      if (jobId && jobId.trim() !== '')
      {
         const repository = getRepository(ServiceActivation);
         const activation = await getRepository(ServiceActivation).findOne(jobId, { relations: ['status'] });
         try
         {
            const result = await repository.update(jobId, { visible: visible });
            res.send(result);
         }
         catch (error)
         {
            res.status(500).send({ error: 'Error updating the service activation' });
         }
      }
      else
      {
         res.status(400).send({ error: 'You must specify the ID of the service activation you wish to update.' });
      }
   });
   return configurationStoreRouter;
}
