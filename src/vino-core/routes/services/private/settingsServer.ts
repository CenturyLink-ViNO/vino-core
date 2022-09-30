import * as express from 'express';
import { RootGroup } from '../../../entities/settings/rootGroup';
import { SystemSetting } from '../../../entities/settings/systemSetting';
import { SettingsUtility } from '../utility/settingsUtility';
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';

export default function(keycloak): express.Router
{
   const settingsServerPrivateRouter = express.Router();
   const utility = new SettingsUtility();

   /**
    * @swagger
    * /settings/group:
    *   post:
    *     tags:
    *       - Settings
    *     description: Adds a new Category to the Settings Server, or updates an existing one
    *     summary: Adds a Root Group or updates an existing one with the same name
    *     consumes:
    *       - application/json
    *     parameters:
    *       - in: body
    *         name: group to add
    *         description: Root Group object that needs to be added
    *         schema:
    *           $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    *     responses:
    *       200:
    *         description: Added or updated Root Group
    *         schema:
    *           $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    */
   settingsServerPrivateRouter.post('/group', keycloak.protect('realm:administrator'), async function(req, res: express.Response): Promise<void>
   {
      async function processGroup(group: RootGroup)
      {
         let existing = await repository.findOne({ name: group.name }, { relations: ['defaults', 'groups'] });
         if (existing)
         {
            existing = await utility.expandRootGroup(existing);
            existing.merge(group, false);
            return existing;
         }
         else
         {
            return group;
         }
      }
      // For compatibility reasons we need to accept either a single object at the root or an array of object, so wrap root object in array.
      let body = req.body;
      if (typeof body === 'object' && !Array.isArray(body))
      {
         body = [body];
      }
      const repository = getRepository(RootGroup);
      const groups = repository.create(body as Array<RootGroup>);

      // Validate each group and reduce the errors to a flat array
      const validationErrors = (await Promise.all(groups.map((group) => validate(group)))).
         reduce((prev, current) => prev.concat(current), []);
      if (validationErrors.length > 0)
      {
         res.status(400).send({ 'error': 'Invalid group in request:\n' + validationErrors });
         return;
      }
      try
      {
         const groupsToSave = await Promise.all(groups.map(processGroup));
         const result = await repository.save(groupsToSave);
         res.send(result);
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error saving the settings group' });
      }
   });

   /**
    * @swagger
    * /settings/defaults:
    *   post:
    *     tags:
    *       - Settings
    *     description: Adds a new defaults group to a Root Group in the Settings Server, or updates an existing one
    *     summary: Takes a Root Group and adds or updates defaults in the Root Group of the same name
    *     consumes:
    *       - application/json
    *     parameters:
    *       - in: body
    *         name: group to add
    *         description: Root Group containing defaults that need to be added
    *         schema:
    *           $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    *     responses:
    *       200:
    *         description: Added or updated Root Group
    *         schema:
    *           $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    */
   settingsServerPrivateRouter.post('/defaults', keycloak.protect('realm:administrator'), async function(req, res: express.Response): Promise<void>
   {
      const repository = getRepository(RootGroup);
      const group = repository.create(req.body as RootGroup);
      const validationErrors = await validate(group);
      if (validationErrors.length > 0)
      {
         res.status(400).send({ 'error': 'Invalid group in request:\n' + validationErrors });
         return;
      }
      try
      {
         let existing = await repository.findOne({ name: group.name }, { relations: ['defaults', 'groups'] });
         let result;
         if (existing)
         {
            existing = await utility.expandRootGroup(existing);
            if (group.defaults)
            {
               existing.merge(group, true);
            }
            else
            {
               res.status(400).send({ 'error': 'No defaults group found in request' });
               return;
            }
            result = await repository.save(existing);
         }
         else
         {
            result = await repository.save(group);
         }
         res.send(result);
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error saving the settings defaults group' });
      }
   });

   /**
    * @swagger
    * /settings/replace:
    *   post:
    *     tags:
    *       - Settings
    *     description: Replaces a Category in the Settings Server, or creates a new one
    *     summary: Creates a Root Group or replaces an existing one with the same name
    *     consumes:
    *       - application/json
    *     parameters:
    *       - in: body
    *         name: replacement group
    *         description: Root Group to replace existing Root Group
    *         schema:
    *           $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    *     responses:
    *       200:
    *         description: Root Group
    *         schema:
    *           $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    */
   settingsServerPrivateRouter.post('/replace', keycloak.protect('realm:administrator'), async function(req, res: express.Response): Promise<void>
   {
      const repository = getRepository(RootGroup);
      const group = repository.create(req.body as RootGroup);
      const validationErrors = await validate(group);
      if (validationErrors.length > 0)
      {
         res.status(400).send({ 'error': 'Invalid group in request:\n' + validationErrors });
         return;
      }
      try
      {
         let existing = await repository.findOne({ name: group.name }, { relations: ['defaults', 'groups'] });
         if (existing)
         {
            existing = await utility.expandRootGroup(existing);
            await utility.cascadeDelete(existing);
         }
         const result = await repository.save(group);
         res.send(result);
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error saving the settings group' });
      }
   });

   /**
    * DO-NOT-SHOW-IN-SWAGGER
    * /settings/system:
    *   post:
    *     tags:
    *       - Settings
    *     description: Updates a System Setting in the Settings Server
    *     summary: Updates a System Setting with the same key
    *     consumes:
    *       - application/json
    *     parameters:
    *       - in: body
    *         name: replacement setting
    *         description: System Setting to update existing System Setting
    *         schema:
    *           type: object
    *     responses:
    *       200:
    *         description: System Setting
    */
   settingsServerPrivateRouter.post('/system', keycloak.protect('realm:administrator'), async function(req, res: express.Response): Promise<void>
   {
      const repository = getRepository(SystemSetting);

      const setting = repository.create(req.body as SystemSetting);
      const validationErrors = await validate(setting);
      if (validationErrors.length > 0)
      {
         res.status(400).send({ 'error': 'Invalid setting in request:\n' + validationErrors });
         return;
      }
      try
      {
         const existing = await repository.findOne({ key: setting.key });
         if (existing)
         {
            existing.updateFrom(setting);
            const result = await repository.save(existing);
            res.send(result);
         }
         else
         {
            res.status(400).send({
               'error': 'Attempting to update a system setting that does not exist:\n' +
                  validationErrors
            });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error saving the system setting' });
      }
   });

   /**
    * @swagger
    * /settings/deleteRootGroup/{rootGroupName}:
    *   delete:
    *     tags:
    *       - Settings
    *     description: Deletes a Settings Category on the Settings Server
    *     summary: Deletes a Root Group with the given name
    *     parameters:
    *       - name: group to delete
    *         in: path
    *         description: Name of Root Group that needs to be deleted
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Root Group
    *         schema:
    *           $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    */
   settingsServerPrivateRouter.delete(
      '/deleteRootGroup/:rootGroupName',
      keycloak.protect('realm:administrator'),
      async function(req: express.Request, res: express.Response): Promise<void>
      {
         const rootGroupName = req.params.rootGroupName;
         const repository = getRepository(RootGroup);
         if (!rootGroupName)
         {
            res.status(400).send({ error: 'The name of the rootGroup you wish to delete must be passed in the URL' });
            return;
         }
         try
         {
            let group = await repository.findOne({ name: rootGroupName }, { relations: ['defaults', 'groups'] });
            if (group)
            {
               group = await utility.expandRootGroup(group);
               const result = await utility.cascadeDelete(group);
               res.send(result);
            }
            else
            {
               res.status(400).send({ error: `No rootGroup named '${rootGroupName}' could be found` });
            }
         }
         catch (error)
         {
            res.status(500).send({ error: 'Error deleting rootGroup' });
         }
      }
   );
   return settingsServerPrivateRouter;
}
