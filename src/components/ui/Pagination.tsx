import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  pageCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = totalItems === 0 ? 0 : Math.min(page * pageSize, totalItems);
  const pageLabel = totalItems === 0 ? `0 of 0` : `${start}–${end} of ${totalItems}`;
  const displayPage = totalItems === 0 ? 0 : page;
  const displayPageCount = totalItems === 0 ? 0 : pageCount;
  const isFirstPage = totalItems === 0 || page <= 1;
  const isLastPage = totalItems === 0 || page >= pageCount;

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 px-3 py-2", className)}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-light">
        <span>Show</span>
        <Select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="w-24"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
        <span>per page</span>
        <span className="font-medium text-ink">{pageLabel}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={isFirstPage}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <div className="text-sm text-slate-light">
          Page {displayPage} of {displayPageCount}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={isLastPage}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
