import * as express from 'express';
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';
import { ServiceRegistration } from '../../../entities/ServiceRegistration';

export default function(keycloak): express.Router
{
   const serviceRegistrationRouter = express.Router();

   /**
    * DO-NOT-SHOW-IN-SWAGGER
    * /service/register:
    *   post:
    *     tags:
    *       - Service
    *     description: Registers a Service
    *     summary: Register the Service provided in the body
    *     parameters:
    *       - in: body
    *         name: service
    *         description: Service object that needs to be registered
    *         schema:
    *           type: object
    *     responses:
    *       200:
    *         description: Registered Service
    */
   serviceRegistrationRouter.post('/register', keycloak.protect('realm:designer'), async function(req, res: express.Response): Promise<void>
   {
      const repository = getRepository(ServiceRegistration);
      const registration = repository.create(req.body);
      const validationErrors = await validate(registration);
      if (validationErrors.length > 0)
      {
         res.status(400).send({ 'error': 'Invalid registration in request:\n' + validationErrors });
         return;
      }
      try
      {
         const result = await repository.save(registration);
         res.send(result);
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error saving the service registration' });
      }
   });

   /**
    * DO-NOT-SHOW-IN-SWAGGER
    * /service/unregister/{serviceId}:
    *   delete:
    *     tags:
    *       - Service
    *     description: Unregisters a Service
    *     summary: Deletes the Service that matches the given ID
    *     parameters:
    *       - name: serviceId
    *         in: path
    *         description: ID of the Service that needs to be unregistered
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Deleted Service
    */
   serviceRegistrationRouter.delete(
      '/unregister/:serviceId',
      keycloak.protect('realm:designer'),
      async function(req: express.Request, res: express.Response): Promise<void>
      {
         const serviceId = req.params.serviceId;
         const repository = getRepository(ServiceRegistration);
         if (!serviceId)
         {
            res.status(400).send({ error: 'No Service ID was provided' });
            return;
         }
         try
         {
            const service = await repository.findOne(serviceId);
            if (service)
            {
               await repository.remove(service);
               res.status(200).send();
            }
            else
            {
               res.status(400).send({ error: `No service with ID '${serviceId}' could be found` });
            }
         }
         catch (error)
         {
            res.status(500).send({ error: 'Error deleting service' });
         }
      }
   );
   return serviceRegistrationRouter;
}
