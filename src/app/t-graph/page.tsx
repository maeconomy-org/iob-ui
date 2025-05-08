'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
} from 'reactflow'
import 'reactflow/dist/style.css'

import { objectModelsData, objectsData } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Define the node data interface
interface ObjectNodeData {
  label: string
  object: any
  type?: string
}

// Interface for our custom node type
type ObjectNode = Node<ObjectNodeData>

export default function ObjectGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [includeModels, setIncludeModels] = useState(true)
  const [includeProperties, setIncludeProperties] = useState(false)
  const [layoutType, setLayoutType] = useState<'hierarchical' | 'force'>(
    'hierarchical'
  )

  // Keep track of layout calculation in progress
  const [isCalculatingLayout, setIsCalculatingLayout] = useState(false)
  const layoutTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds
        )
      ),
    [setEdges]
  )

  // Simulate force-directed layout for better node distribution
  const applyForceLayout = useCallback(
    (initialNodes: any[], initialEdges: Edge[]) => {
      let simulationNodes = [...initialNodes]
      const nodeMap = new Map(simulationNodes.map((node) => [node.id, node]))

      // Apply repulsive forces between all nodes
      const repulsion = 200 // Strength of repulsion
      const attraction = 0.5 // Strength of edge attraction
      const iterations = 100 // Number of iterations

      setIsCalculatingLayout(true)

      // Run a simple force algorithm
      for (let i = 0; i < iterations; i++) {
        // Calculate forces
        const forces = new Map<string, { fx: number; fy: number }>()

        // Initialize forces
        simulationNodes.forEach((node) => {
          forces.set(node.id, { fx: 0, fy: 0 })
        })

        // Apply repulsive forces between all nodes
        for (let i = 0; i < simulationNodes.length; i++) {
          for (let j = i + 1; j < simulationNodes.length; j++) {
            const nodeA = simulationNodes[i]
            const nodeB = simulationNodes[j]

            const dx = nodeB.position.x - nodeA.position.x
            const dy = nodeB.position.y - nodeA.position.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Avoid division by zero
            if (distance < 1) continue

            // Calculate force
            const force = repulsion / (distance * distance)
            const fx = (dx / distance) * force
            const fy = (dy / distance) * force

            const forceA = forces.get(nodeA.id)!
            const forceB = forces.get(nodeB.id)!

            forceA.fx -= fx
            forceA.fy -= fy
            forceB.fx += fx
            forceB.fy += fy
          }
        }

        // Apply attractive forces along edges
        initialEdges.forEach((edge) => {
          const source = nodeMap.get(edge.source)
          const target = nodeMap.get(edge.target)

          if (!source || !target) return

          const dx = target.position.x - source.position.x
          const dy = target.position.y - source.position.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Avoid division by zero
          if (distance < 1) return

          // Get the target distance based on node type
          const targetDistance = 150 // Base distance between nodes

          // Calculate force (attraction to ideal distance)
          const force = (distance - targetDistance) * attraction
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          const forceSource = forces.get(source.id)!
          const forceTarget = forces.get(target.id)!

          forceSource.fx += fx
          forceSource.fy += fy
          forceTarget.fx -= fx
          forceTarget.fy -= fy
        })

        // Apply forces to nodes
        simulationNodes = simulationNodes.map((node) => {
          const force = forces.get(node.id)!

          // Limit maximum force to avoid explosions
          const maxForce = 10
          const fx = Math.min(Math.max(force.fx, -maxForce), maxForce)
          const fy = Math.min(Math.max(force.fy, -maxForce), maxForce)

          return {
            ...node,
            position: {
              x: node.position.x + fx,
              y: node.position.y + fy,
            },
          }
        })
      }

      // Update nodes with new positions
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current)
      }

      // Slight delay to let state updates process
      layoutTimeoutRef.current = setTimeout(() => {
        setNodes(simulationNodes)
        setIsCalculatingLayout(false)
      }, 50)

      return simulationNodes
    },
    [setNodes]
  )

  // Position nodes in hierarchical tree layout
  const applyHierarchicalLayout = useCallback(
    (graphNodes: any[], graphEdges: Edge[]) => {
      // Create a map of nodes by ID
      const nodeMap = new Map(graphNodes.map((node) => [node.id, node]))

      // Create a map to track parents
      const parentMap = new Map<string, string>()
      graphEdges.forEach((edge) => {
        // Only consider parent-child relationships (not property or model relationships)
        const sourceNode = nodeMap.get(edge.source)
        const targetNode = nodeMap.get(edge.target)

        if (
          sourceNode?.data.type === 'object' &&
          targetNode?.data.type === 'object'
        ) {
          parentMap.set(edge.target, edge.source)
        }
      })

      // Identify root nodes (those without parent object nodes)
      const rootNodeIds = graphNodes
        .filter(
          (node) => node.data.type === 'object' && !parentMap.has(node.id)
        )
        .map((node) => node.id)

      // Group children by type
      interface NodeTypeGroup {
        walls: string[]
        doors: string[]
        windows: string[]
        others: string[]
        properties: string[]
        models: string[]
      }

      const nodeChildren = new Map<string, NodeTypeGroup>()

      // Initialize node type groups for all nodes
      graphNodes.forEach((node) => {
        if (node.data.type === 'object') {
          nodeChildren.set(node.id, {
            walls: [],
            doors: [],
            windows: [],
            others: [],
            properties: [],
            models: [],
          })
        }
      })

      // Fill in the child groups
      graphEdges.forEach((edge) => {
        const sourceNode = nodeMap.get(edge.source)
        const targetNode = nodeMap.get(edge.target)

        if (!sourceNode || !targetNode) return

        // Skip if source is not an object node
        if (sourceNode.data.type !== 'object') return

        const childGroup = nodeChildren.get(edge.source)
        if (!childGroup) return

        if (targetNode.data.type === 'property') {
          childGroup.properties.push(edge.target)
        } else if (targetNode.data.type === 'model') {
          childGroup.models.push(edge.target)
        } else if (targetNode.data.type === 'object') {
          // Categorize object nodes based on their name
          const name = targetNode.data.object.name.toLowerCase()
          if (name.includes('wall')) {
            childGroup.walls.push(edge.target)
          } else if (name.includes('door')) {
            childGroup.doors.push(edge.target)
          } else if (name.includes('window')) {
            childGroup.windows.push(edge.target)
          } else {
            childGroup.others.push(edge.target)
          }
        }
      })

      // Position nodes in a hierarchical layout
      const horizontalSpacing = 200
      const verticalSpacing = 120
      const propertySpacing = 40
      const siblingSpacing = 80

      // Recursively position a node and its children
      const positionNodeHierarchy = (
        nodeId: string,
        x: number,
        y: number,
        level: number
      ): { width: number; height: number } => {
        const node = nodeMap.get(nodeId)
        if (!node) return { width: 0, height: 0 }

        // Update node position
        node.position = { x, y }

        const childGroup = nodeChildren.get(nodeId)
        if (!childGroup)
          return { width: horizontalSpacing, height: verticalSpacing }

        let currentX = x
        let currentY = y + verticalSpacing
        let maxChildWidth = 0
        let totalChildHeight = 0

        // Position model nodes to the right
        if (childGroup.models.length > 0) {
          childGroup.models.forEach((modelId) => {
            const modelNode = nodeMap.get(modelId)
            if (modelNode) {
              modelNode.position = {
                x: x + horizontalSpacing * 1.5,
                y:
                  y +
                  (childGroup.models.indexOf(modelId) * verticalSpacing) / 2,
              }
            }
          })
        }

        // Position property nodes to the left
        if (childGroup.properties.length > 0) {
          childGroup.properties.forEach((propId) => {
            const propNode = nodeMap.get(propId)
            if (propNode) {
              propNode.position = {
                x: x - horizontalSpacing,
                y: y + childGroup.properties.indexOf(propId) * propertySpacing,
              }
            }
          })
        }

        // Create a grid layout for walls
        if (childGroup.walls.length > 0) {
          const gridCols = Math.ceil(Math.sqrt(childGroup.walls.length))

          childGroup.walls.forEach((wallId, idx) => {
            const col = idx % gridCols
            const row = Math.floor(idx / gridCols)

            const wallNode = nodeMap.get(wallId)
            if (wallNode) {
              wallNode.position = {
                x: x - horizontalSpacing / 2 + col * siblingSpacing,
                y: currentY + row * siblingSpacing,
              }
            }
          })

          const wallsHeight =
            Math.ceil(childGroup.walls.length / gridCols) * siblingSpacing
          currentY += wallsHeight + verticalSpacing / 2
          totalChildHeight += wallsHeight + verticalSpacing / 2
        }

        // Create a grid layout for doors
        if (childGroup.doors.length > 0) {
          const gridCols = Math.ceil(Math.sqrt(childGroup.doors.length))

          childGroup.doors.forEach((doorId, idx) => {
            const col = idx % gridCols
            const row = Math.floor(idx / gridCols)

            const doorNode = nodeMap.get(doorId)
            if (doorNode) {
              doorNode.position = {
                x: x + col * siblingSpacing,
                y: currentY + row * siblingSpacing,
              }
            }
          })

          const doorsHeight =
            Math.ceil(childGroup.doors.length / gridCols) * siblingSpacing
          currentY += doorsHeight + verticalSpacing / 2
          totalChildHeight += doorsHeight + verticalSpacing / 2
        }

        // Create a grid layout for windows
        if (childGroup.windows.length > 0) {
          const gridCols = Math.ceil(Math.sqrt(childGroup.windows.length))

          childGroup.windows.forEach((windowId, idx) => {
            const col = idx % gridCols
            const row = Math.floor(idx / gridCols)

            const windowNode = nodeMap.get(windowId)
            if (windowNode) {
              windowNode.position = {
                x: x + horizontalSpacing / 2 + col * siblingSpacing,
                y: currentY + row * siblingSpacing,
              }
            }
          })

          const windowsHeight =
            Math.ceil(childGroup.windows.length / gridCols) * siblingSpacing
          currentY += windowsHeight + verticalSpacing / 2
          totalChildHeight += windowsHeight + verticalSpacing / 2
        }

        // Position other object nodes in a tree
        let otherNodesWidth = 0
        if (childGroup.others.length > 0) {
          const startX = x - (childGroup.others.length * horizontalSpacing) / 2

          childGroup.others.forEach((childId) => {
            const childX =
              startX + childGroup.others.indexOf(childId) * horizontalSpacing
            const childSize = positionNodeHierarchy(
              childId,
              childX,
              currentY,
              level + 1
            )
            otherNodesWidth += childSize.width
            totalChildHeight += childSize.height
          })
        }

        maxChildWidth = Math.max(maxChildWidth, otherNodesWidth)
        return {
          width: Math.max(horizontalSpacing, maxChildWidth),
          height: Math.max(verticalSpacing, totalChildHeight),
        }
      }

      // Position each root node and its subtree
      let xOffset = 0
      const yOffset = 0

      rootNodeIds.forEach((rootId) => {
        const size = positionNodeHierarchy(rootId, xOffset, yOffset, 0)
        xOffset += size.width + horizontalSpacing
      })

      return graphNodes
    },
    []
  )

  // Transform objects into graph nodes and edges
  const generateGraph = useCallback(() => {
    const graphNodes: any[] = []
    const graphEdges: Edge[] = []

    // Initial positions for nodes
    const initialX = 300
    const initialY = 100

    // Process objects
    const processObject = (
      object: any,
      parentId?: string,
      depth = 0,
      index = 0
    ) => {
      // Create node for current object
      const objectNodeId = `object-${object.uuid}`

      // Add random offsets for initial positions
      const randomX = initialX + index * 100 + (Math.random() * 20 - 10)
      const randomY = initialY + depth * 100 + (Math.random() * 20 - 10)

      graphNodes.push({
        id: objectNodeId,
        data: {
          label: object.name,
          object,
          type: 'object',
        },
        type: 'default',
        position: { x: randomX, y: randomY },
        style: {
          background: '#63aeff',
          color: '#ffffff',
          border: '1px solid #4287c9',
          borderRadius: '10px',
          padding: '10px',
          width: 180,
        },
      })

      // Create edge from parent to this object if parent exists
      if (parentId) {
        graphEdges.push({
          id: `edge-${parentId}-${objectNodeId}`,
          source: parentId,
          target: objectNodeId,
          type: 'smoothstep',
          style: { stroke: '#4287c9' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        })
      }

      // Process model relationship if includeModels is true
      if (includeModels && object.modelUuid) {
        const model = objectModelsData.find((m) => m.uuid === object.modelUuid)
        if (model) {
          const modelNodeId = `model-${model.uuid}`

          // Check if model node already exists
          if (!graphNodes.find((node) => node.id === modelNodeId)) {
            graphNodes.push({
              id: modelNodeId,
              data: {
                label: `${model.name} (Model)`,
                object: model,
                type: 'model',
              },
              type: 'default',
              position: {
                x: randomX + 300,
                y: randomY,
              },
              style: {
                background: '#ffc107',
                color: '#000000',
                border: '1px solid #c99a07',
                borderRadius: '10px',
                padding: '10px',
                width: 180,
              },
            })
          }

          graphEdges.push({
            id: `edge-${objectNodeId}-${modelNodeId}`,
            source: objectNodeId,
            target: modelNodeId,
            type: 'smoothstep',
            style: { stroke: '#ffc107' },
            label: 'Instance of',
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          })
        }
      }

      // Process property nodes if includeProperties is true
      if (includeProperties && object.properties) {
        object.properties.forEach((property: any, idx: number) => {
          const propertyNodeId = `property-${property.uuid}`

          graphNodes.push({
            id: propertyNodeId,
            data: {
              label: `${property.key}: ${property.values?.[0]?.value || 'N/A'}`,
              object: property,
              type: 'property',
            },
            type: 'default',
            position: {
              x: randomX - 250,
              y: randomY + idx * 80,
            },
            style: {
              background: '#8bc34a',
              color: '#000000',
              border: '1px solid #689f38',
              borderRadius: '10px',
              padding: '10px',
              width: 180,
            },
          })

          graphEdges.push({
            id: `edge-${objectNodeId}-${propertyNodeId}`,
            source: objectNodeId,
            target: propertyNodeId,
            type: 'smoothstep',
            style: { stroke: '#8bc34a' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          })
        })
      }

      // Process children recursively
      if (object.children && object.children.length > 0) {
        object.children.forEach((child: any, idx: number) => {
          processObject(child, objectNodeId, depth + 1, idx)
        })
      }
    }

    // Start processing with root objects (objects without parents)
    objectsData.forEach((rootObject, idx) => {
      processObject(rootObject, undefined, 0, idx)
    })

    // Choose layout algorithm based on selected type
    if (layoutType === 'hierarchical') {
      const positionedNodes = applyHierarchicalLayout(graphNodes, graphEdges)
      setNodes(positionedNodes)
    } else {
      // For force layout, set initial positions then apply force algorithm
      setNodes(graphNodes)
      setEdges(graphEdges)

      // Apply force layout after a brief delay to allow state update
      setTimeout(() => {
        applyForceLayout(graphNodes, graphEdges)
      }, 100)
      return
    }

    setEdges(graphEdges)
  }, [
    setNodes,
    setEdges,
    includeModels,
    includeProperties,
    layoutType,
    applyHierarchicalLayout,
    applyForceLayout,
  ])

  // Generate graph when component mounts or settings change
  useEffect(() => {
    generateGraph()

    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current)
      }
    }
  }, [generateGraph])

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Object Relationship Graph
            </h2>
            <div className="flex gap-4">
              <Button
                onClick={() => setLayoutType('hierarchical')}
                variant={layoutType === 'hierarchical' ? 'default' : 'outline'}
                disabled={isCalculatingLayout}
              >
                Hierarchical Layout
              </Button>
              <Button
                onClick={() => setLayoutType('force')}
                variant={layoutType === 'force' ? 'default' : 'outline'}
                disabled={isCalculatingLayout}
              >
                Force Layout
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-models"
                    checked={includeModels}
                    onCheckedChange={setIncludeModels}
                    disabled={isCalculatingLayout}
                  />
                  <Label htmlFor="include-models">Show Models</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-properties"
                    checked={includeProperties}
                    onCheckedChange={setIncludeProperties}
                    disabled={isCalculatingLayout}
                  />
                  <Label htmlFor="include-properties">Show Properties</Label>
                </div>
                <Button onClick={generateGraph} disabled={isCalculatingLayout}>
                  {isCalculatingLayout ? 'Calculating...' : 'Refresh Graph'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="h-[calc(100vh-300px)] border rounded-md overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-right"
              nodesDraggable={!isCalculatingLayout}
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              {isCalculatingLayout && (
                <Panel
                  position="top-center"
                  className="bg-white/90 p-2 rounded shadow"
                >
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Calculating layout...</span>
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
