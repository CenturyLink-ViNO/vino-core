import * as express from 'express';
import ProjectManager from '../node-red/ProjectManager';
import fileSystem from 'fs';

export default function(nodeRed): express.Router
{
   const nodeRedRouter = express.Router();
   const manager = new ProjectManager(nodeRed);

   nodeRedRouter.get('/active', async function(req, res: express.Response): Promise<void>
   {
      try
      {
         const project = await manager.getCurrentProject();
         res.send(project);
      }
      catch (error)
      {
         res.status(500).send({ error: `Error retrieving the current project's status: ${error}` });
      }
   });

   /*
      Expected format of request.body:

      {
          "name": "the-name-of-your-service",
          "credentialSecret": "encryption-key (optional, leave blank for none)",
          "git": {
              "remotes": {
                  "origin": {
                      "url": "URL to your flows (SSH auth only)",
                      "keyFile": "the name of the ssh key to use (see /node-red-control/settings/keys",
                      "passphrase": "the passphrase for your ssh key (if needed, leave blank for none)"
                  }
              },
              "branches": {
                  "local": "local branch name",
                  "remote": "remote branch name"
              }
          }
      }
   */
   nodeRedRouter.post('/create', async function(req, res: express.Response): Promise<void>
   {
      try
      {
         let project = await manager.getCurrentProject();
         if (project)
         {
            res.send(400).send({ error: 'There is already an active project set in this Node-Red instance. The project can only be set once.' });
            return;
         }

         await manager.createProject(req.body);
         project = await manager.getCurrentProject();
         res.send(project);
      }
      catch (error)
      {
         res.status(500).send({ error: `Error while creating project: ${error}` });
      }
   });

   nodeRedRouter.post('/branches/change', async function(req, res: express.Response): Promise<void>
   {
      try
      {
         let project = await manager.getCurrentProject();
         await manager.changeBranch(project.name, req.body.git.branches);
         project = await manager.getCurrentProject();
         res.send(project);
      }
      catch (error)
      {
         res.status(500).send({ error: `Error while attempting to change project branches: ${error}` });
      }
   });

   nodeRedRouter.post('/modules/add', async function(req, res: express.Response): Promise<void>
   {
      try
      {
         await manager.addNodeModule(req.body.user, req.body.module);
         res.status(200).send();
      }
      catch (error)
      {
         res.status(500).send({ error: `Error while attempting to add node module: ${error}` });
      }
   });

   nodeRedRouter.post('/settings/keys', function(req, res: express.Response): void
   {
      try
      {
         const privateKey = req.body.privateKey; // Must be a well-formed private key
         const publicKey = req.body.publicKey;
         const name = req.body.name;

         if (!name || name.includes(' ') || name.includes('/'))
         {
            res.status(400).send('Invalid ssh key name');
         }
         fileSystem.writeFile('/root/.node-red/projects/.sshkeys/__default_' + name, privateKey, { mode: 0o400 }, function(err)
         {
            if (err)
            {
               res.status(500).send('Error writing private key to file. ' + err);
            }
            fileSystem.writeFile('/root/.node-red/projects/.sshkeys/__default_' + name + '.pub', publicKey, function(innerErr)
            {
               if (innerErr)
               {
                  res.status(500).send('Error writing public key to file. ' + innerErr);
               }

               res.status(200).send();
            });
         });
      }
      catch (error)
      {
         res.status(500).send({ error: `Error while writing SSH key to file: ${error}` });
      }
   });

   return nodeRedRouter;
}
