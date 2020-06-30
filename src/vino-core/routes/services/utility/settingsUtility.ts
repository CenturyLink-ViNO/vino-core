import { RootGroup } from '../../../entities/settings/rootGroup';
import { SettingsGroup } from '../../../entities/settings/settingsGroup';
import { Scalar } from '../../../entities/settings/scalar';
import { ScalarList } from '../../../entities/settings/scalarList';
import { getRepository, DeleteResult } from 'typeorm';

export class SettingsUtility
{
   public async protectEncryptedData(rootGroup: RootGroup): Promise<RootGroup>
   {
      if (rootGroup.defaults)
      {
         rootGroup.defaults = this.protectEncryptedDataRecursive(rootGroup.defaults);
      }
      if (rootGroup.groups && Array.isArray(rootGroup.groups))
      {
         for (let group of rootGroup.groups)
         {
            group = this.protectEncryptedDataRecursive(group);
         }
      }
      return rootGroup;
   }

   public protectEncryptedDataRecursive(group: SettingsGroup): SettingsGroup
   {
      if (group.scalars && Array.isArray(group.scalars))
      {
         for (const scalar of group.scalars)
         {
            if (scalar.encrypt)
            {
               scalar.value = '*******';
            }
         }
      }
      if (group.scalarLists && Array.isArray(group.scalarLists))
      {
         for (const list of group.scalarLists)
         {
            if (list.entries && Array.isArray(list.entries))
            {
               for (const scalar of list.entries)
               {
                  if (scalar.encrypt)
                  {
                     scalar.value = '*******';
                  }
               }
            }
         }
      }
      if (group.groups && Array.isArray(group.groups))
      {
         for (let nestedGroup of group.groups)
         {
            nestedGroup = this.protectEncryptedDataRecursive(nestedGroup);
         }
      }
      return group;
   }

   public async expandRootGroups(settings: RootGroup[]): Promise<RootGroup[]>
   {
      const ret: RootGroup[] = [];
      if (settings !== null && settings !== undefined && Array.isArray(settings))
      {
         for (const idx in settings)
         {
            if (settings.hasOwnProperty(idx))
            {
               const rootGroup: RootGroup = await this.expandRootGroup(settings[idx]);
               rootGroup.inheritDefaults();
               ret.push(rootGroup);
            }
         }
      }
      return ret;
   }

   public async expandRootGroup(rootGroup: RootGroup): Promise<RootGroup>
   {
      const newDefaults = await this.expandSettingsGroup(rootGroup.defaults);
      rootGroup.defaults = newDefaults;
      if (rootGroup.groups !== null && rootGroup.groups !== undefined && Array.isArray(rootGroup.groups))
      {
         const newGroups = await this.expandSettingsGroupList(rootGroup.groups);
         rootGroup.groups = newGroups;
      }
      return rootGroup;
   }

   public async expandSettingsGroupList(groups: SettingsGroup[]): Promise<SettingsGroup[]>
   {
      for (const idx in groups)
      {
         if (groups.hasOwnProperty(idx))
         {
            const newGroup = await this.expandSettingsGroup(groups[idx]);
            groups[idx] = newGroup;
         }
      }
      return groups;
   }

   public async expandSettingsGroup(group: SettingsGroup): Promise<SettingsGroup>
   {
      let ret = null;
      if (group !== null && group !== undefined)
      {
         ret = await getRepository(SettingsGroup).findOne(group.id, { relations: ['groups'] });
         if (ret.groups !== null && ret.groups !== undefined && Array.isArray(ret.groups))
         {
            const newGroups = await this.expandSettingsGroupList(ret.groups);
            ret.groups = newGroups;
         }
      }
      return ret;
   }

   public async cascadeDelete(root: RootGroup): Promise<DeleteResult>
   {
      const rootRepository = getRepository(RootGroup);
      const groupRepository = getRepository(SettingsGroup);
      const scalarRepository = getRepository(Scalar);
      const scalarListRepository = getRepository(ScalarList);
      const groups = [];
      const scalars = [];
      const scalarLists = [];
      if (root.defaults)
      {
         this.getFlattenedIDListsRecursive(root.defaults, groups, scalars, scalarLists);
      }
      if (root.groups)
      {
         for (const group of root.groups)
         {
            this.getFlattenedIDListsRecursive(group, groups, scalars, scalarLists);
         }
      }
      if (scalars.length > 0)
      {
         await scalarRepository.delete(scalars);
      }
      if (scalarLists.length > 0)
      {
         await scalarListRepository.delete(scalarLists);
      }
      if (groups.length > 0)
      {
         await groupRepository.delete(groups);
      }
      const result = await rootRepository.delete(root.id);
      return result;
   }

   public checkRoles(realmRoles: string[]): (token: any, request: any) => boolean
   {
      return function(token: any, request: any)
      {
         const roles = realmRoles;
         for (const role of roles)
         {
            if (token.hasRole(role))
            {
               return true;
            }
         }
         return false
      };
   }

   public getFlattenedIDListsRecursive(root: SettingsGroup, groups: string[], scalars: string[], scalarLists: string[]): void
   {
      groups.push(root.id);
      if (root.groups)
      {
         for (const group of root.groups)
         {
            this.getFlattenedIDListsRecursive(group, groups, scalars, scalarLists);
         }
      }
      if (root.scalarLists)
      {
         for (const scalarList of root.scalarLists)
         {
            scalarLists.push(scalarList.id);
            if (scalarList.entries)
            {
               for (const scalar of scalarList.entries)
               {
                  scalars.push(scalar.id);
               }
            }
         }
      }
      if (root.scalars)
      {
         for (const scalar of root.scalars)
         {
            scalars.push(scalar.id);
         }
      }
   }
}
