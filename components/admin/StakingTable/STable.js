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
import { ArrowUpDown, ChevronDown, MoreHorizontal, ExternalLink } from "lucide-react";

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
  showUserInfo = false,
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
      accessorKey: "isJoint",
      header: "Type",
      cell: ({ row }) => (
        <div>
          {row.original.isJoint ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Joint
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Sole
            </span>
          )}
        </div>
      ),
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
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("stakedAmount"));
        const symbol = row.original.stakedAssetSymbol;
        
        if (row.original.isJoint) {
          return (
            <div>
              <div className="font-medium">{amount.toFixed(6)} {symbol}</div>
              <div className="text-xs text-gray-500">
                Initiator: {(amount * (row.original.initiatorPercentage / 100)).toFixed(6)} {symbol} ({row.original.initiatorPercentage}%)
                <br />
                Partner: {(amount * (row.original.partnerPercentage / 100)).toFixed(6)} {symbol} ({row.original.partnerPercentage}%)
              </div>
            </div>
          );
        }
        
        return <div>{amount.toFixed(6)} {symbol}</div>;
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
      id: "partnerInfo",
      header: "Partner Info",
      cell: ({ row }) => {
        if (!row.original.isJoint) return <div className="text-gray-400">N/A</div>;
        
        return (
          <div className="text-sm">
            <div>{row.original.partnerEmail}</div>
            {row.original.partnerStatus && (
              <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                row.original.partnerStatus === "pending" 
                  ? "bg-yellow-100 text-yellow-800" 
                  : row.original.partnerStatus === "accepted" 
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {row.original.partnerStatus.charAt(0).toUpperCase() + row.original.partnerStatus.slice(1)}
              </div>
            )}
          </div>
        );
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
      id: "payment",
      header: "Payment",
      cell: ({ row }) => {
        const stake = row.original;
        
        if (stake.isJoint) {
          return (
            <div className="text-sm">
              <div className="font-medium">Initiator Payment</div>
              <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                stake.initiatorPaymentStatus === "completed" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {stake.initiatorPaymentStatus ? stake.initiatorPaymentStatus.charAt(0).toUpperCase() + stake.initiatorPaymentStatus.slice(1) : "Pending"}
              </div>
              
              <div className="font-medium mt-2">Partner Payment</div>
              <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                stake.partnerDepositStatus === "completed" 
                  ? "bg-green-100 text-green-800" 
                  : stake.partnerStatus !== "accepted"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {stake.partnerStatus !== "accepted" 
                  ? "Awaiting Acceptance" 
                  : stake.partnerDepositStatus 
                    ? stake.partnerDepositStatus.charAt(0).toUpperCase() + stake.partnerDepositStatus.slice(1) 
                    : "Pending"}
              </div>
              
              {stake.partnerPaymentProof && (
                <button 
                  onClick={() => window.open(stake.partnerPaymentProof, "_blank")}
                  className="text-xs text-blue-600 underline mt-1 flex items-center"
                >
                  View Proof <ExternalLink className="ml-1 h-3 w-3" />
                </button>
              )}
            </div>
          );
        }
        
        return (
          <div className="text-sm">
            <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              stake.paymentStatus === "completed" 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {stake.paymentStatus ? stake.paymentStatus.charAt(0).toUpperCase() + stake.paymentStatus.slice(1) : "Pending"}
            </div>
            
            {stake.paymentProofUrl && (
              <button 
                onClick={() => window.open(stake.paymentProofUrl, "_blank")}
                className="text-xs text-blue-600 underline mt-1 flex items-center"
              >
                View Proof <ExternalLink className="ml-1 h-3 w-3" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const stake = row.original;
        const isPaid = new Date(row.original.lastPaid) >= thirtyDaysAgo;
        const isPending = row.original.status.toLowerCase() === "pending" || row.original.status.toLowerCase() === "awaiting_verification";
        const isJoint = stake.isJoint;
        const partnerStatus = stake.partnerStatus;

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

              {stake.paymentProofUrl && (
                <DropdownMenuItem
                  className="font-bold py-2"
                  onClick={() => window.open(stake.paymentProofUrl, "_blank")}
                >
                  View Payment Proof
                </DropdownMenuItem>
              )}
              
              {stake.partnerPaymentProof && (
                <DropdownMenuItem
                  className="font-bold py-2"
                  onClick={() => window.open(stake.partnerPaymentProof, "_blank")}
                >
                  View Partner Payment Proof
                </DropdownMenuItem>
              )}
              
              {isJoint && partnerStatus === "pending" && isPending && (
                <DropdownMenuItem
                  className="font-bold py-2 text-yellow-600 cursor-default"
                >
                  Awaiting Partner Acceptance
                </DropdownMenuItem>
              )}
              
              {isPending && (!isJoint || (isJoint && partnerStatus === "accepted")) && (
                <DropdownMenuItem
                  className="font-bold py-2 text-green-600"
                  onClick={() => {
                    const proceed = confirm(
                      "Verify this transaction request?"
                    );
                    if (proceed)
                      updateTransactionStatus(stake.id, "active", stake.stakedAmount, stake.stakedAsset, true, stake.isJoint, stake.partnerEmail);
                  }}
                >
                  Verify Transaction
                </DropdownMenuItem>
              )}
              
              {isPending && (
                <DropdownMenuItem
                  className="font-bold py-2 text-red-600"
                  onClick={() => {
                    const proceed = confirm(
                      "Reject this transaction request?"
                    );
                    if (proceed)
                      updateTransactionStatus(stake.id, "rejected", stake.stakedAmount, stake.stakedAsset, false, stake.isJoint, stake.partnerEmail);
                  }}
                >
                  Reject Transaction
                </DropdownMenuItem>
              )}

              {!isPaid && !isPending && (
                  <DropdownMenuItem
                  className="font-bold py-2 text-green-600"
                    onClick={() => {
                      const proceed = confirm(
                      "Mark this transaction as paid for this month?"
                      );
                    if (proceed) {
                      fetch("/db/payStaking", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          email: email,
                          id: stake.id,
                        }),
                      })
                        .then((response) => response.json())
                        .then((data) => {
                          if (data.success) {
                            toast.success("Payment marked successfully!");
                            setLastPaid(Date.now());
                          } else {
                            toast.error("Failed to mark payment");
                          }
                        })
                        .catch((error) => {
                          console.error("Error:", error);
                          toast.error("An error occurred while marking payment");
                        });
                    }
                    }}
                  >
                  Mark as Paid
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const getColumns = () => {
    let cols = [...columns];
    
    if (showUserInfo) {
      cols.splice(2, 0, {
        id: "userInfo",
        header: "User",
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-medium">{row.original.userName || "Unknown"}</div>
            <div className="text-xs text-gray-500">{row.original.userEmail}</div>
          </div>
        ),
      });
    }
    
    return cols;
  };

  const updateTransactionStatus = async (stakeId, newStatus, amount, asset, isApproval = false, isJoint, partnerEmail) => {
    try {
      const response = await fetch(`/db/adminStake/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakeId,
          newStatus,
          amount,
          email,
          name,
          isApproval: isApproval,
          isJoint,
          partnerEmail,
        }),
      });

      if (response.ok) {
        const updatedData = data.map((stake) => {
          if (stake.id === stakeId) {
            let statusMessage = newStatus === "active" ? "activated" : 
                                newStatus === "completed" ? "completed" :
                                "rejected";
                                
            // Create appropriate notification messages
            let notificationText = "";
            
            switch(newStatus) {
              case "active":
                notificationText = `Your staking request of ${stake.stakedAmount} ${stake.stakedAssetSymbol} has been approved.`;
                break;
              case "completed":
                notificationText = `Your staking of ${stake.stakedAmount} ${stake.stakedAssetSymbol} has been completed with a total return of ${stake.totalReturns} ${stake.stakedAssetSymbol}.`;
                break;
              case "rejected":
                notificationText = `Your staking request of ${stake.stakedAmount} ${stake.stakedAssetSymbol} has been rejected.`;
                break;
              default:
                notificationText = `Your staking status has been updated to ${newStatus}.`;
            }
            
            // For joint stakings, notify the partner as well
            if (isJoint && partnerEmail) {
              sendNotificationToPartner(partnerEmail, stake, newStatus, notificationText);
            }
            
            // Log the status change
            toast.success(`Staking ${statusMessage} successfully!`);
            
            // Return updated stake data
            return { ...stake, status: newStatus, lastPaid: new Date() };
          }
          return stake;
        });

        setLastPaid(Date.now());
        setData(updatedData);
      } else {
        console.error("Failed to update transaction status on the backend");
        toast.error("Failed to update staking status");
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      toast.error("Error updating staking status");
    }
  };

  // Helper function to send notification to partner in joint stakings
  const sendNotificationToPartner = async (partnerEmail, stake, newStatus, notificationText) => {
    try {
      await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: partnerEmail,
          message: notificationText,
          category: "staking",
          status: newStatus === "active" ? "approved" : 
                  newStatus === "completed" ? "completed" : "rejected"
        }),
      });
    } catch (error) {
      console.error("Error sending notification to partner:", error);
    }
  };

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: getColumns(),
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

  const handleCreateStake = async () => {
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
  
  const addDuration = () => {
    setNewStake({
      ...newStake,
      durations: [...newStake.durations, { months: 1, percentage: 5 }]
    });
  };
  
  const removeDuration = (index) => {
    const newDurations = [...newStake.durations];
    newDurations.splice(index, 1);
    setNewStake({
      ...newStake,
      durations: newDurations
    });
  };
  
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
