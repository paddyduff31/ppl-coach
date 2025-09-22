import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Advanced Virtual Table Component
export interface Column<TData> {
  id: string
  header: string | React.ReactNode
  accessorKey?: keyof TData
  cell?: (row: TData) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
}

export interface VirtualTableProps<TData> {
  data: TData[]
  columns: Column<TData>[]
  height?: number
  rowHeight?: number
  searchable?: boolean
  sortable?: boolean
  onRowClick?: (row: TData) => void
  className?: string
  emptyMessage?: string
}

export function VirtualTable<TData extends Record<string, any>>({
  data,
  columns,
  height = 600,
  rowHeight = 60,
  searchable = true,
  sortable = true,
  onRowClick,
  className,
  emptyMessage = "No data available"
}: VirtualTableProps<TData>) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof TData | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  const parentRef = React.useRef<HTMLDivElement>(null)

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data

    return data.filter((row) => {
      return columns.some((column) => {
        if (!column.accessorKey) return false
        const value = row[column.accessorKey]
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    })
  }, [data, searchTerm, columns])

  // Sort filtered data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key!]
      const bVal = b[sortConfig.key!]

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  })

  const handleSort = (key: keyof TData) => {
    if (!sortable) return

    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (columnKey: keyof TData) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 ml-1" />
    )
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">
            {sortedData.length} of {data.length}
          </Badge>
        </div>
      )}

      {/* Virtual Table Container */}
      <div className="border rounded-lg overflow-hidden">
        <div className="w-full">
          {/* Header */}
          <div className="grid bg-muted/50 border-b sticky top-0 z-10"
               style={{
                 gridTemplateColumns: columns.map(col =>
                   col.width ? `${col.width}px` : '1fr'
                 ).join(' ')
               }}>
            {columns.map((column) => (
              <div
                key={column.id}
                className={cn(
                  "flex items-center h-12 px-4 font-medium text-left text-muted-foreground",
                  column.sortable && sortable && "cursor-pointer hover:bg-muted/80"
                )}
                onClick={() => column.accessorKey && column.sortable && handleSort(column.accessorKey)}
              >
                <span className="flex items-center">
                  {column.header}
                  {column.accessorKey && sortable && column.sortable && getSortIcon(column.accessorKey)}
                </span>
              </div>
            ))}
          </div>

          {/* Virtual Scrolling Body */}
          <div
            ref={parentRef}
            className="relative overflow-auto"
            style={{ height: `${height}px` }}
          >
            {sortedData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{emptyMessage}</p>
              </div>
            ) : (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const row = sortedData[virtualItem.index]
                  return (
                    <div
                      key={virtualItem.key}
                      className={cn(
                        "absolute top-0 left-0 w-full grid border-b transition-colors",
                        onRowClick && "cursor-pointer hover:bg-muted/50",
                      )}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                        gridTemplateColumns: columns.map(col =>
                          col.width ? `${col.width}px` : '1fr'
                        ).join(' ')
                      }}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column) => (
                        <div
                          key={column.id}
                          className="p-4 flex items-center truncate"
                        >
                          {column.cell
                            ? column.cell(row)
                            : column.accessorKey
                              ? String(row[column.accessorKey] || '')
                              : ''
                          }
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Showing {virtualizer.getVirtualItems().length} of {sortedData.length} items
        </span>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
          >
            Clear search
          </Button>
        )}
      </div>
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}