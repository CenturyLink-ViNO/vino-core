import * as express from 'express';
import { getRepository } from 'typeorm';

import MenuItem from '../entities/ui/MenuItem';
import InstalledDockerContainers from '../entities/ui/InstalledDockerContainers';

async function filterMenuItemChildren(menuItems, token): Promise<MenuItem[]>
{
   const repository = getRepository(MenuItem);
   let ret: MenuItem[];

   ret = menuItems.filter((item): boolean =>
   {
      const allowedRoles = item.allowedRole.split(',');
      for (const allowedRole of allowedRoles)
      {
         if (token.hasRealmRole(allowedRole))
         {
            return true;
         }
      }
      return false;
   });
   ret = ret.sort((first, second): number =>
   {
      return first.ordinal - second.ordinal;
   });
   let indx;
   const expandedChildrenPromises = [];
   for (indx = 0; indx < ret.length; indx = indx + 1)
   {
      const id = ret[indx].id;
      expandedChildrenPromises.push(repository.findOne(id, { relations: ['children'] }));
   }
   const expandedChildren = await Promise.all(expandedChildrenPromises);

   const filteredPromises = [];
   for (indx = 0; indx < ret.length; indx = indx + 1)
   {
      filteredPromises.push(filterMenuItemChildren(expandedChildren[indx].children, token));
   }
   const filteredResults = await Promise.all(filteredPromises);

   let children;
   for (indx = 0; indx < ret.length; indx = indx + 1)
   {
      ret[indx] = expandedChildren[indx];
      children = filteredResults[indx];
      if (children.length > 0)
      {
         ret[indx].children = children;
      }
      else
      {
         delete ret[indx].children;
      }
   }
   return ret;
}

export default function(): express.Router
{
   const uiRouter = express.Router();

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   uiRouter.get('/web-ui/menus', async function(req: any, res: express.Response): Promise<void>
   {
      const repository = getRepository(MenuItem);

      const authToken = req.kauth.grant.access_token;

      const mainMenu = await repository.findOne('main_menu', { relations: ['children'] });
      let children;
      if (mainMenu)
      {
         children = await filterMenuItemChildren(mainMenu.children, authToken);
         mainMenu.children = children;
      }
      const controlMenu = await repository.findOne('control_menu', { relations: ['children'] });
      if (controlMenu)
      {
         children = await filterMenuItemChildren(controlMenu.children, authToken);
         controlMenu.children = children;
      }

      res.send({ 'main_menu': mainMenu, 'control_menu': controlMenu });
   });

   uiRouter.get('/help/about/installedContainersDetails', async function(req, res): Promise<void>
   {
      try
      {
         const details = await InstalledDockerContainers.details();
         // Wrap it to match existing API
         res.send({ containers: details });
      }
      catch (err)
      {
         res.status(500).send(err);
      }
   });

   return uiRouter;
}
