"use client";

import { useState, useEffect } from "react";
import UserOnly from "@/components/UserOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Loader2,
  FilterIcon,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchUpcomingBookings,
  fetchPastBookings,
  selectUpcomingBookings,
  selectPastBookings,
  selectBookingsLoading,
  selectBookingsError,
} from "@/store/slices/bookingSlice";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react"; // Added missing import for React

// Data table columns for bookings
const createColumns = () => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const booking = row.original;
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };
      return (
        <div className="flex flex-col">
          <span className="font-medium">{formatDate(booking.slot?.date)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      const booking = row.original;
      const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        );
      };
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {formatTime(booking.slot?.startTime)}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatTime(booking.slot?.endTime)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <div className="max-w-[200px]">
          <span className="text-sm">{booking.reasonForVisit}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const booking = row.original;
      return <div className="text-sm">{booking.contactNumber}</div>;
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <div className="max-w-[200px]">
          <span className="text-sm text-muted-foreground">
            {booking.additionalNotes || "No notes"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const booking = row.original;
      const getStatusBadge = (status) => {
        switch (status) {
          case "confirmed":
            return (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Confirmed
              </Badge>
            );
          case "cancelled":
            return (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                Cancelled
              </Badge>
            );
          case "completed":
            return (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                Completed
              </Badge>
            );
          default:
            return <Badge variant="secondary">{status}</Badge>;
        }
      };
      return getStatusBadge(booking.status);
    },
  },
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    cell: ({ row }) => {
      const booking = row.original;
      return <div className="text-sm text-muted-foreground">{booking.id}</div>;
    },
  },
];

// Data table component for bookings
function BookingsDataTable({ data, loading }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

  const columns = createColumns();

  // Filter data based on status
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (statusFilter === "all") return data;
    return data.filter((booking) => booking.status === statusFilter);
  }, [data, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-end items-center py-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No appointments found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const dispatch = useAppDispatch();
  const upcomingBookings = useAppSelector(selectUpcomingBookings);
  const pastBookings = useAppSelector(selectPastBookings);
  const loading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);

  console.log(
    "My Bookings - upcomingBookings:",
    upcomingBookings,
    "pastBookings:",
    pastBookings,
    "loading:",
    loading,
    "error:",
    error
  );

  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    console.log("=== FETCHING MY BOOKINGS ===");
    dispatch(fetchUpcomingBookings())
      .then((result) => {
        console.log("fetchUpcomingBookings result:", result);
      })
      .catch((error) => {
        console.error("fetchUpcomingBookings error:", error);
      });
    dispatch(fetchPastBookings())
      .then((result) => {
        console.log("fetchPastBookings result:", result);
      })
      .catch((error) => {
        console.error("fetchPastBookings error:", error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error.message || "Failed to load bookings"
      );
    }
  }, [error]);

  return (
    <UserOnly>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your appointments
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <BookingsDataTable data={upcomingBookings} loading={loading} />
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <BookingsDataTable data={pastBookings} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </UserOnly>
  );
}
