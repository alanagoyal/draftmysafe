import { FormDescription, FormLabel } from "./ui/form"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Separator } from "./ui/separator"

type EntitySelectorProps = {
  entities: any[]
  selectedEntity: string
  onSelectChange: (value: string) => void
  addEntities: boolean
}

export function EntitySelector({
  entities,
  selectedEntity,
  onSelectChange,
  addEntities,
}: EntitySelectorProps) {
  return (
    <Select
      key={`select-${entities.length}`}
      value={selectedEntity}
      onValueChange={onSelectChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select or add an entity" />
      </SelectTrigger>
      <SelectContent>
        {entities.map((item) => (
          <SelectItem key={`entity-${item.id}`} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
        {addEntities && (
          <>
            <Separator />
            <SelectItem key="add-new-fund" value="add-new-fund">
              + New fund
            </SelectItem>
            <SelectItem key="add-new-company" value="add-new-company">
              + New company
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  )
}
