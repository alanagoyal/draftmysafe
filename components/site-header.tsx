import Link from "next/link"
import { Button } from "@/components/ui/button"
import UserNav from "./user-nav"

export function SiteHeader({ user }: { user: any }) {
  return (
    <nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <span className="text-2xl font-bold">Draftmysafe</span>
          </Link>
          <div className="flex items-center mx-1">
            <div className="items-center space-x-2">
              <Link
                href="https://github.com/alanagoyal/safebase"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-block"
              >
                <Button variant="ghost">View on GitHub</Button>
              </Link>
              {user ? (
                <UserNav user={user} />
              ) : (
                <Link href="login">
                  <Button className="ml-4">Log In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
