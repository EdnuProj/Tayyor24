import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import type { CourierTransaction, Courier } from "@shared/schema";

interface TransactionWithCourier extends CourierTransaction {
  courierName?: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminPayments() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: transactions = [], isLoading: transLoading } = useQuery<
    TransactionWithCourier[]
  >({
    queryKey: ["/api/courier-transactions"],
  });

  const { data: couriers = [] } = useQuery<Courier[]>({
    queryKey: ["/api/couriers"],
  });

  const courierMap = useMemo(() => {
    const map: Record<string, string> = {};
    couriers.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [couriers]);

  // Enrich transactions with courier names
  const enrichedTransactions = useMemo(() => {
    return transactions.map((tx) => ({
      ...tx,
      courierName: courierMap[tx.courierId] || "Noma'lum",
    }));
  }, [transactions, courierMap]);

  const filteredTransactions = enrichedTransactions.filter((tx) =>
    tx.courierName?.toLowerCase().includes(search.toLowerCase()) ||
    tx.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIdx, endIdx);

  const stats = {
    total: filteredTransactions.length,
    totalAmount: filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    debitCount: filteredTransactions.filter((tx) => tx.amount < 0).length,
    debitAmount: filteredTransactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
  };

  return (
    <AdminLayout title="Kuryerlar Puli">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Jami Tranzaksiya</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Yechilgan Summa</p>
            <p className="text-2xl font-bold text-red-600">
              {formatPrice(stats.debitAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Yechilgan Marta</p>
            <p className="text-2xl font-bold">{stats.debitCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">O'rtacha</p>
            <p className="text-2xl font-bold">
              {stats.debitCount > 0
                ? formatPrice(stats.debitAmount / stats.debitCount)
                : "0 so'm"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-lg">Pul Yechilish Tarixi</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kuryer yoki ta'rif bo'yicha qidirish..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-[250px]"
              data-testid="input-search-transactions"
            />
          </div>
        </CardHeader>
        <CardContent>
          {transLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Pul yechilishi topilmadi</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kuryer</TableHead>
                      <TableHead>Summa</TableHead>
                      <TableHead>Turi</TableHead>
                      <TableHead>Zakaz</TableHead>
                      <TableHead>Sana va Vaqt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <p className="font-medium">{tx.courierName}</p>
                        </TableCell>
                        <TableCell>
                          <p
                            className={`font-bold ${
                              tx.amount < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {tx.amount < 0 ? "-" : "+"}
                            {formatPrice(Math.abs(tx.amount))}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm bg-muted px-2 py-1 rounded">
                            {tx.type === "order_debit"
                              ? "Zakaz Yechildi"
                              : "To'plov"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {tx.orderId ? `#${tx.orderId.slice(0, 8)}` : "-"}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tx.createdAt
                            ? format(new Date(tx.createdAt), "dd.MM.yyyy HH:mm")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {startIdx + 1} - {Math.min(endIdx, filteredTransactions.length)} / {filteredTransactions.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Orqasi
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(
                          Math.max(0, currentPage - 2),
                          Math.min(totalPages, currentPage + 1)
                        )
                        .map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            data-testid={`button-page-${page}`}
                          >
                            {page}
                          </Button>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      Keyingi
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
