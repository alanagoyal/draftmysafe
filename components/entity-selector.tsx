import { FormDescription } from "./ui/form"
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
  entityType: "fund" | "company" | "both"
}

export function EntitySelector({
  entities,
  selectedEntity,
  onSelectChange,
  entityType,
}: EntitySelectorProps) {
  const filteredEntities = entities.filter(
    (item) => entityType === "both" || item.type === entityType
  )

  if (entityType !== "both" && filteredEntities.length === 0) {
    return null
  }
  
  return (
    <>
      <Select
        key={`select-${entities.length}`}
        value={
          entityType === "both" && filteredEntities.length === 0
            ? undefined
            : selectedEntity
        }
        onValueChange={onSelectChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              entityType === "both"
                ? "Select or add an entity"
                : `Select a ${entityType}`
            }
          />
        </SelectTrigger>
        <SelectContent>
          {entityType === "both" && (
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
          {filteredEntities.map((item) => (
            <SelectItem key={`entity-${item.id}`} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormDescription>
        {entityType === "both"
          ? "Add or edit an entity to be used in your signature block"
          : `Choose a ${entityType} to be used in your signature block`}
      </FormDescription>
    </>
  )
}
