import * as express from 'express';
import { RootGroup } from '../../../entities/settings/rootGroup';
import { SystemSetting } from '../../../entities/settings/systemSetting';
import { SettingsUtility } from '../utility/settingsUtility';
import { getRepository } from 'typeorm';

export default function(keycloak): express.Router
{
   const settingsServerRouter = express.Router();
   const utility = new SettingsUtility();

   /**
    * @swagger
    * /settings/all:
    *   get:
    *     tags:
    *       - Settings
    *     description: Get all Settings Categories and Data
    *     summary: Returns a list of Root Groups
    *     responses:
    *       200:
    *         description: List of Root Groups
    *         schema:
    *           type: object
    *           properties:
    *             entries:
    *               type: object
    *               properties:
    *                 value:
    *                   type: array
    *                   items:
    *                     $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    */
   settingsServerRouter.get('/all', keycloak.protect(utility.checkRoles(['realm:administrator', 'realm:designer', 'realm:provisioner'])), async function(req: any, res: express.Response): Promise<void>
   {
      const authToken = req.kauth.grant.access_token;
      try
      {
         let settings: RootGroup[] = await getRepository(RootGroup).find({ relations: ['defaults', 'defaults.groups', 'groups'] });
         settings = await utility.expandRootGroups(settings);
         if (!authToken.hasRealmRole('administrator') && Array.isArray(settings))
         {
            for (let rootGroup of settings)
            {
               rootGroup = await utility.protectEncryptedData(rootGroup);
            }
         }
         res.send({ entries: { value: settings } });
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving settings groups' });
      }
   });

   /**
    * DO-NOT-SHOW-IN-SWAGGER
    * /settings/system:
    *   get:
    *     tags:
    *       - Settings
    *     description: Get all System Settings
    *     summary: Returns a list of System Settings
    *     responses:
    *       200:
    *         description: List of System Settings
    */
   settingsServerRouter.get('/system', keycloak.protect('realm:administrator'), async function(req: express.Request, res: express.Response): Promise<void>
   {
      try
      {
         const settings = await getRepository(SystemSetting).find();
         res.send(settings);
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving system settings' });
      }
   });

   /**
    * DO-NOT-SHOW-IN-SWAGGER
    * /settings/system/{key}:
    *   get:
    *     tags:
    *       - Settings
    *     description: Get a System Setting by key
    *     summary: Returns a System Setting that matches the given key
    *     parameters:
    *       - name: key
    *         in: path
    *         description: Key of System Setting that needs to be fetched
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: System Setting
    */
   settingsServerRouter.get('/system/:key', keycloak.protect('realm:administrator'), async function(req: express.Request, res: express.Response): Promise<void>
   {
      const key = req.params.key;
      if (!key)
      {
         res.status(400).send({ error: 'No Settings Key was provided' });
      }
      try
      {
         const setting = await getRepository(SystemSetting).findOne({ key: key });
         if (setting)
         {
            res.send(setting);
         }
         else
         {
            res.status(400).send({ error: `No system setting with key '${key}' could be found` });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving system setting' });
      }
   });

   /**
    * @swagger
    * /settings/group/{name}:
    *   get:
    *     tags:
    *       - Settings
    *     description: Get a Settings Categories by name
    *     summary: Returns a Root Group that matches the given name
    *     parameters:
    *       - name: name
    *         in: path
    *         description: Name of Root Group that needs to be fetched
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Root Group
    *         schema:
    *           $ref: '/swagger/settingsModels.yaml#/schemas/RootGroup'
    */
   settingsServerRouter.get('/group/:name', keycloak.protect(utility.checkRoles(['realm:administrator', 'realm:designer'])), async function(req: any, res: express.Response): Promise<void>
   {
      const authToken = req.kauth.grant.access_token;
      const name = req.params.name;
      if (!name)
      {
         res.status(400).send({ error: 'No Group Name was provided' });
      }
      try
      {
         let group = await getRepository(RootGroup).findOne({ name: name }, { relations: ['defaults', 'defaults.groups', 'groups'] });
         if (group)
         {
            group = await utility.expandRootGroup(group);
            if (!authToken.hasRealmRole('administrator'))
            {
               group = await utility.protectEncryptedData(group);
            }
            res.send(group);
         }
         else
         {
            res.status(400).send({ error: `No settings group with name '${name}' could be found` });
         }
      }
      catch (error)
      {
         res.status(500).send({ error: 'Error retrieving settings group' });
      }
   });
   return settingsServerRouter;
}
