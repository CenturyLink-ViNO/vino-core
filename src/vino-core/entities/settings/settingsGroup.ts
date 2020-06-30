import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn, AfterLoad } from 'typeorm';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { RootGroup } from './rootGroup';
import { Scalar } from './scalar';
import { ScalarList } from './scalarList';

@Entity({ schema: 'abacus_settings' })
export class SettingsGroup
{
   @PrimaryGeneratedColumn('uuid')
   public id: string;

   @Column()
   @IsNotEmpty()
   public name: string;

   @Column({ default: '', name: 'display_name' })
   public displayName: string;

   @Column({ default: false, name: 'is_default' })
   public isDefault: boolean;

   @ManyToMany(() => SettingsGroup, { cascade: true, onDelete: 'CASCADE' })
   @JoinTable({
      name: 'settings_group_to_settings_group',
      joinColumn: { name: 'parent_id' },
      inverseJoinColumn: { name: 'child_id' }
   })
   @ValidateNested({ each: true })
   public groups: SettingsGroup[];

   @OneToMany(() => Scalar, (scalar) => scalar.parentGroup, { cascade: true, eager: true, onDelete: 'CASCADE' })
   @ValidateNested({ each: true })
   public scalars: Scalar[];

   @OneToMany(() => ScalarList, (scalarList) => scalarList.parentGroup, { cascade: true, eager: true, onDelete: 'CASCADE' })
   @ValidateNested({ each: true })
   public scalarLists: ScalarList[];

   @ManyToOne(() => RootGroup, (root) => root.groups, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'root_group_id' })
   public rootGroup: RootGroup;

   @OneToOne(() => RootGroup, (parent) => parent.defaults, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'default_for' })
   public defaultFor: RootGroup;

   public defaultState(): boolean
   {
      if (this.isDefault === null || this.isDefault === undefined)
      {
         this.isDefault = false;
      }
      return this.isDefault;
   }

   public group(nameToFind: string): SettingsGroup
   {
      let ret: SettingsGroup = null;
      if (nameToFind !== null && nameToFind !== undefined && nameToFind.trim() !== '')
      {
         if (this.groups !== null && this.groups !== undefined)
         {
            ret = this.groups.find((group) => group.name === nameToFind.trim());
            if (ret === undefined)
            {
               ret = null;
            }
         }
      }
      return ret;
   }

   public addGroup(newGroup: SettingsGroup): void
   {
      if (newGroup !== null && newGroup !== undefined)
      {
         this.removeGroup(newGroup.name);
         if (this.groups === null || this.groups === undefined)
         {
            this.groups = [];
         }
         this.groups.push(newGroup);
      }
   }

   public removeGroup(nameToFind: string): void
   {
      if (nameToFind !== null && nameToFind !== undefined && nameToFind.trim() !== '')
      {
         if (this.groups !== null && this.groups !== undefined)
         {
            const index = this.groups.findIndex((group) => group.name === nameToFind.trim());
            if (index >= 0)
            {
               this.groups.splice(index, 1);
            }
         }
      }
   }

   public scalar(nameToFind: string): Scalar
   {
      let ret: Scalar = null;
      if (nameToFind !== null && nameToFind !== undefined && nameToFind.trim() !== '')
      {
         if (this.scalars !== null && this.scalars !== undefined)
         {
            ret = this.scalars.find((scalar) => scalar.name === nameToFind.trim());
            if (ret === undefined)
            {
               ret = null;
            }
         }
      }
      return ret;
   }

   public addScalar(newScalar: Scalar): void
   {
      if (newScalar !== null && newScalar !== undefined)
      {
         this.removeScalar(newScalar.name);
         if (this.scalars === null || this.scalars === undefined)
         {
            this.scalars = [];
         }
         this.scalars.push(newScalar);
      }
   }

   public removeScalar(nameToFind: string): void
   {
      if (nameToFind !== null && nameToFind !== undefined && nameToFind.trim() !== '')
      {
         if (this.scalars !== null && this.scalars !== undefined)
         {
            const index = this.scalars.findIndex((scalar) => scalar.name === nameToFind.trim());
            if (index >= 0)
            {
               this.scalars.splice(index, 1);
            }
         }
      }
   }

   public scalarList(nameToFind: string): ScalarList
   {
      let ret: ScalarList = null;
      if (nameToFind !== null && nameToFind !== undefined && nameToFind.trim() !== '')
      {
         if (this.scalarLists !== null && this.scalarLists !== undefined)
         {
            ret = this.scalarLists.find((scalarList) => scalarList.name === nameToFind.trim());
            if (ret === undefined)
            {
               ret = null;
            }
         }
      }
      return ret;
   }

   public addScalarList(newScalarList: ScalarList): void
   {
      if (newScalarList !== null && newScalarList !== undefined)
      {
         this.removeScalarList(newScalarList.name);
         if (this.scalarLists === null || this.scalarLists === undefined)
         {
            this.scalarLists = [];
         }
         this.scalarLists.push(newScalarList);
      }
   }

   public removeScalarList(nameToFind: string): void
   {
      if (nameToFind !== null && nameToFind !== undefined && nameToFind.trim() !== '')
      {
         if (this.scalarLists !== null && this.scalarLists !== undefined)
         {
            const index = this.scalarLists.findIndex((scalarList) => scalarList.name === nameToFind.trim());
            if (index >= 0)
            {
               this.scalarLists.splice(index, 1);
            }
         }
      }
   }

   public inheritDefaults(defaultGroup: SettingsGroup): void
   {
      if (defaultGroup !== null)
      {
         if (this.displayName === null || this.displayName === undefined || this.displayName.trim() === '')
         {
            this.displayName = defaultGroup.displayName;
         }
         if (defaultGroup.groups !== null && defaultGroup.groups !== undefined)
         {
            for (const group of defaultGroup.groups)
            {
               const target: SettingsGroup = this.group(group.name);
               if (target === null)
               {
                  const toAdd: SettingsGroup = new SettingsGroup(
                     group.name,
                     group.displayName,
                     group.groups,
                     group.scalars,
                     group.scalarLists
                  );
                  toAdd.isDefault = true;
                  this.addGroup(toAdd);
               }
               else
               {
                  target.inheritDefaults(group);
               }
            }
         }
         if (defaultGroup.scalars !== null && defaultGroup.scalars !== undefined)
         {
            for (const scalar of defaultGroup.scalars)
            {
               const target: Scalar = this.scalar(scalar.name);
               if (target === null)
               {
                  const toAdd: Scalar = new Scalar(
                     scalar.name,
                     scalar.getValue(),
                     scalar.displayName,
                     scalar.required,
                     scalar.type,
                     scalar.encrypt
                  );
                  toAdd.isDefault = true;
                  this.addScalar(toAdd);
               }
               else
               {
                  target.inheritDefaults(scalar);
               }
            }
         }
         if (defaultGroup.scalarLists !== null && defaultGroup.scalarLists !== undefined)
         {
            for (const scalarList of defaultGroup.scalarLists)
            {
               const target: ScalarList = this.scalarList(scalarList.name);
               if (target === null)
               {
                  const toAdd: ScalarList = new ScalarList(scalarList.name, scalarList.displayName, scalarList.entries);
                  toAdd.isDefault = true;
                  this.addScalarList(toAdd);
               }
               else
               {
                  target.inheritDefaults(scalarList);
               }
            }
         }
      }
   }

   public setDefaultStateRecursive(newState: boolean): void
   {
      if (this.groups !== null && this.groups !== undefined)
      {
         for (const group of this.groups)
         {
            group.isDefault = newState;
            group.setDefaultStateRecursive(newState);
         }
      }
      if (this.scalars !== null && this.scalars !== undefined)
      {
         for (const scalar of this.scalars)
         {
            scalar.isDefault = newState;
         }
      }
      if (this.scalarLists !== null && this.scalarLists !== undefined)
      {
         for (const scalarList of this.scalarLists)
         {
            scalarList.isDefault = newState;
         }
      }
   }

   public mergeDefaultsFrom(toMergeFrom: SettingsGroup, removeMissingData: boolean): void
   {
      if (toMergeFrom.displayName !== null && toMergeFrom.displayName.trim() !== '')
      {
         this.displayName = toMergeFrom.displayName;
      }
      this.mergeDefaultsFromGroups(toMergeFrom, removeMissingData);
      this.mergeDefaultsFromScalars(toMergeFrom, removeMissingData);
      this.mergeDefaultsFromScalarLists(toMergeFrom, removeMissingData);
   }

   private mergeDefaultsFromGroups(toMergeFrom: SettingsGroup, removeMissingData: boolean): void
   {
      if (toMergeFrom.groups === null)
      {
         toMergeFrom.groups = [];
      }
      if (this.groups === null || this.groups === undefined || this.groups.length === 0)
      {
         this.groups = [];
         if (toMergeFrom.groups)
         {
            toMergeFrom.groups.map((val) => this.groups.push(Object.assign({}, val)));
         }
      }
      else
      {
         const toAdd: SettingsGroup[] = [];
         const toRemove: SettingsGroup[] = [];
         toMergeFrom.groups.map((val) => toAdd.push(Object.assign({}, val)));
         this.groups.map((val) => toRemove.push(Object.assign({}, val)));
         for (const newGroup of toMergeFrom.groups)
         {
            for (const group of this.groups)
            {
               if (group.name === newGroup.name)
               {
                  group.mergeDefaultsFrom(newGroup, removeMissingData);
                  let index = toAdd.indexOf(newGroup, 0);
                  if (index >= 0)
                  {
                     toAdd.splice(index, 1);
                  }
                  index = toRemove.indexOf(group, 0);
                  if (index >= 0)
                  {
                     toRemove.splice(index, 1);
                  }
                  break;
               }
            }
         }
         this.groups = this.groups.concat(toAdd);
         if (removeMissingData)
         {
            for (const remove of toRemove)
            {
               const index = this.groups.indexOf(remove, 0);
               if (index >= 0)
               {
                  this.groups.splice(index, 1);
               }
            }
         }
      }
   }

   private mergeDefaultsFromScalars(toMergeFrom: SettingsGroup, removeMissingData: boolean): void
   {
      if (toMergeFrom.scalars === null)
      {
         toMergeFrom.scalars = [];
      }
      if (this.scalars === null || this.scalars === undefined || this.scalars.length === 0)
      {
         this.scalars = [];
         if (toMergeFrom.scalars)
         {
            toMergeFrom.scalars.map((val) => this.scalars.push(Object.assign({}, val)));
         }
      }
      else
      {
         const toAdd: Scalar[] = [];
         const toRemove: Scalar[] = [];
         toMergeFrom.scalars.map((val) => toAdd.push(Object.assign({}, val)));
         this.scalars.map((val) => toRemove.push(Object.assign({}, val)));
         for (const newScalar of toMergeFrom.scalars)
         {
            for (const scalar of this.scalars)
            {
               if (scalar.name === newScalar.name)
               {
                  scalar.mergeDefaultsFromGroups(newScalar);
                  let index = toAdd.indexOf(newScalar, 0);
                  if (index >= 0)
                  {
                     toAdd.splice(index, 1);
                  }
                  index = toRemove.indexOf(scalar, 0);
                  if (index >= 0)
                  {
                     toRemove.splice(index, 1);
                  }
                  break;
               }
            }
         }
         this.scalars = this.scalars.concat(toAdd);
         if (removeMissingData)
         {
            for (const remove of toRemove)
            {
               const index = this.scalars.indexOf(remove, 0);
               if (index >= 0)
               {
                  this.scalars.splice(index, 1);
               }
            }
         }
      }
   }

   private mergeDefaultsFromScalarLists(toMergeFrom: SettingsGroup, removeMissingData: boolean): void
   {
      if (toMergeFrom.scalarLists === null)
      {
         toMergeFrom.scalarLists = [];
      }
      if (this.scalarLists === null || this.scalarLists === undefined || this.scalarLists.length === 0)
      {
         this.scalarLists = [];
         if (toMergeFrom.scalarLists)
         {
            toMergeFrom.scalarLists.map((val) => this.scalarLists.push(Object.assign({}, val)));
         }
      }
      else
      {
         const toAdd: ScalarList[] = [];
         const toRemove: ScalarList[] = [];
         toMergeFrom.scalarLists.map((val) => toAdd.push(Object.assign({}, val)));
         this.scalarLists.map((val) => toRemove.push(Object.assign({}, val)));
         for (const newScalarList of toMergeFrom.scalarLists)
         {
            for (const scalarList of this.scalarLists)
            {
               if (scalarList.name === newScalarList.name)
               {
                  scalarList.mergeDefaultsFromGroups(newScalarList);
                  let index = toAdd.indexOf(newScalarList, 0);
                  if (index >= 0)
                  {
                     toAdd.splice(index, 1);
                  }
                  index = toRemove.indexOf(scalarList, 0);
                  if (index >= 0)
                  {
                     toRemove.splice(index, 1);
                  }
                  break;
               }
            }
         }
         this.scalarLists = this.scalarLists.concat(toAdd);
         if (removeMissingData)
         {
            for (const remove of toRemove)
            {
               const index = this.scalarLists.indexOf(remove, 0);
               if (index >= 0)
               {
                  this.scalarLists.splice(index, 1);
               }
            }
         }
      }
   }

   public replace(toReplaceWith: SettingsGroup): void
   {
      if (toReplaceWith.displayName !== null && toReplaceWith.displayName.trim() !== '')
      {
         this.displayName = toReplaceWith.displayName;
      }
      this.replaceGroups(toReplaceWith);
      this.replaceScalars(toReplaceWith);
      this.replaceScalarLists(toReplaceWith);
   }

   private replaceGroups(toReplaceWith: SettingsGroup): void
   {
      if (toReplaceWith.groups !== null && toReplaceWith.groups !== undefined)
      {
         this.groups = toReplaceWith.groups;
      }
      else
      {
         this.groups = [];
      }
   }

   private replaceScalars(toReplaceWith: SettingsGroup): void
   {
      if (toReplaceWith.scalars !== null && toReplaceWith.scalars !== undefined)
      {
         this.scalars = toReplaceWith.scalars;
      }
      else
      {
         this.scalars = [];
      }
   }

   private replaceScalarLists(toReplaceWith: SettingsGroup): void
   {
      if (toReplaceWith.scalarLists !== null && toReplaceWith.scalarLists !== null)
      {
         this.scalarLists = toReplaceWith.scalarLists;
      }
      else
      {
         this.scalarLists = [];
      }
   }

   public merge(groupToMerge: SettingsGroup, isDefaults: boolean, defaultGroup: SettingsGroup): void
   {
      if (groupToMerge)
      {
         if (groupToMerge.displayName && groupToMerge.displayName.trim() !== '')
         {
            this.displayName = groupToMerge.displayName;
         }
         this.mergeGroups(groupToMerge.groups, isDefaults, defaultGroup);
         this.mergeScalars(groupToMerge.scalars, isDefaults, defaultGroup);
         this.mergeScalarLists(groupToMerge.scalarLists, isDefaults, defaultGroup);
      }
   }

   private mergeGroups(groupsToMerge: SettingsGroup[], isDefaults: boolean, defaultGroup: SettingsGroup): void
   {
      if (groupsToMerge)
      {
         if (!this.groups || this.groups.length === 0)
         {
            this.groups = groupsToMerge;
         }
         else
         {
            for (let newGroup of groupsToMerge)
            {
               let existingGroup = this.group(newGroup.name);
               if (existingGroup)
               {
                  if (isDefaults)
                  {
                     existingGroup.merge(newGroup, isDefaults, null);
                  }
                  else
                  {
                     existingGroup.merge(newGroup, isDefaults, defaultGroup.group(newGroup.name));
                  }
               }
               else if (newGroup.name)
               {
                  if (isDefaults)
                  {
                     this.groups.push(newGroup);
                  }
                  else if (defaultGroup)
                  {
                     newGroup.inheritDefaults(defaultGroup.group(newGroup.name));
                     this.groups.push(newGroup);
                  }
               }
            }
         }
      }
   }

   private mergeScalars(scalarsToMerge: Scalar[], isDefaults: boolean, defaultGroup: SettingsGroup): void
   {
      if (scalarsToMerge)
      {
         if (!this.scalars || this.scalars.length === 0)
         {
            this.scalars = scalarsToMerge;
         }
         else
         {
            for (let newScalar of scalarsToMerge)
            {
               let existingScalar = this.scalar(newScalar.name);
               if (existingScalar)
               {
                  if (isDefaults)
                  {
                     existingScalar.merge(newScalar, null);
                  }
                  else
                  {
                     existingScalar.merge(newScalar, defaultGroup.scalar(newScalar.name));
                  }
               }
               else if (newScalar.name)
               {
                  if (isDefaults)
                  {
                     this.scalars.push(newScalar);
                  }
                  else if (defaultGroup)
                  {
                     newScalar.inheritDefaults(defaultGroup.scalar(newScalar.name));
                     this.scalars.push(newScalar);
                  }
               }
            }
         }
      }
   }

   private mergeScalarLists(scalarListsToMerge: ScalarList[], isDefaults: boolean, defaultGroup: SettingsGroup): void
   {
      if (scalarListsToMerge)
      {
         if (!this.scalarLists || this.scalarLists.length === 0)
         {
            this.scalarLists = scalarListsToMerge;
         }
         else
         {
            for (let newScalarList of scalarListsToMerge)
            {
               let existingScalarList = this.scalarList(newScalarList.name);
               if (existingScalarList)
               {
                  if (isDefaults)
                  {
                     existingScalarList.merge(newScalarList, isDefaults, null);
                  }
                  else
                  {
                     existingScalarList.merge(newScalarList, isDefaults, defaultGroup.scalarList(newScalarList.name));
                  }
               }
               else if (newScalarList.name)
               {
                  if (isDefaults)
                  {
                     this.scalarLists.push(newScalarList);
                  }
                  else if (defaultGroup)
                  {
                     newScalarList.inheritDefaults(defaultGroup.scalarList(newScalarList.name));
                     this.scalarLists.push(newScalarList);
                  }
               }
            }
         }
      }
   }

   public validate(treatAsDefaultGroup: boolean, existingDefaults: SettingsGroup): void
   {
      if (existingDefaults === null || existingDefaults === undefined)
      {
         existingDefaults = this;
      }
      if (this.name === null || this.name.trim() === '')
      {
         throw new Error('name is required for a SettingsGroup');
      }
      if (treatAsDefaultGroup)
      {
         if (this.displayName === null || this.displayName === undefined || this.displayName.trim() === '')
         {
            throw new Error('displayName is required for SettingsGroup (' + this.name + ')');
         }
      }
      if (this.groups !== null && this.groups !== undefined)
      {
         for (const group of this.groups)
         {
            group.validate(treatAsDefaultGroup, existingDefaults.group(group.name));
         }
      }
      if (this.scalars !== null && this.scalars !== undefined)
      {
         for (const scalar of this.scalars)
         {
            scalar.validate(treatAsDefaultGroup, existingDefaults.scalar(scalar.name));
         }
      }
      if (this.scalarLists !== null && this.scalarLists !== undefined)
      {
         for (const scalarList of this.scalarLists)
         {
            scalarList.validate(treatAsDefaultGroup);
         }
      }
   }

   public static findSubGroup(parent, groupName): SettingsGroup
   {
      let indx;
      if (parent.hasOwnProperty('groups'))
      {
         for (indx = 0; indx < parent.groups.length; indx = indx + 1)
         {
            if (parent.groups[indx].name === groupName)
            {
               return parent.groups[indx];
            }
         }
      }
   }

   public findGroup(path): SettingsGroup
   {
      const pathSplit = path.split('/');
      let indx;
      let currentGroup: SettingsGroup = this;
      for (indx = 0; indx < pathSplit.length; indx = indx + 1)
      {
         currentGroup = SettingsGroup.findSubGroup(currentGroup, pathSplit[indx]);
      }
      return currentGroup;
   }

   public static findConstantInGroup(group, constantName): Scalar
   {
      let indx;
      if (group.hasOwnProperty('scalars'))
      {
         for (indx = 0; indx < group.scalars.length; indx = indx + 1)
         {
            if (group.scalars[indx].name === constantName)
            {
               return group.scalars[indx];
            }
         }
      }
      else if (group.hasOwnProperty('entries'))
      {
         for (indx = 0; indx < group.entries.length; indx = indx + 1)
         {
            if (group.entries[indx].name === constantName)
            {
               return group.entries[indx];
            }
         }
      }
   }

   public findConstant(path, constantName): Scalar
   {
      let ret;

      const group = this.findGroup(path);
      if (group)
      {
         ret = SettingsGroup.findConstantInGroup(group, constantName);
      }
      else
      {
         ret = SettingsGroup.findConstantInGroup(this, constantName);
      }
      return ret;
   }

   @AfterLoad()
   public defaultValues(): void
   {
      if (this.groups)
      {
         this.groups.sort(function(groupA, groupB)
         {
            if (groupA.displayName && groupB.displayName)
            {
               return groupA.displayName.localeCompare(groupB.displayName);
            }
            else
            {
               return 0;
            }
         });
      }
      else
      {
         this.groups = [];
      }
      if (this.scalars)
      {
         this.scalars.sort(function(scalarA, scalarB)
         {
            if (scalarA.displayName && scalarB.displayName)
            {
               return scalarA.displayName.localeCompare(scalarB.displayName);
            }
            else
            {
               return 0;
            }
         });
      }
      else
      {
         this.scalars = [];
      }
      if (this.scalarLists)
      {
         this.scalarLists.sort(function(scalarListA, scalarListB)
         {
            if (scalarListA.displayName && scalarListB.displayName)
            {
               return scalarListA.displayName.localeCompare(scalarListB.displayName);
            }
            else
            {
               return 0;
            }
         });
      }
      else
      {
         this.scalarLists = [];
      }
   }

   public constructor(
      name: string,
      displayName: string,
      groups: SettingsGroup[],
      scalars: Scalar[],
      scalarLists: ScalarList[]
   )
   {
      this.name = name;
      this.displayName = displayName;
      this.groups = groups;
      this.scalars = scalars;
      this.scalarLists = scalarLists;
   }
}
