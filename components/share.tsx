import { Icons } from "./icons"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { toast } from "./ui/use-toast"

export function Share({ idString }: { idString: string }) {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(idString)
      .then(() => {
        toast({
          description: "Copied to clipboard",
        })
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          description: "Unable to copy to clipboard",
        })
        console.error("Unable to copy text: ", err)
      })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">
                <span className="text-sm">Share</span>
                <Icons.share className="ml-2 h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                You can send this form to the founder to enter their details
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold">Share Link</h3>
          <p className="text-sm text-muted-foreground">
            Share this link to request the company details from the founder
          </p>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Input id="link" defaultValue={idString} readOnly className="h-9" />

          <Button type="submit" size="sm" onClick={handleCopy} className="px-3">
            <span className="sr-only">Copy</span>
            <Icons.copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
