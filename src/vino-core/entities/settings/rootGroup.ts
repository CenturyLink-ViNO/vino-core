import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, AfterLoad } from 'typeorm';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { SettingsGroup } from './settingsGroup';
import { Scalar } from './scalar';

@Entity({ schema: 'abacus_settings' })
export class RootGroup
{
   @PrimaryGeneratedColumn('uuid')
   public id: string;

   @Column()
   @IsNotEmpty()
   public name: string;

   @Column({ default: '', name: 'display_name' })
   public displayName: string;

   @OneToMany(() => SettingsGroup, (group) => group.rootGroup, { cascade: true, onDelete: 'CASCADE' })
   @ValidateNested({ each: true })
   public groups: SettingsGroup[];

   @OneToOne(() => SettingsGroup, (group) => group.defaultFor, { cascade: true, onDelete: 'CASCADE' })
   @ValidateNested()
   public defaults: SettingsGroup;

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

   public addGroup(overrides: SettingsGroup): void
   {
      if (overrides !== null && overrides !== undefined)
      {
         if (this.groups === null || this.groups === undefined)
         {
            this.groups = [];
         }
         const index = this.groups.findIndex((group) => group.name === overrides.name.trim());
         if (index >= 0)
         {
            this.groups.splice(index, 1);
         }
         this.groups.push(overrides);
      }
   }

   public merge(newRootGroup: RootGroup, onlyMergeDefaults: boolean): void
   {
      if (newRootGroup)
      {
         // Merge defaults
         if (this.defaults)
         {
            this.defaults.merge(newRootGroup.defaults, true, null);
         }
         else
         {
            this.defaults = newRootGroup.defaults;
         }
         if (!onlyMergeDefaults)
         {
            if (newRootGroup.displayName && newRootGroup.displayName.trim() !== '')
            {
               this.displayName = newRootGroup.displayName;
            }
            // Merge Groups
            if (newRootGroup.groups)
            {
               if (!this.groups || this.groups.length === 0)
               {
                  for (let newGroup of newRootGroup.groups)
                  {
                     if (newGroup.name)
                     {
                        for (let subgroup of newGroup.groups)
                        {
                           const defaultGroup = this.defaults.group(subgroup.name);
                           if (defaultGroup)
                           {
                              subgroup.inheritDefaults(defaultGroup);
                           }
                        }
                        this.groups.push(newGroup);
                     }
                  }
               }
               else
               {
                  for (let newGroup of newRootGroup.groups)
                  {
                     let existingGroup = this.group(newGroup.name);
                     if (existingGroup)
                     {
                        existingGroup.merge(newGroup, false, this.defaults);
                     }
                     else if (newGroup.name)
                     {
                        for (let subgroup of newGroup.groups)
                        {
                           const defaultGroup = this.defaults.group(subgroup.name);
                           if (defaultGroup)
                           {
                              subgroup.inheritDefaults(defaultGroup);
                           }
                        }
                        this.groups.push(newGroup);
                     }
                  }
               }
            }
         }
      }
   }

   public replaceGroups(newData: RootGroup): void
   {
      if (newData !== null && newData !== undefined)
      {
         if (newData.displayName !== null && newData.displayName !== undefined && newData.displayName.trim() !== '')
         {
            this.displayName = newData.displayName;
         }
         if (newData.groups !== null && newData.groups !== undefined)
         {
            this.groups = newData.groups;
         }
      }
   }

   public inheritDefaults(): void
   {
      if (this.defaults)
      {
         this.defaults.setDefaultStateRecursive(true);
         if (this.groups)
         {
            for (const one of this.groups)
            {
               if (one)
               {
                  one.inheritDefaults(this.defaults);
               }
            }
         }
      }
   }

   public getConstant(pathAsArray: string[]): Scalar
   {
      const constantName = pathAsArray.pop();
      pathAsArray.splice(0, 1); // Remove root group name from path
      let ret;

      const topLevelGroup = this.groups.find((group) => group.name === pathAsArray[0]);
      if (topLevelGroup)
      {
         pathAsArray.splice(0, 1);
         const path = pathAsArray.join('/');
         ret = topLevelGroup.findConstant(path, constantName);
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
   }

   public constructor(name: string, displayName: string, defaults: SettingsGroup)
   {
      this.name = name;
      this.displayName = displayName;
      this.defaults = defaults;
   }
}
