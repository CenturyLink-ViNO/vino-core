import { exec } from 'child_process';


function touchup(value: string): string
{
   return value === null || value === '' ? 'N/A' : value;
}
export default class InstalledDockerContainersInfo
{
   private name: string;
   private major: string;
   private minor: string;
   private revision: string;
   private fix: string;
   private buildid: string;


   public constructor(name, major, minor, revision, fix, buildid)
   {
      this.name = touchup(name);
      this.major = touchup(major);
      this.minor = touchup(minor);
      this.revision = touchup(revision);
      this.fix = touchup(fix);
      this.buildid = touchup(buildid);
   }

   public static populate(list: InstalledDockerContainersInfo[]): Promise<void>
   {
      const ret = new Promise<void>(function(resolve, reject)
      {
         exec('find /opt/vino/common/releases/ -type f -exec cat {} +', function callback(error, stdout)
         {
            if (error)
            {
               reject(error);
            }

            let split = stdout.split('\n');
            split = split.filter(function(element)
            {
               return element !== '';
            });
            const dataMap = new Map<string, string>();
            let context = '';
            for (const lineIndx in split)
            {
               const oneLine = split[lineIndx];
               if (!oneLine.startsWith('#'))
               {
                  const lineData = InstalledDockerContainersInfo.parseLine(oneLine);
                  const key = lineData[0];
                  const value = lineData[1];
                  if (key !== null && key !== '')
                  {
                     dataMap.set(key.toLowerCase(), value);
                     context = key.toLowerCase();
                     if (key.toLowerCase() === 'buildid')
                     {
                        if (dataMap.has('buildid'))
                        {
                           const swPackage = new InstalledDockerContainersInfo(
                              dataMap.get('name'),
                              dataMap.get('major'),
                              dataMap.get('minor'),
                              dataMap.get('revision'),
                              dataMap.get('fix'),
                              dataMap.get('buildid')
                           );
                           list.push(swPackage);
                           dataMap.clear();
                        }
                     }
                  }
                  if (key === undefined || key === '')
                  {
                     if (value !== undefined)
                     {
                        if (context === '')
                        {
                           let tmp = dataMap.get(context);
                           tmp = tmp === undefined ? '' : tmp;
                           dataMap.set(context, tmp + ' ' + value);
                        }
                     }
                  }
               }
            }
            resolve();
         });
      });
      return ret;
   }

   private static parseLine(oneLine: string): string[]
   {
      const tmp = oneLine.split('=');
      const ret = [];
      for (let indx = 0; indx < tmp.length; indx = indx + 1)
      {
         if (tmp[indx] !== undefined)
         {
            if (indx === 0)
            {
               ret.push(tmp[0].trim());
            }
            else
            {
               if (ret[1] === undefined)
               {
                  ret.push(tmp[indx].trim());
               }
               else
               {
                  ret.push(ret[1] + '=' + tmp[indx].trim());
               }
            }
         }
      }
      return ret;
   }
}
