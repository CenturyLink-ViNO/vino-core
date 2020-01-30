/* eslint-disable @typescript-eslint/no-explicit-any*/
export default class ProjectManager
{
   private instance: any;

   public constructor(nodeRedInstance: any)
   {
      this.instance = nodeRedInstance;
   }

   public getCurrentProject(): any
   {
      return this.instance.runtime.projects.getActiveProject({ user: { username: '_' } });
   }

   public getProjectList(): any
   {
      return this.instance.runtime.projects.listProjects({ user: { username: '_' } });
   }

   public setActiveProject(project): any
   {
      return this.instance.runtime.projects.setActiveProject({ user: { username: '_' }, id: project });
   }

   public getProjectStatus(project): any
   {
      return this.instance.runtime.projects.getStatus({ user: { username: '_' }, id: project, remote: 'origin' });
   }

   public getProjectRemotes(project): any
   {
      return this.instance.runtime.projects.getRemotes({ user: { username: '_' }, id: project });
   }

   public getProjectBranches(project): any
   {
      return this.instance.runtime.projects.getBranches({ user: { username: '_' }, id: project, remote: false });
   }

   public createProject(project): any
   {
      return this.instance.runtime.projects.createProject({ project: project });
   }

   public async getCurrentBranch(project): Promise<any>
   {
      const branches = await this.getProjectBranches(project);
      let ret = null;
      if (branches && branches.branches && Array.isArray(branches.branches))
      {
         branches.branches.forEach((branch) =>
         {
            if (branch.hasOwnProperty('current') && branch.current)
            {
               ret = branch;
            }
         });
      }
      return ret;
   }

   public async getCurrentBranchStatus(project): Promise<any>
   {
      const currentBranch = await this.getCurrentBranch(project);

      if (currentBranch)
      {
         return this.instance.runtime.projects.getBranchStatus({ user: { username: '_' }, id: project, branch: currentBranch.name });
      }
   }

   public deleteProject(project): any
   {
      return this.instance.runtime.projects.deleteProject({ user: { username: '_' }, id: project });
   }

   private async getBranch(project, name): Promise<any>
   {
      let ret = null;
      const branches = await this.getProjectBranches(project);
      if (branches && branches.branches && Array.isArray(branches.branches))
      {
         branches.branches.forEach((branch) =>
         {
            if (branch.name === name)
            {
               ret = branch;
            }
         });
      }
      return ret;
   }

   public async changeBranch(project, branch): Promise<any>
   {
      const existingBranch = await this.getBranch(project, branch.local);
      let create = true;
      if (existingBranch)
      {
         create = false;
      }
      await this.instance.runtime.projects.setBranch({
         user: { username: '_' },
         id: project,
         branch: branch.local,
         create: create
      });
      return this.updateProject(project, branch);
   }

   private updateProject(project, branch): any
   {
      return this.instance.runtime.projects.pull({
         user: { username: '_' },
         id: project,
         allowUnrelatedHistories: false,
         remote: branch.remote,
         track: true
      });
   }

   public async updateProjectCurrentBranch(project): Promise<any>
   {
      const branchStatus = await this.getCurrentBranchStatus(project);
      if (branchStatus && branchStatus.commits && branchStatus.commits.hasOwnProperty('behind') && parseInt(branchStatus.commits.behind, 10) > 0)
      {
         const branch = await this.getCurrentBranch(project);
         return this.updateProject(project, branch);
      }
      return this.getCurrentProject();
   }
}