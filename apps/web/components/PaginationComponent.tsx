import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname } from "next/navigation";

interface props {
  currentPage: number;
  totalPages: number;
  handlePageChange: any;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  handlePageChange,
}: props) {
 
  const pathname = usePathname()
  return (
    <Pagination className="mt-10 md:px-0 px-5">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          />
        </PaginationItem>
        {[...Array(totalPages)].map((_, index) => (
          <PaginationItem key={index}>
            <PaginationLink
              href="#"
              isActive={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        {totalPages > 3 && pathname!== "/dashboard" &&  <PaginationEllipsis />}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
