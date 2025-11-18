import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Row,
} from "@tanstack/react-table";
import { useUsers, useSuspendUser, useActivateUser, useResetUserPassword } from "@/hooks/useAdmin";
import type { AdminUser } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Search, Ban, CheckCircle, Key, User } from "lucide-react";
import { format } from "date-fns";
import { UserDetailModal } from "./UserDetailModal";
import { cn } from "@/lib/utils";

export function UserManagementTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const { data: users = [], isLoading } = useUsers({
    search: searchQuery || undefined,
  });

  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const resetPassword = useResetUserPassword();

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Name",
        cell: ({ row }: { row: Row<AdminUser> }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#F4F0FF] flex items-center justify-center">
                <User className="h-4 w-4 text-[#9D79F9]" />
              </div>
              <div>
                <div className="font-medium text-[#1A1A1A]">
                  {user.full_name || "No name"}
                </div>
                <div className="text-sm text-[#7A7A7A]">{user.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }: { row: Row<AdminUser> }) => (
          <span className="text-[#7A7A7A]">{row.original.company || "—"}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }: { row: Row<AdminUser> }) => {
          const role = row.original.role;
          return (
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                role === "architect" && "bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]",
                role === "project_manager" && "bg-[#F0F8FF] text-[#6AD8FA] border-[#6AD8FA]"
              )}
            >
              {role || "—"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: Row<AdminUser> }) => {
          const status = row.original.status;
          return (
            <Badge
              className={cn(
                status === "active"
                  ? "bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]"
                  : "bg-[#FFE6E6] text-[#FF7A7A] border-[#FF7A7A]"
              )}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "email_verified",
        header: "Verified",
        cell: ({ row }: { row: Row<AdminUser> }) => (
          <Badge
            variant="outline"
            className={cn(
              row.original.email_verified
                ? "bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]"
                : "bg-[#FFFBE6] text-[#F6C96B] border-[#F6C96B]"
            )}
          >
            {row.original.email_verified ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        accessorKey: "last_active",
        header: "Last Active",
        cell: ({ row }: { row: Row<AdminUser> }) => {
          const lastActive = row.original.last_active;
          return (
            <span className="text-[#7A7A7A] text-sm">
              {lastActive ? format(new Date(lastActive), "MMM d, yyyy") : "Never"}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }: { row: Row<AdminUser> }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {user.status === "active" ? (
                  <DropdownMenuItem
                    onClick={() => suspendUser.mutate({ userId: user.id })}
                    className="text-[#FF7A7A]"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => activateUser.mutate(user.id)}
                    className="text-[#5FD37B]"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate User
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => resetPassword.mutate(user.id)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [suspendUser, activateUser, resetPassword]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7A7A7A]" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
        <div className="text-sm text-[#7A7A7A]">
          {users.length} user{users.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#E5E7EB] rounded-[18px] overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-[#F7FAFC]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[#7A7A7A] font-medium">
                    {header.isPlaceholder
                      ? null
                      : (header.column.columnDef.header as string)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-[#F7FAFC] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.renderValue() as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-[#7A7A7A]"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-[#7A7A7A]">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            users.length
          )}{" "}
          of {users.length} users
        </div>
        <div className="flex items-center gap-2">
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

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          open={showUserModal}
          onOpenChange={setShowUserModal}
        />
      )}
    </div>
  );
}
