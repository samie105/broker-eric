"use client"
import { Button } from "../../../components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Table,
  Upload,
} from "lucide-react"

export function EmailEditorToolbar({ onInsertTable, onUploadClick }) {
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-t-lg border border-b-0">
      <div className="flex items-center gap-1 mr-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <Bold className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <Italic className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <Underline className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1"></div>

      <div className="flex items-center gap-1 mr-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1"></div>

      <div className="flex items-center gap-1 mr-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <List className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1"></div>

      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <Link className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-gray-700 hover:bg-gray-200">
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-700 hover:bg-gray-200"
          onClick={onInsertTable}
        >
          <Table className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-700 hover:bg-gray-200"
          onClick={onUploadClick}
        >
          <Upload className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
