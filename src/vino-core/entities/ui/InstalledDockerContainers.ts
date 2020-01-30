import InstalledDockerContainersInfo from './InstalledDockerContainersInfo';

export default class InstalledDockerContainers
{
   private static instance: InstalledDockerContainers = null;
   private containers: InstalledDockerContainersInfo[];

   public constructor()
   {
      this.containers = [];
   }

   public static async details(): Promise<InstalledDockerContainers>
   {
      if (this.instance === null)
      {
         this.instance = new InstalledDockerContainers();
         await this.instance.populate();
      }
      return this.instance;
   }

   private async populate(): Promise<void>
   {
      this.containers.length = 0;
      await InstalledDockerContainersInfo.populate(this.containers);
   }
}