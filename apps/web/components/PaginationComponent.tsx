import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
 
  return (
    <Pagination className="mt-10">
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
        {totalPages > 3 && <PaginationEllipsis />}
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
