import { useEffect, useState } from "react";
import CustomButton from "../CustomButton";
import MenuList from "../MenuList";

interface PaginationBarProps {
  labelShowing?: string;
  labelResults?: string;
  isPageable?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  rows: number;
  nextEnabled: boolean;
  previousEnabled: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onChangePageSize?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export default function PaginationBar(Props: PaginationBarProps) {
  const {
    rows, labelShowing, labelResults, previousLabel,
    nextLabel, nextEnabled, previousEnabled,
    onNextPage, onPreviousPage, pageSizeOptions,
    onChangePageSize
  } = Props;

  const [pageSize, setPageSize] = useState((pageSizeOptions || [5])[0])

  useEffect(() => {
    onChangePageSize&&onChangePageSize(pageSize)
  }, [pageSize])
  return (
    <nav
      className="flex items-center justify-between border-t px-4 py-3 sm:px-6"
      aria-label="Pagination"
    >
      <div className="flex justify-center items-center gap-10">
        <p className="text-sm">
          {labelShowing || "Showing"} <span className="font-medium">{rows}{' '}</span>{labelResults || "results"}
        </p>
        <div className="w-10 h-10">
          <MenuList 
            buttonLabel={`${pageSize} páginas`}
            menuOptions={pageSizeOptions}
            onChange={(_pageSize) => setPageSize(_pageSize)}
          />
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <CustomButton disabled={!previousEnabled} onClick={onPreviousPage}>
          {previousLabel || "Previous"}
        </CustomButton>
        <CustomButton disabled={!nextEnabled} onClick={onNextPage}>
          {nextLabel || "Next"}
        </CustomButton>
      </div>
    </nav>
  )
}
