/* globals pageModule*/
/* globals jQuery*/
/* globals FormBuilder*/
/* globals bootbox*/
/* globals SettingsGroup*/
/* globals Scalar*/
/* globals ScalarList*/
/* exported AbacusSettingsManagementView */

'use strict';

window.AbacusSettingsManagementView = function(controller, baseId)
{
   const outer = this;

   this.showView = function(rootGroups)
   {
      this.settingsPanel = pageModule.getNewPanel('Settings Categories');
      this.settingsPanel.css('width', 'calc(100%)');
      this.settingsPanel.addClass('panel-primary');
      jQuery('.panel-body', this.settingsPanel).attr('id', 'settings-panel-bdy');

      jQuery('#' + this.baseId).append(this.settingsPanel);
      const formBuilder = new FormBuilder({
         format:
            {}
      });
      jQuery.when(formBuilder.buildForm('#settings-panel-bdy')).done(function()
      {
         const panelBody = jQuery('#settings-panel-bdy');
         outer.renderTreePanel(panelBody, rootGroups);
         outer.renderDetailsPanel(panelBody);
      });
   };


   this.renderTreePanel = function(container, rootGroups)
   {
      const treeDisplayDiv = jQuery('<div></div>').addClass('col-md-3');
      const treeDiv = jQuery('<div id="tree" style="overflow-x: auto; overflow-y: hidden;">' +
         '</div>');
      treeDiv.on('click', '.jstree-anchor', function(element)
      {
         jQuery('#tree').jstree(true).
            toggle_node(element.target);
      }).
         jstree({
            core:
               {
                  data: outer.getRootGroupTree(rootGroups),
                  multiple: false,
                  'check_callback': true,
                  themes:
                  { dots: true }
               },
            types:
               {
                  default: {},
                  root:
                  { icon: 'glyphicon glyphicon-folder-close' },
                  defaults:
                  { icon: 'glyphicon glyphicon-asterisk' },
                  group:
                  { icon: 'glyphicon glyphicon-folder-close' },
                  scalar:
                  { icon: 'glyphicon glyphicon-tag' },
                  scalarList:
                  { icon: 'glyphicon glyphicon-tags' }
               },
            plugins: ['types', 'contextmenu'],
            contextmenu:
               { items: outer.getContextMenuItems }
         });
      treeDiv.bind('select_node.jstree', function(evt, data)
      {
         outer.updateDetailsPanel(data.node);
      });
      const addRootGroupButton = jQuery('<button>Add Category</button>');
      addRootGroupButton.click(function()
      {
         const topNode = jQuery('#tree').jstree(true).get_node('#');
         outer.newGroup(topNode, 'root');
      });
      const uploadFileButton = jQuery('<button>Upload JSON File</button>');
      uploadFileButton.click(function()
      {
         outer.showSettingsUploadDialog();
      });
      const downloadFileButton = jQuery('<button>Download JSON File</button>');
      downloadFileButton.click(function()
      {
         outer.showSettingsDownloadDialog();
      });
      treeDisplayDiv.append(treeDiv).append(jQuery('<hr>')).
         append(addRootGroupButton).
         append(jQuery('<hr>')).
         append(uploadFileButton).
         append(downloadFileButton);
      container.append(treeDisplayDiv);
   };


   this.renderCheckboxTree = function(container, rootGroups)
   {
      const treeDisplayDiv = jQuery('<div></div>');
      const treeDiv = jQuery('<div id="checkbox-tree" style="overflow-x: auto; overflow-y: hidden;">' +
         '</div>');
      treeDiv.
         jstree({
            core:
               {
                  data: outer.getSimpleCheckboxTree(rootGroups),
                  multiple: true,
                  'check_callback': true,
                  themes:
                  { dots: true }
               },
            types:
               {
                  default: {},
                  root:
                  { icon: 'glyphicon glyphicon-folder-close' },
                  defaults:
                  { icon: 'glyphicon glyphicon-asterisk' },
                  group:
                  { icon: 'glyphicon glyphicon-folder-close' },
                  scalar:
                  { icon: 'glyphicon glyphicon-tag' },
                  scalarList:
                  { icon: 'glyphicon glyphicon-tags' }
               },
            plugins: ['types', 'checkbox']
         });
      treeDisplayDiv.append(treeDiv);
      container.append(treeDisplayDiv);
   };


   this.filterDownloadedSettings = function()
   {
      const tree = jQuery('#checkbox-tree').jstree();
      const def = jQuery.Deferred(function(deferred)
      {
         jQuery.when(outer.controller.model.getSettingsGroups()).done(function(jsonToReturn)
         {
            const checkboxTree = tree.get_json();
            for (let rootGroup of checkboxTree)
            {
               let jsonIndex = jsonToReturn.findIndex(item => item.name === tree.get_node(rootGroup.id).data);
               if (tree.is_checked(rootGroup.id) || tree.is_undetermined(rootGroup.id))
               {
                  if (jsonToReturn[jsonIndex].defaults)
                  {
                     let tmpDefaultsList = [jsonToReturn[jsonIndex].defaults];
                     outer.filterListWithCheckboxTree(tmpDefaultsList, 'defaults', tree, rootGroup.children, false);
                     if (tmpDefaultsList.length > 0)
                     {
                        jsonToReturn[jsonIndex].defaults = tmpDefaultsList[0];
                     }
                     else
                     {
                        delete jsonToReturn[jsonIndex].defaults;
                     }
                  }
                  if (jsonToReturn[jsonIndex].groups)
                  {
                     outer.filterListWithCheckboxTree(jsonToReturn[jsonIndex].groups, 'group', tree, rootGroup.children, true);
                  }
               }
               else
               {
                  jsonToReturn.splice(jsonIndex, 1);
               }
            }
            for (let rootIndex in jsonToReturn)
            {
               jsonToReturn[rootIndex] = jsonToReturn[rootIndex].getJsonDataToPost(false, true);
            }
            deferred.resolve(jsonToReturn);
         });
      });
      return def.promise();
   };


   this.filterListWithCheckboxTree = function(list, type, tree, subTree, removeDefaults)
   {
      for (let node of subTree)
      {
         if (node.type === type)
         {
            let listIndex;
            let toRemove = [];
            let nodeName = tree.get_node(node.id).data;
            for (let index in list)
            {
               if (list[index].isDefault && removeDefaults)
               {
                  toRemove.push(index);
               }
               else if (list[index].name === nodeName)
               {
                  if (list[index].isDefault)
                  {
                     list[index].parentIsDefaults = true;
                  }
                  listIndex = index;
               }
            }
            if (tree.is_checked(node.id) || tree.is_undetermined(node.id))
            {
               if (list[listIndex])
               {
                  if (list[listIndex].groups)
                  {
                     outer.filterListWithCheckboxTree(list[listIndex].groups, 'group', tree, node.children, removeDefaults);
                  }
                  if (list[listIndex].scalars)
                  {
                     outer.filterListWithCheckboxTree(list[listIndex].scalars, 'scalar', tree, node.children, removeDefaults);
                  }
                  if (list[listIndex].scalarList)
                  {
                     outer.filterListWithCheckboxTree(list[listIndex].scalarList, 'scalar', tree, node.children, removeDefaults);
                  }
                  if (list[listIndex].entries)
                  {
                     outer.filterListWithCheckboxTree(list[listIndex].entries, 'scalar', tree, node.children, removeDefaults);
                  }
               }
            }
            else
            {
               toRemove.push(listIndex);
            }
            for (let remove of toRemove)
            {
               list.splice(remove, 1);
            }
         }
      }
   };


   this.showSettingsUploadDialog = function()
   {
      const chooseFileInput = jQuery('<input type="file" id="file-upload" name="filetoupload">');
      const uploadDialog = bootbox.dialog({
         message: 'Select a file to upload',
         size: 'large',
         buttons:
         {
            chooseFile:
            {
               label: 'Choose File',
               callback: function()
               {
                  chooseFileInput.click();
               }
            },
            upload:
            {
               label: 'Upload',
               callback: function()
               {
                  let newSettings;
                  try
                  {
                     newSettings = JSON.parse(jQuery('.bootbox-body').data('content'));
                  }
                  catch (error)
                  {
                     outer.controller.showError(error);
                  }
                  if (newSettings)
                  {
                     jQuery.when(outer.controller.model.storeSettingsGroup(newSettings)).done(function()
                     {
                        jQuery.when(outer.controller.model.getSettingsGroups()).done(function(rootGroups)
                        {
                           const panelBody = jQuery('#settings-panel-bdy');
                           panelBody.empty();
                           outer.renderTreePanel(panelBody, rootGroups);
                           outer.renderDetailsPanel(panelBody);
                        });
                     });
                  }
               }
            },
            cancel:
            {
               label: 'Cancel'
            }
         }
      });
      chooseFileInput.change(function (e) {
         outer.showSettingsUploadDialog();
         outer.loadFileContents(chooseFileInput[0].files[0]);
      });
   };


   this.showSettingsDownloadDialog = function()
   {
      const download = function(filename, text)
      {
         const element = jQuery('<a href="data:text/plain;charset=utf-8,' + encodeURIComponent(text) +
                  '" download="' + filename + '" style="display: none;" />');
         //jQuery('body').append(element);
         element[0].click();
         element.remove();
      };
      const downloadDialog = bootbox.dialog({
         message: 'Select which elements will be downloaded:',
         size: 'large',
         buttons:
         {
            download:
            {
               label: 'Download',
               callback: function()
               {
                  debugger;
                  jQuery.when(outer.filterDownloadedSettings()).done(function(settings)
                  {
                     download('vino-settings.json', JSON.stringify(settings, null, 3));
                  });
               }
            },
            cancel:
            {
               label: 'Cancel'
            }
         }
      });
      jQuery('.bootbox-body').append('<div id="loading-tree-div" class="text-center">Loading...</div>');
      jQuery.when(outer.controller.model.getSettingsGroups()).done(function(rootGroups)
      {
         jQuery('#loading-tree-div').remove();
         outer.renderCheckboxTree(jQuery('.bootbox-body'), rootGroups);
      });
   };


   this.loadFileContents = function(file)
   {
      if (file)
      {
         const fileReader = new FileReader();
         fileReader.onload = function(event)
         {
            let fileText = event.target.result;
            jQuery('.bootbox-body').data('content', fileText);
            jQuery('.bootbox-body').html('<pre>' + fileText + '</pre>');
         };

         fileReader.readAsText(file, "UTF-8");
      }
   };


   this.renderDetailsPanel = function(container)
   {
      const detailsDiv = jQuery('<div style="padding: 15px;">' +
         '</div>').
         addClass('col-md-9 panel panel-info switchDetails');
      detailsDiv.append(jQuery('<h4 id="details-header"></h4><hr>')).addClass('panel-heading');
      detailsDiv.append(jQuery('<div id="details"></div>')).addClass('panel-body');
      container.append(detailsDiv);
   };


   this.getRootGroupTree = function(rootGroups)
   {
      const tree = [];
      let rootGroupIndex;
      let rootGroup;
      for (rootGroupIndex = 0; rootGroupIndex < rootGroups.length; rootGroupIndex = rootGroupIndex + 1)
      {
         rootGroup = rootGroups[rootGroupIndex];
         tree.push(outer.getGroupTree(rootGroup, 'root', '', false));
      }
      return tree;
   };


   this.getGroupTree = function(rootGroup, type, parentId, parentIsDefaults)
   {
      const tree = {};
      tree.text = 'Unnamed Group';
      tree.type = type;
      if (parentId !== '' && parentId !== undefined)
      {
         if (tree.type === 'defaults')
         {
            tree.id = parentId + '-defaults';
            rootGroup.parentIsDefaults = true;
         }
         else
         {
            tree.id = parentId + '-' + rootGroup.idName;
         }
      }
      else
      {
         tree.id = rootGroup.idName;
      }
      tree.children = [];
      tree.data = rootGroup;
      if (rootGroup.hasOwnProperty('displayName'))
      {
         if (tree.data.isDefault)
         {
            tree.text = '* ' + rootGroup.displayName;
         }
         else
         {
            tree.text = rootGroup.displayName;
         }
      }
      else if (rootGroup.hasOwnProperty('name'))
      {
         tree.text = rootGroup.name;
      }
      if (rootGroup.hasOwnProperty('defaults'))
      {
         if (rootGroup.defaults !== null && rootGroup.defaults !== undefined)
         {
            const defaults = rootGroup.defaults;
            defaults.parentIsDefaults = true;
            tree.children.push(outer.getGroupTree(defaults, 'defaults', tree.id, true));
         }
      }
      this.populateTreeLists(tree, rootGroup, parentIsDefaults);
      if (tree.children.length === 0)
      {
         delete tree.children;
      }
      return tree;
   };


   this.populateTreeLists = function(tree, rootGroup, parentIsDefaults)
   {
      let index;
      let scalar;
      if (rootGroup.hasOwnProperty('groups'))
      {
         for (index in rootGroup.groups)
         {
            if (rootGroup.groups.hasOwnProperty(index))
            {
               const group = rootGroup.groups[index];
               group.parentIsDefaults = parentIsDefaults;
               tree.children.push(outer.getGroupTree(group, 'group', tree.id, parentIsDefaults));
            }
         }
      }
      if (rootGroup.hasOwnProperty('scalars'))
      {
         for (index in rootGroup.scalars)
         {
            if (rootGroup.scalars.hasOwnProperty(index))
            {
               scalar = rootGroup.scalars[index];
               scalar.parentIsDefaults = parentIsDefaults;
               tree.children.push(outer.getGroupTree(scalar, 'scalar', tree.id, parentIsDefaults));
            }
         }
      }
      if (rootGroup.hasOwnProperty('entries'))
      {
         for (index in rootGroup.entries)
         {
            if (rootGroup.entries.hasOwnProperty(index))
            {
               scalar = rootGroup.entries[index];
               scalar.parentIsDefaults = parentIsDefaults;
               tree.children.push(outer.getGroupTree(scalar, 'scalar', tree.id, parentIsDefaults));
            }
         }
      }
      if (rootGroup.hasOwnProperty('scalarLists'))
      {
         for (index in rootGroup.scalarLists)
         {
            if (rootGroup.scalarLists.hasOwnProperty(index))
            {
               const scalarList = rootGroup.scalarLists[index];
               scalarList.parentIsDefaults = parentIsDefaults;
               tree.children.push(outer.getGroupTree(scalarList, 'scalarList', tree.id, parentIsDefaults));
            }
         }
      }
   };


   this.getSimpleCheckboxTree = function(rootGroups)
   {
      const tree = [];
      for (let rootGroup of rootGroups)
      {
         tree.push(outer.getSimpleCheckboxGroupTree(rootGroup, 'root', false));
      }
      return tree;
   };


   this.getSimpleCheckboxGroupTree = function(rootGroup, type, isDefaults)
   {
      const tree = {};
      tree.text = 'Unnamed Group';
      tree.type = type;
      tree.children = [];
      tree.data = rootGroup.name;
      if (rootGroup.hasOwnProperty('displayName'))
      {
         tree.text = rootGroup.displayName;
      }
      else if (rootGroup.hasOwnProperty('name'))
      {
         tree.text = rootGroup.name;
      }
      if (rootGroup.defaults)
      {
         tree.children.push(outer.getSimpleCheckboxGroupTree(rootGroup.defaults, 'defaults', true));
      }
      this.populateCheckboxTreeLists(tree, rootGroup, isDefaults);
      if (tree.children.length === 0)
      {
         delete tree.children;
      }
      return tree;
   };


   this.populateCheckboxTreeLists = function(tree, rootGroup, isDefaults)
   {
      if (rootGroup.hasOwnProperty('groups'))
      {
         for (let group of rootGroup.groups)
         {
            if (isDefaults === true || group.isDefault === false)
            {
               tree.children.push(outer.getSimpleCheckboxGroupTree(group, 'group', isDefaults));
            }
         }
      }
      if (rootGroup.hasOwnProperty('scalars'))
      {
         for (let scalar of rootGroup.scalars)
         {
            if (isDefaults === true || scalar.isDefault === false)
            {
               tree.children.push(outer.getSimpleCheckboxGroupTree(scalar, 'scalar', isDefaults));
            }
         }
      }
      if (rootGroup.hasOwnProperty('entries'))
      {
         for (let entry of rootGroup.entries)
         {
            if (isDefaults === true || entry.isDefault === false)
            {
               tree.children.push(outer.getSimpleCheckboxGroupTree(entry, 'scalar', isDefaults));
            }
         }
      }
      if (rootGroup.hasOwnProperty('scalarLists'))
      {
         for (let scalarList of rootGroup.scalarLists)
         {
            if (isDefaults === true || scalarList.isDefault === false)
            {
               tree.children.push(outer.getSimpleCheckboxGroupTree(scalarList, 'scalarList', isDefaults));
            }
         }
      }
   };


   this.deepCopyObject = function(object)
   {
      const clone = {};
      let objectIndex;
      for (objectIndex in object)
      {
         if (object[objectIndex] !== null && typeof object[objectIndex] === 'object')
         {
            if (object[objectIndex] instanceof Array)
            {
               clone[objectIndex] = JSON.parse(JSON.stringify(object[objectIndex]));
            }
            else
            {
               clone[objectIndex] = outer.deepCopyObject(object[objectIndex]);
            }
         }
         else
         {
            clone[objectIndex] = object[objectIndex];
         }
      }
      return clone;
   };


   this.copyDataObject = function(object, type)
   {
      const dataClone = JSON.parse(JSON.stringify(object));
      let returnObject = null;
      switch (type)
      {
      case 'root':
         returnObject = new SettingsGroup(dataClone);
         break;
      case 'group':
         returnObject = new SettingsGroup(dataClone);
         break;
      case 'defaults':
         returnObject = new SettingsGroup(dataClone);
         break;
      case 'scalar':
         returnObject = new Scalar(dataClone);
         break;
      case 'scalarList':
         returnObject = new ScalarList(dataClone);
         break;
      default:
         break;
      }
      return returnObject;
   };


   this.updateDetailsPanel = function(node)
   {
      const data = outer.copyDataObject(node.data, node.type);
      const format = data.getFormat();
      format.showCancel = false;
      format.submitFunction = data.saveChanges;
      data.format = format;
      jQuery('#details').empty();
      jQuery('#details-header').text(node.data.displayName);

      const buttonDiv = jQuery('<div></div>');
      if (node.type === 'root' || node.type === 'group' || node.type === 'defaults')
      {
         const addGroupButton = jQuery('<button>Add Group</button>');
         addGroupButton.click(function()
         {
            outer.newGroup(node, 'group');
         });
         const addScalarListButton = jQuery('<button>Add Scalar List</button>');
         addScalarListButton.click(function()
         {
            outer.newScalarList(node);
         });
         buttonDiv.append(addGroupButton);
         buttonDiv.append(addScalarListButton);
      }
      if (node.type !== 'scalar')
      {
         const addScalarButton = jQuery('<button>Add Scalar</button>');
         addScalarButton.click(function()
         {
            outer.newScalar(node);
         });
         buttonDiv.append(addScalarButton);
      }
      const tree = jQuery('#tree');
      const parentNode = tree.jstree(true).get_node(node.parent);
      const formBuilder = new FormBuilder(data, {
         view: outer,
         tree: tree,
         parentNode: parentNode,
         updateNode: node,
         containerId: 'details'
      });
      jQuery.when(formBuilder.buildForm('#details')).done(function()
      {
         jQuery('#type').trigger('change');
      });
      jQuery('#details').append(jQuery('<br><hr>')).
         append(buttonDiv);
   };


   this.getContextMenuItems = function(node)
   {
      const nodeName = node.text;
      const items =
            {
               add:
               {
                  label: 'Add',
                  action: false,
                  submenu:
                  {
                     group:
                     {
                        'seperator_before': false,
                        'seperator_after': false,
                        label: 'Group',
                        action: function()
                        {
                           outer.newGroup(node, 'group');
                        }
                     },
                     scalar:
                     {
                        'seperator_before': false,
                        'seperator_after': false,
                        label: 'Scalar',
                        action: function()
                        {
                           outer.newScalar(node);
                        }
                     },
                     scalarList:
                     {
                        'seperator_before': false,
                        'seperator_after': false,
                        label: 'Scalar List',
                        action: function()
                        {
                           outer.newScalarList(node);
                        }
                     }
                  }
               },
               delete:
               {
                  label: 'Delete ' + nodeName,
                  action: function()
                  {
                     outer.confirmDelete(node);
                  }
               }
            };
      if (node.type === 'scalar')
      {
         delete items.add;
      }
      else if (node.type === 'scalarList')
      {
         delete items.add.submenu.group;
         delete items.add.submenu.scalarList;
      }
      else if (node.type === 'root')
      {
         delete items.add.submenu.scalar;
         delete items.add.submenu.scalarList;
      }
      else if (node.type === 'defaults')
      {
         delete items.delete;
      }
      return items;
   };


   this.updateTreeWithNode = function(data, type, parentNode, updateNode)
   {
      const tree = jQuery('#tree');
      const newNode = {};
      if (data.isDefault)
      {
         newNode.text = '* ' + data.displayName;
      }
      else
      {
         newNode.text = data.displayName;
         outer.updateDefaultStates(parentNode, false);
      }
      newNode.type = type;
      newNode.data = data;
      const parentNodeId = parentNode.id;
      let rootGroupNode = null;
      if (parentNodeId === '#')
      {
         newNode.id = data.idName;
         rootGroupNode = newNode;
      }
      else
      {
         newNode.id = parentNodeId + '-' + data.idName;
         newNode.data.parentIsDefaults = parentNode.data.parentIsDefaults;
         rootGroupNode = outer.getRootForNode(parentNode);
      }
      const idParts = parentNodeId.split('-').slice(2);
      let pathId = idParts.join('-');
      if (pathId !== '')
      {
         pathId = '-' + pathId;
      }
      let defaultsNode = outer.getDefaultsForNode(parentNode);
      if (updateNode)
      {
         this.updateNodeWithNode(tree, updateNode, newNode, parentNode);
      }
      else
      {
         // Add new node to current group
         tree.jstree('create_node', parentNode, newNode, 'last', false, false);
         outer.updateParentDataWithNode(parentNode, newNode);
      }
      if (parentNode.id !== '#' && parentNode.id !== rootGroupNode.id)
      {
         // Progagate default node to other groups under root
         this.propogateDefaultValueToNodes(tree, data, type, rootGroupNode, newNode, updateNode, pathId);
      }
      else if (parentNode.id === '#')
      {
         const defaultsData = {};
         defaultsData.name = 'default';
         defaultsData.displayName = newNode.data.displayName + ' Defaults';
         const defaults = new SettingsGroup(defaultsData);
         defaultsNode = {};
         defaultsNode.id = newNode.id + '-defaults';
         defaultsNode.children = [];
         defaultsNode.text = defaultsData.displayName;
         defaultsNode.data = defaults;
         defaultsNode.type = 'defaults';
         tree.jstree('create_node', newNode, defaultsNode, 'last', false, false);
         newNode.data.defaults = defaults;
      }
      const openToString = '_open_to';
      tree.jstree(true)[openToString](newNode.id);
      outer.saveSettingsFromNode(rootGroupNode);
   };


   this.propogateDefaultValueToNodes = function(tree, data, type, rootGroupNode, newNode, updateNode, pathId)
   {
      const nodeParentPairs = [];
      let node;
      let parent;
      let rootGroupIndex;
      for (rootGroupIndex in rootGroupNode.children)
      {
         if (rootGroupNode.children.hasOwnProperty(rootGroupIndex))
         {
            const parentId = rootGroupNode.children[rootGroupIndex] + pathId;
            const copyNode = outer.deepCopyObject(newNode);
            copyNode.data = outer.copyDataObject(newNode.data, newNode.type);
            const nodeId = parentId + '-' + data.idName;
            parent = tree.jstree(true).get_node(parentId);
            node = tree.jstree(true).get_node(nodeId);
            copyNode.data.parentIsDefaults = parent.data.parentIsDefaults;
            if (type === 'scalar' || type === 'scalarList')
            {
               copyNode.data.isDefault = true;
               copyNode.text = '* ' + copyNode.data.displayName;
            }
            copyNode.id = nodeId;
            if (parent.type !== 'scalar' && !node)
            {
               nodeParentPairs.push({
                  parent: parent,
                  node: copyNode
               });
            }
         }
      }
      let parentIndex;
      for (parentIndex in nodeParentPairs)
      {
         if (nodeParentPairs.hasOwnProperty(parentIndex))
         {
            parent = nodeParentPairs[parentIndex].parent;
            node = nodeParentPairs[parentIndex].node;
            let update = false;
            if (updateNode)
            {
               update = tree.jstree(true).get_node(parent.id + '-' + updateNode.data.idName);
            }
            if (update)
            {
               update.text = node.text;
               for (parentIndex in updateNode.data)
               {
                  if (node.data.hasOwnProperty(parentIndex) && update.data[parentIndex] !== Object(update.data[parentIndex]))
                  {
                     update.data[parentIndex] = node.data[parentIndex];
                  }
               }
               outer.updateParentDataWithNode(parent, update);
            }
            else
            {
               tree.jstree('create_node', parent, node, 'last', false, false);
               outer.updateParentDataWithNode(parent, node);
            }
         }
      }
   };


   this.updateNodeWithNode = function(tree, oldNode, newNode, parentNode)
   {
      let nodeIndex;
      // Replace data in existing node
      for (nodeIndex in oldNode.data)
      {
         if (newNode.data.hasOwnProperty(nodeIndex) && oldNode.data[nodeIndex] !== Object(oldNode.data[nodeIndex]))
         {
            oldNode.data[nodeIndex] = newNode.data[nodeIndex];
         }
      }
      if (oldNode.data.isDefault)
      {
         oldNode.text = '* ' + newNode.data.displayName;
      }
      else
      {
         oldNode.text = newNode.text;
      }
      outer.updateParentDataWithNode(parentNode, oldNode);
      tree.jstree('rename_node', oldNode.id, oldNode.text);
   };


   this.removeNodeFromTree = function(node)
   {
      const tree = jQuery('#tree');
      const deletedNodes = [];
      node.data.deleted = true;
      const parentNodeId = node.parent;
      const idParts = parentNodeId.split('-').slice(2);
      let pathId = idParts.join('-');
      if (pathId !== '')
      {
         pathId = '-' + pathId;
      }
      const rootGroupNode = outer.getRootForNode(node);
      const topGroup = outer.getTopLevelGroupForNode(node);
      deletedNodes.push(node.id);
      if (parentNodeId !== '#' && node.id !== topGroup.id && topGroup.type === 'defaults')
      {
         let rootGroupIndex;
         for (rootGroupIndex in rootGroupNode.children)
         {
            if (rootGroupNode.children.hasOwnProperty(rootGroupIndex))
            {
               const parentId = rootGroupNode.children[rootGroupIndex] + pathId;
               const nodeId = parentId + '-' + node.data.idName;
               const child = tree.jstree(true).get_node(nodeId);
               if (child)
               {
                  child.data.deleted = true;
                  deletedNodes.push(child.id);
               }
            }
         }
      }
      let index;
      for (index in deletedNodes)
      {
         if (deletedNodes.hasOwnProperty(index))
         {
            const toDelete = deletedNodes[index];
            tree.jstree('delete_node', toDelete);
         }
      }
      outer.saveSettingsFromNode(rootGroupNode);
   };


   this.saveSettingsFromNode = function(node)
   {
      // Update existing Settings Server elements and delete elements marked for deletion
      const treeUpdateData = outer.getJsonDataToPost(node, false); // Exclude new elements = false
      if (treeUpdateData !== null)
      {
         outer.controller.model.updateSettingsGroup(treeUpdateData);
      }
   };


   this.updateParentDataWithNode = function(parent, node)
   {
      let index;
      switch (node.type)
      {
      case 'root': {
         const rootNodes = jQuery('#tree').jstree(true).settings.core.data;
         const rootGroups = [];
         let rootNodeIndex;
         for (rootNodeIndex in rootNodes)
         {
            if (rootNodes.hasOwnProperty(rootNodeIndex))
            {
               rootGroups[rootNodeIndex] = rootNodes[rootNodeIndex].data;
            }
         }
         index = outer.findNodeIndexInList(node, rootGroups);
         if (index === null)
         {
            rootNodes.push(node);
         }
         else
         {
            rootNodes[index] = node;
         }
         break;
      }
      case 'group': {
         index = outer.findNodeIndexInList(node, parent.data.groups);
         if (index === null)
         {
            parent.data.groups.push(node.data);
         }
         else
         {
            parent.data.groups[index] = node.data;
         }
         break;
      }
      case 'scalar': {
         if (parent.type === 'scalarList')
         {
            index = outer.findNodeIndexInList(node, parent.data.entries);
            if (index === null)
            {
               parent.data.entries.push(node.data);
            }
            else
            {
               parent.data.entries[index] = node.data;
            }
         }
         else
         {
            index = outer.findNodeIndexInList(node, parent.data.scalars);
            if (index === null)
            {
               parent.data.scalars.push(node.data);
            }
            else
            {
               parent.data.scalars[index] = node.data;
            }
         }
         break;
      }
      case 'scalarList': {
         index = outer.findNodeIndexInList(node, parent.data.scalarLists);
         if (index === null)
         {
            parent.data.scalarLists.push(node.data);
         }
         else
         {
            parent.data.scalarLists[index] = node.data;
         }
         break;
      }
      default:
         break;
      }
   };

   this.updateDefaultStates = function(node, isDefault)
   {
      if (node.type === 'root' || node.type === '#')
      {
         return;
      }
      node.data.isDefault = isDefault;
      node.text = node.data.displayName;
      const parentNode = jQuery('#tree').jstree(true).get_node(node.parent);
      outer.updateDefaultStates(parentNode, false);
   };

   this.findNodeIndexInList = function(node, list)
   {
      let itemIndex;
      let ret = null;
      for (itemIndex in list)
      {
         if (list.hasOwnProperty(itemIndex))
         {
            const item = list[itemIndex];
            if (item.idName === node.data.idName)
            {
               ret = itemIndex;
               break;
            }
         }
      }
      return ret;
   };


   this.getJsonDataToPost = function(fromNodeId, excludeNew)
   {
      let jsonData = {};
      const fromNode = jQuery('#tree').jstree(true).get_node(fromNodeId);
      const rootNode = outer.getRootForNode(fromNode);
      jsonData = rootNode.data.getJsonDataToPost(excludeNew, false);
      return jsonData;
   };


   this.getRootForNode = function(node)
   {
      if (node.parents.length <= 1)
      {
         return node;
      }
      const parentNode = jQuery('#tree').jstree(true).get_node(node.parent);
      return outer.getRootForNode(parentNode);
   };


   this.getTopLevelGroupForNode = function(node)
   {
      if (node.parents.length <= 2)
      {
         return node;
      }
      const parentNode = jQuery('#tree').jstree(true).get_node(node.parent);
      return outer.getTopLevelGroupForNode(parentNode);
   };


   this.getDefaultsForNode = function(node)
   {
      const rootNode = outer.getRootForNode(node);
      const defaultsId = rootNode.id + '-defaults';
      const defaultsNode = jQuery('#tree').jstree(true).get_node(defaultsId);
      return defaultsNode;
   };


   this.newGroup = function(parentNode, type)
   {
      const tree = jQuery('#tree');
      const modal = jQuery('<div/>').
         addClass('modal fade').
         attr('id', 'newGroupModal').
         append(jQuery('<div/>').
            addClass('modal-dialog').
            css('background-color', '#fff').
            css('border', '1px solid #8e8e8e').
            css('border-radius', '5px').
            append(jQuery('<div/>').
               addClass('modal-header').
               append(jQuery('<h2>').
                  text('New Group'))).
            append(jQuery('<div/>').
               addClass('modal-body')));
      pageModule.hideLoadingModal();
      jQuery('body').append(modal.hide());
      const formBuilder = new FormBuilder(new SettingsGroup({}, true), {
         view: outer,
         tree: tree,
         parentNode: parentNode,
         containerId: 'newGroupModal',
         type: type
      });
      formBuilder.buildForm('.modal-body');
      jQuery('.modal').modal({
         backdrop: false,
         keyboard: false
      });
   };


   this.newScalar = function(parentNode)
   {
      const tree = jQuery('#tree');
      const modal = jQuery('<div/>').
         addClass('modal fade').
         attr('id', 'newScalarModal').
         append(jQuery('<div/>').
            addClass('modal-dialog').
            css('background-color', '#fff').
            css('border', '1px solid #8e8e8e').
            css('border-radius', '5px').
            append(jQuery('<div/>').
               addClass('modal-header').
               append(jQuery('<h2>').
                  text('New Scalar'))).
            append(jQuery('<div/>').
               addClass('modal-body')));
      pageModule.hideLoadingModal();
      jQuery('body').append(modal.hide());
      const formBuilder = new FormBuilder(new Scalar({}, true), {
         view: outer,
         tree: tree,
         parentNode: parentNode,
         containerId: 'newScalarModal'
      });
      formBuilder.buildForm('.modal-body');
      jQuery('.modal').modal({
         backdrop: false,
         keyboard: false
      });
   };


   this.newScalarList = function(parentNode)
   {
      const tree = jQuery('#tree');
      const modal = jQuery('<div/>').
         addClass('modal fade').
         attr('id', 'newScalarListModal').
         append(jQuery('<div/>').
            addClass('modal-dialog').
            css('background-color', '#fff').
            css('border', '1px solid #8e8e8e').
            css('border-radius', '5px').
            append(jQuery('<div/>').
               addClass('modal-header').
               append(jQuery('<h2>').
                  text('New Scalar List'))).
            append(jQuery('<div/>').
               addClass('modal-body')));
      pageModule.hideLoadingModal();
      jQuery('body').append(modal.hide());
      const formBuilder = new FormBuilder(new ScalarList({}, true), {
         view: outer,
         tree: tree,
         parentNode: parentNode,
         containerId: 'newScalarListModal'
      });
      formBuilder.buildForm('.modal-body');
      jQuery('.modal').modal({
         backdrop: false,
         keyboard: false
      });
   };


   this.confirmDelete = function(node)
   {
      const warning = 'WARNING: This action will delete ' + node.text + ' and everything it contains. This data ' +
                              'cannot be recovered.';
      const callback = function(result)
      {
         if (result)
         {
            const tree = jQuery('#tree');
            if (node.type === 'root')
            {
               outer.controller.model.deleteRootGroup(node.data.name);
               tree.jstree('delete_node', node);
            }
            else
            {
               node.data.deleted = true;
               outer.removeNodeFromTree(node);
            }
         }
      };
      bootbox.confirm({
         message: warning,
         buttons: {
            confirm: { label: 'Delete' },
            cancel: { label: 'Cancel' }
         },
         callback: callback
      });
   };


   this.showError = function(theBaseId, msg)
   {
      pageModule.showError(theBaseId, msg);
   };


   this.showSuccess = function(theBaseId, msg)
   {
      pageModule.showSuccess(theBaseId, msg);
   };


   this.ctor = function(theController)
   {
      this.controller = theController;
      this.baseId = baseId;
      this.basePanel = jQuery('#' + this.baseId);
   };

   return this.ctor(controller, baseId);
};
