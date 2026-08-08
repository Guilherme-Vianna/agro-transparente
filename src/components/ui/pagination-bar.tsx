import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function PaginationBar({
  page,
  totalPages,
  total,
  buildHref,
}: {
  page: number
  totalPages: number
  total: number
  buildHref: (page: number) => string
}) {
  if (total === 0) return null

  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages} · {total} {total === 1 ? "registro" : "registros"}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(page - 1)}
          aria-disabled={isFirst}
          tabIndex={isFirst ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            isFirst && "pointer-events-none opacity-50"
          )}
        >
          <ChevronLeft /> Anterior
        </Link>
        <Link
          href={buildHref(page + 1)}
          aria-disabled={isLast}
          tabIndex={isLast ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            isLast && "pointer-events-none opacity-50"
          )}
        >
          Próxima <ChevronRight />
        </Link>
      </div>
    </div>
  )
}
