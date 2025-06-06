"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useState } from "react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import toast from "react-hot-toast";

export default function Ttable({
  data,
  setData,
  email,
  name,
  setLastPaid,
}) {
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  console.log(thirtyDaysAgo);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStake, setNewStake] = useState({
    id: "",
    name: "",
    coinName: "", 
    coinSymbol: "",
    description: "",
    percentageRage: "",
    cryptoMinimum: 0.001,
    cycle: "Monthly",
    durations: [
      { months: 1, percentage: 5 }
    ]
  });

  const columns = [
    {
      id: "select",
      header: "Notif",
      cell: ({ row }) => (
        <>
          {!(new Date(row.original.lastPaid) >= thirtyDaysAgo) && (
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
          )}
        </>
      ),
    },
    {
      accessorKey: "stakedAsset",
      header: "Asset ",
      cell: ({ row }) => <div>{row.getValue("stakedAsset")}</div>,
    },

    {
      accessorKey: "stakedAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-bold"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "stakedDuration",
      header: "Duration (months)",
      cell: ({ row }) => <div>{row.getValue("stakedDuration")}</div>,
    },
    {
      accessorKey: "monthsLeft",
      header: "Months Left",
      cell: ({ row }) => (
        <div>
          {" "}
          {Math.floor(
            row.original.stakedDuration -
              (new Date() - row.original.dateStaked) /
                (30 * 24 * 60 * 60 * 1000)
          )}
        </div>
      ),
    },
    {
      accessorKey: "monthlyReturns",
      header: "Monthly Returns",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("monthlyReturns"));
        const symbol = row.original.stakedAssetSymbol;
        return <div className="lowercase">{amount.toFixed(6)} {symbol}</div>;
      },
    },
    {
      accessorKey: "totalReturns",
      header: "Total Returns",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalReturns"));
        const symbol = row.original.stakedAssetSymbol;
        return <div className="lowercase">{amount.toFixed(6)} {symbol}</div>;
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const stake = row.original;
        const isPaid = new Date(row.original.lastPaid) >= thirtyDaysAgo;
        const isPending = row.original.status.toLowerCase() === "pending";
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Show payment proof if available */}
              {stake.paymentProofUrl && (
                <DropdownMenuItem
                  className="font-bold py-2"
                  onClick={() => window.open(stake.paymentProofUrl, "_blank")}
                >
                  View Payment Proof
                </DropdownMenuItem>
              )}
              
              {/* Approve pending stake */}
              {isPending && (
                <DropdownMenuItem
                  className="font-bold py-2 text-green-600"
                  onClick={() => {
                    const proceed = confirm(
                      "Approve this staking request?"
                    );
                    if (proceed)
                      updateTransactionStatus(
                        stake.id,
                        "active",
                        0,
                        stake.stakedAsset,
                        true
                      );
                  }}
                >
                  Approve Staking
                </DropdownMenuItem>
              )}
              
              {/* Reject pending stake */}
              {isPending && (
                <DropdownMenuItem
                  className="font-bold py-2 text-red-600"
                  onClick={() => {
                    const proceed = confirm(
                      "Reject this staking request?"
                    );
                    if (proceed)
                      updateTransactionStatus(
                        stake.id,
                        "rejected",
                        0,
                        stake.stakedAsset
                      );
                  }}
                >
                  Reject Staking
                </DropdownMenuItem>
              )}

              {/* Complete stake if duration is finished */}
              {Math.floor(
                row.original.stakedDuration -
                  (new Date() - row.original.dateStaked) /
                    (30 * 24 * 60 * 60 * 1000)
              ) < 0 &&
                row.original.status.toLowerCase() === "active" && (
                  <DropdownMenuItem
                    className="bg-re-50 fnt-bold py-2"
                    onClick={() => {
                      const proceed = confirm(
                        "Complete this stake and pay returns?"
                      );
                      if (proceed)
                        updateTransactionStatus(
                          stake.id,
                          "completed",
                          parseFloat(stake.monthlyReturns),
                          stake.stakedAsset
                        );
                    }}
                  >
                    Set to Completed & Pay total
                  </DropdownMenuItem>
                )}

              {/* Pay monthly returns for active stake */}
              {Math.floor(
                row.original.stakedDuration -
                  (new Date() - row.original.dateStaked) /
                    (30 * 24 * 60 * 60 * 1000)
              ) >= 0 &&
                !isPaid &&
                row.original.status.toLowerCase() === "active" && (
                  <DropdownMenuItem
                    className="bg-re-50 fot-bold py-2"
                    onClick={() => {
                      const proceed = confirm(
                        "Pay monthly returns for this stake?"
                      );
                      if (proceed)
                        updateTransactionStatus(
                          stake.id,
                          "active",
                          parseFloat(stake.monthlyReturns),
                          stake.stakedAsset
                        );
                    }}
                  >
                    Pay monthly returns
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const updateTransactionStatus = async (stakeId, newStatus, amount, asset, isApproval = false) => {
    try {
      // Make a POST request to your backend API to update the transaction status
      const response = await fetch(`/db/adminStake/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          stakeId,
          newStatus,
          amount,
          asset,
          name,
          isApproval: isApproval,
        }),
      });

      if (response.ok) {
        // Transaction status updated successfully on the backend, update the frontend
        const updatedData = data.map((stake) => {
          if (stake.id === stakeId) {
            // Update the transaction status
            let statusMessage = newStatus === "active" ? "activated" : 
                                newStatus === "completed" ? "completed" :
                                newStatus === "rejected" ? "rejected" : "updated";
            toast.success(`Stake ${statusMessage} & notification sent`);

            return { ...stake, status: newStatus };
          }
          return stake;
        });
        
        // Update the state with the new data
        setLastPaid(Date.now());
        setData(updatedData);
      } else {
        // Handle error cases when the backend update fails
        console.error("Failed to update transaction status on the backend");
      }
    } catch (error) {
      console.error("Error while updating transaction status:", error);
    }
  };

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
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

  // Add this function to create new staking option
  const handleCreateStake = async () => {
    // Validate form
    if (!newStake.coinName || !newStake.coinSymbol || !newStake.durations.length) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch("/api/admin/stakes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStake),
      });

      if (response.ok) {
        toast.success("New staking option created successfully");
        setShowCreateModal(false);
        // Reset form
        setNewStake({
          id: "",
          name: "",
          coinName: "",
          coinSymbol: "",
          description: "",
          percentageRage: "",
          cryptoMinimum: 0.001,
          cycle: "Monthly",
          durations: [
            { months: 1, percentage: 5 }
          ]
        });
      } else {
        toast.error("Failed to create staking option");
      }
    } catch (error) {
      console.error("Error creating staking option:", error);
      toast.error("Failed to create staking option");
    }
  };
  
  // Add this to add duration to new stake
  const addDuration = () => {
    setNewStake({
      ...newStake,
      durations: [...newStake.durations, { months: 1, percentage: 5 }]
    });
  };
  
  // Add this to remove duration from new stake
  const removeDuration = (index) => {
    const newDurations = [...newStake.durations];
    newDurations.splice(index, 1);
    setNewStake({
      ...newStake,
      durations: newDurations
    });
  };
  
  // Add this to update duration values
  const updateDuration = (index, field, value) => {
    const newDurations = [...newStake.durations];
    newDurations[index][field] = field === "months" ? parseInt(value) : parseFloat(value);
    setNewStake({
      ...newStake,
      durations: newDurations
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-x-2 py-4">
        <Input
          placeholder="Search by Asset..."
          value={table.getColumn("stakedAsset")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("stakedAsset")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto text-sm md:text-base font-bold"
            >
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ScrollArea className="">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border px-2 max-w-[100vw]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-bold text-black">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-8">
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
                  No results.
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
