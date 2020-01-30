import * as express from 'express';
import * as fileSystem from 'fs';
import RED from 'node-red';
import formidable from 'formidable';
const fileUploadRouter = express.Router();

const nodeRedProjectsPath = '/root/.node-red/projects/';

/**
 * @swagger
 * /files:
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
fileUploadRouter.get('/', async function(req: express.Request, res: express.Response): Promise<void>
{
   try
   {
      const projects = await RED.runtime.projects.listProjects('admin');
      const ret = [];
      if (!projects || !projects.active)
      {
         throw new Error('Could not determine active project');
      }

      const path = nodeRedProjectsPath + projects.active + '/vino/';

      fileSystem.readdir(path, function(err, files)
      {
         if (err)
         {
            res.status(500).send(err);
            return;
         }
         files.forEach(function(file)
         {
            ret.push({
               fileName: file,
               path: path + file
            });
         });
         res.send(ret);
      });
   }
   catch (err)
   {
      res.status(500).send(err);
   }
});

fileUploadRouter.post('/upload', function(req: express.Request, res: express.Response): void
{
   try
   {
      const form = new formidable.IncomingForm();
      form.parse(req, async function(parseErr, fields, files)
      {
         const oldpath = files.file.path;
         const projects = await RED.runtime.projects.listProjects('admin');
         if (!projects || !projects.active)
         {
            throw new Error('Could not determine active project');
         }
         const destDir = nodeRedProjectsPath + projects.active + '/vino/';
         fileSystem.mkdir(destDir, { recursive: true }, function(mkdirErr)
         {
            if (mkdirErr)
            {
               if (mkdirErr.code !== 'EEXIST')
               {
                  res.status(500).send(mkdirErr);
                  return;
               }
            }
            const newpath = destDir + files.file.name;
            fileSystem.copyFile(oldpath, newpath, function(copyErr)
            {
               if (copyErr)
               {
                  res.status(500).send(copyErr);
                  return;
               }
               res.status(200).send();
            });
         });
      });
   }
   catch (err)
   {
      res.status(500).send(err);
   }
});

export default fileUploadRouter;