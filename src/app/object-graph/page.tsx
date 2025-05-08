'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Edge,
  addEdge,
  Connection,
  Node,
  MarkerType,
  BackgroundVariant,
  Panel,
  NodeTypes,
  Handle,
  Position,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './page.css'
import {
  Package,
  Database,
  FileText,
  Layers,
  ChevronRight,
  Home,
  ArrowLeft,
  Building2,
  DoorClosed,
  Wind,
} from 'lucide-react'

import { objectModelsData, objectsData } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Define custom node components
const ObjectNode = memo(({ data, selected }: any) => {
  const hasChildren = data.hasChildren || false
  const { type, modelName } = data

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`p-3 rounded-md shadow-sm border flex flex-col min-w-[150px] transition-shadow ${
              selected ? 'border-primary shadow-md' : 'border-border'
            } bg-white`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-full w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 mr-2">
                  {data.icon}
                </div>
                <div className="text-sm font-medium truncate max-w-[100px]">
                  {data.label}
                </div>
              </div>

              {hasChildren && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {modelName && (
              <div className="mt-2 flex items-center">
                <Badge
                  variant="outline"
                  className="text-xs font-normal py-0 h-5"
                >
                  {modelName}
                </Badge>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-sm bg-white p-0 shadow-lg"
        >
          <div className="p-3">
            <div className="font-semibold mb-2">{data.label}</div>
            {modelName && (
              <div className="text-xs mb-1 text-muted-foreground">
                Model: {modelName}
              </div>
            )}
            {data.properties && data.properties.length > 0 ? (
              <div className="space-y-1 mt-2">
                <div className="text-xs font-medium">Properties:</div>
                {data.properties.map((prop: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-muted-foreground">{prop.key}:</span>
                    <span>{prop.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mt-1">
                No properties
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-blue-500"
      />
    </TooltipProvider>
  )
})

// Main flow component
function ObjectGraphFlow() {
  // States
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [includeModels, setIncludeModels] = useState(false)
  const [showProperties, setShowProperties] = useState(true)
  const [currentObject, setCurrentObject] = useState<any>(null)
  const [navigationStack, setNavigationStack] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // References
  const reactFlowInstance = useRef<any>(null)

  // Constants
  const nodeTypes = {
    objectNode: ObjectNode,
  }

  // Default edge options
  const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: '#94a3b8',
    },
  }

  // Get icon for object type
  const getObjectIcon = (object: any) => {
    const name = object.name?.toLowerCase() || ''
    const type = name.split(' ')[0] || ''

    if (name.includes('building') || name.includes('house'))
      return <Building2 size={16} />
    if (name.includes('floor')) return <Layers size={16} />
    if (name.includes('room')) return <Package size={16} />
    if (name.includes('wall')) return <Layers size={16} />
    if (name.includes('door')) return <DoorClosed size={16} />
    if (name.includes('window')) return <Wind size={16} />
    if (name.includes('kitchen')) return <Package size={16} />

    return <Package size={16} />
  }

  // Find object by UUID in hierarchy
  const findObjectById = useCallback(
    (uuid: string, objects = objectsData): any => {
      for (const obj of objects) {
        if (obj.uuid === uuid) {
          return obj
        }

        if (obj.children && obj.children.length > 0) {
          const found = findObjectById(uuid, obj.children)
          if (found) return found
        }
      }
      return null
    },
    []
  )

  // Extract properties from object
  const extractProperties = useCallback((object: any) => {
    if (!object.properties) return []

    return object.properties.map((prop: any) => {
      let value = ''

      if (prop.values && prop.values.length > 0) {
        value = prop.values[0].value || ''
      } else if (prop.value !== undefined) {
        value = prop.value
      }

      return {
        key: prop.key,
        value: value,
      }
    })
  }, [])

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (event.detail !== 1) return // Only handle single clicks

      const uuid = node.id.replace('object-', '')
      const clickedObject = findObjectById(uuid)

      if (clickedObject?.children?.length > 0) {
        setIsLoading(true)

        // Save current object to navigation stack
        if (currentObject) {
          setNavigationStack((prev) => [...prev, currentObject])
        }

        // Set new object to display
        setCurrentObject(clickedObject)

        setIsLoading(false)
      }
    },
    [findObjectById, currentObject]
  )

  // Create nodes and edges for visualization
  const createNodesAndEdges = useCallback(
    (object: any = null, isRoot = true) => {
      const nodes: Node[] = []
      const edges: Edge[] = []

      // Use provided object or default to current one or root objects
      const objectsToDisplay = object
        ? [object]
        : currentObject
          ? [currentObject]
          : objectsData

      // Helper to process object and its children
      const processObject = (
        obj: any,
        parentId: string | null = null,
        level = 0,
        index = 0
      ) => {
        const objectId = `object-${obj.uuid}`
        const properties = showProperties ? extractProperties(obj) : []
        const hasChildren = !!(obj.children && obj.children.length > 0)

        // Find model info
        let modelName = ''
        if (obj.modelUuid && includeModels) {
          const model = objectModelsData.find((m) => m.uuid === obj.modelUuid)
          if (model) {
            modelName = model.name
          }
        }

        // Add node
        nodes.push({
          id: objectId,
          type: 'objectNode',
          position: { x: 0, y: 0 }, // Position will be calculated later
          data: {
            label: obj.name,
            object: obj,
            icon: getObjectIcon(obj),
            properties,
            hasChildren,
            modelName,
            level,
          },
        })

        // Add edge if has parent
        if (parentId) {
          edges.push({
            id: `edge-${parentId}-${objectId}`,
            source: parentId,
            target: objectId,
            type: 'smoothstep',
            animated: false,
            label: 'contains',
          })
        }

        // Process children if needed
        if (level === 0 && hasChildren) {
          obj.children.forEach((child: any, idx: number) => {
            processObject(child, objectId, level + 1, idx)
          })
        }
      }

      // Process each object
      objectsToDisplay.forEach((obj, idx) => {
        processObject(obj, null, 0, idx)
      })

      return { nodes, edges }
    },
    [currentObject, showProperties, extractProperties, includeModels]
  )

  // Auto-layout the graph
  const layoutGraph = useCallback((nodes: Node[], edges: Edge[]) => {
    if (!nodes.length) return nodes

    setIsLoading(true)

    // Simple dagreish layout
    const direction = 'LR' // Left to right
    const nodeWidth = 180
    const nodeHeight = 60
    const spacing = { x: 100, y: 70 }

    // Group nodes by level
    const nodesByLevel: { [key: number]: Node[] } = {}
    nodes.forEach((node) => {
      const level = node.data.level || 0
      if (!nodesByLevel[level]) nodesByLevel[level] = []
      nodesByLevel[level].push(node)
    })

    // Position nodes by level
    Object.keys(nodesByLevel).forEach((levelStr) => {
      const level = parseInt(levelStr)
      const nodesAtLevel = nodesByLevel[level]

      nodesAtLevel.forEach((node, index) => {
        // Layout direction
        if (direction === 'LR') {
          node.position = {
            x: level * (nodeWidth + spacing.x),
            y: index * (nodeHeight + spacing.y),
          }
        } else {
          node.position = {
            x: index * (nodeWidth + spacing.x),
            y: level * (nodeHeight + spacing.y),
          }
        }
      })
    })

    setIsLoading(false)

    return [...nodes] // Return new array to trigger update
  }, [])

  // Initialize graph
  const generateGraph = useCallback(() => {
    const { nodes, edges } = createNodesAndEdges()
    const positionedNodes = layoutGraph(nodes, edges)

    setNodes(positionedNodes)
    setEdges(edges)

    // Center view
    setTimeout(() => {
      if (reactFlowInstance.current) {
        reactFlowInstance.current.fitView({ padding: 0.2 })
      }
    }, 50)
  }, [createNodesAndEdges, layoutGraph])

  // Navigate up
  const navigateUp = useCallback(() => {
    if (navigationStack.length === 0) {
      // At root level
      setCurrentObject(null)
      return
    }

    // Get previous object
    const previous = navigationStack[navigationStack.length - 1]
    setCurrentObject(previous)

    // Update stack
    setNavigationStack((prev) => prev.slice(0, -1))
  }, [navigationStack])

  // Go to root
  const navigateToRoot = useCallback(() => {
    setCurrentObject(null)
    setNavigationStack([])
  }, [])

  // Navigate to specific path
  const navigateToPath = useCallback(
    (index: number) => {
      if (index < 0) {
        navigateToRoot()
        return
      }

      setCurrentObject(navigationStack[index])
      setNavigationStack((prev) => prev.slice(0, index))
    },
    [navigationStack, navigateToRoot]
  )

  // Store ReactFlow instance reference
  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance
  }, [])

  // Generate graph when settings change
  useEffect(() => {
    generateGraph()
  }, [generateGraph, currentObject, includeModels, showProperties])

  // Get current view name and children count
  const viewTitle = currentObject ? currentObject.name : 'All Buildings'
  const childrenCount = currentObject
    ? currentObject.children?.length || 0
    : objectsData.length

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Object Browser</h2>
            {/* <div className="flex gap-4">
              <Tabs defaultValue="display" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="display">Display</TabsTrigger>
                  <TabsTrigger value="options">Options</TabsTrigger>
                </TabsList>
                <TabsContent value="display" className="mt-2">
                  <Card>
                    <CardContent className="p-4 flex gap-4 items-center">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="include-models"
                          checked={includeModels}
                          onCheckedChange={setIncludeModels}
                          disabled={isLoading}
                        />
                        <Label htmlFor="include-models">Show Models</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-properties"
                          checked={showProperties}
                          onCheckedChange={setShowProperties}
                          disabled={isLoading}
                        />
                        <Label htmlFor="show-properties">Show Properties</Label>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="options" className="mt-2">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Click on an object with children to navigate deeper. Use
                        the breadcrumb navigation to go back.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div> */}
          </div>

          {/* Navigation breadcrumbs */}
          <div className="flex items-center space-x-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateUp}
              disabled={isLoading || !currentObject}
              className="flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              <Button
                variant={currentObject ? 'ghost' : 'secondary'}
                size="sm"
                onClick={navigateToRoot}
                disabled={isLoading || !currentObject}
              >
                Root
              </Button>

              {navigationStack.map((obj, index) => (
                <div key={obj.uuid} className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToPath(index)}
                    disabled={isLoading}
                  >
                    {obj.name}
                  </Button>
                </div>
              ))}

              {currentObject && (
                <div className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Button variant="secondary" size="sm" disabled={true}>
                    {currentObject.name}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Current view info */}

          <div className="h-[calc(100vh-280px)] border rounded-md overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onInit={onInit}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              attributionPosition="bottom-right"
              proOptions={{ hideAttribution: true }}
            >
              <Controls />
              <MiniMap />
              <Background
                variant={BackgroundVariant.Dots}
                gap={12}
                size={1}
                color="#e2e8f0"
              />

              {isLoading && (
                <Panel
                  position="top-center"
                  className="bg-white/90 p-2 rounded shadow"
                >
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Loading...</span>
                  </div>
                </Panel>
              )}

              {nodes.length === 0 && !isLoading && (
                <Panel
                  position="top-center"
                  className="bg-white/90 p-4 rounded shadow text-center w-full"
                >
                  <div className="space-y-2">
                    <p>No objects to display at this level.</p>
                    <Button onClick={navigateUp}>Go Back</Button>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main export with ReactFlowProvider
export default function ObjectGraphPage() {
  return (
    <ReactFlowProvider>
      <ObjectGraphFlow />
    </ReactFlowProvider>
  )
}
